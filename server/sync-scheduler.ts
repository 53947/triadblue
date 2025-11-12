import type { Task } from "@shared/schema";
import { syncService } from "./sync";
import type { IStorage } from "./storage";

interface SyncJob {
  taskId: string;
  currentTask: Task; // Task snapshot being synced
  latestSnapshot: Task; // Most recent task state (may be newer than currentTask)
  retryCount: number;
  nextRetryAt: Date;
  status: "pending" | "processing" | "completed" | "failed";
}

export class SyncScheduler {
  private queue: Map<string, SyncJob> = new Map();
  private processing = false;
  private storage: IStorage;
  private pollInterval = 5000; // Check for jobs every 5 seconds
  private pollTimer: NodeJS.Timeout | null = null;

  constructor(storage: IStorage) {
    this.storage = storage;
  }

  /**
   * Start the background worker that processes sync jobs
   */
  start() {
    if (this.pollTimer) return; // Already running

    this.pollTimer = setInterval(async () => {
      await this.processQueue();
    }, this.pollInterval);

    console.log("SyncScheduler started");
  }

  /**
   * Stop the background worker
   */
  stop() {
    if (this.pollTimer) {
      clearInterval(this.pollTimer);
      this.pollTimer = null;
      console.log("SyncScheduler stopped");
    }
  }

  /**
   * Enqueue a sync job for a task
   */
  async enqueue(task: Task, immediate = false): Promise<void> {
    if (!task.syncEnabled || !task.syncUrl) {
      console.log(`Skipping sync for task ${task.id} - sync not enabled or URL missing`);
      return;
    }

    const existingJob = this.queue.get(task.id);
    
    // If job exists (regardless of status), always update latestSnapshot
    if (existingJob) {
      console.log(`Updating latest snapshot for task ${task.id} (status: ${existingJob.status})`);
      existingJob.latestSnapshot = task;
      
      // If job is pending and not processing, also update currentTask
      if (existingJob.status === "pending") {
        existingJob.currentTask = task;
        existingJob.nextRetryAt = immediate ? new Date() : new Date(Date.now() + 1000);
      }
      
      // If immediate, process right away
      if (immediate) {
        await this.processQueue();
      }
      return;
    }

    // Create new job
    const job: SyncJob = {
      taskId: task.id,
      currentTask: task,
      latestSnapshot: task,
      retryCount: task.syncRetryCount || 0,
      nextRetryAt: immediate ? new Date() : new Date(Date.now() + 1000), // 1 second delay
      status: "pending",
    };

    this.queue.set(task.id, job);
    console.log(`Enqueued sync job for task ${task.id}`);

    // Update task status to syncing
    await this.storage.updateTask(task.id, {
      syncStatus: "syncing",
    });

    // If immediate, process right away
    if (immediate) {
      await this.processQueue();
    }
  }

  /**
   * Process all pending jobs in the queue
   */
  private async processQueue(): Promise<void> {
    if (this.processing) return;

    this.processing = true;

    try {
      const now = new Date();
      const jobsToProcess: SyncJob[] = [];

      // Find jobs ready to process
      for (const job of Array.from(this.queue.values())) {
        if (job.status === "pending" && job.nextRetryAt <= now) {
          jobsToProcess.push(job);
        }
      }

      // Process each job
      for (const job of jobsToProcess) {
        await this.processJob(job);
      }
    } finally {
      this.processing = false;
    }
  }

  /**
   * Process a single sync job
   */
  private async processJob(job: SyncJob): Promise<void> {
    job.status = "processing";
    
    // Capture the task snapshot we're about to sync
    const syncingTask = job.currentTask;
    
    console.log(`Processing sync job for task ${job.taskId} (attempt ${job.retryCount + 1})`);

    const result = await syncService.syncTaskUpdate(syncingTask);

    if (result.success) {
      // Success - update task and check if there's a newer snapshot to sync
      await this.storage.updateTask(job.taskId, {
        syncStatus: "success",
        lastSyncAt: new Date(),
        syncRetryCount: 0,
        syncError: null,
      });

      // Check if latestSnapshot is newer than what we just synced
      const hasNewerSnapshot = job.latestSnapshot.updatedAt > syncingTask.updatedAt;
      
      if (hasNewerSnapshot) {
        console.log(`Re-enqueueing task ${job.taskId} with newer snapshot`);
        const newerTask = job.latestSnapshot;
        this.queue.delete(job.taskId); // Remove current job
        await this.enqueue(newerTask, false); // Enqueue the newer snapshot
      } else {
        this.queue.delete(job.taskId);
        console.log(`Successfully synced task ${job.taskId}`);
      }
    } else {
      // Failed - check if we should retry
      job.retryCount++;

      if (job.retryCount >= 3) {
        // Max retries exceeded - check if there's a newer snapshot to try
        await this.storage.updateTask(job.taskId, {
          syncStatus: "failed",
          syncRetryCount: job.retryCount,
          syncError: result.error || "Max retries exceeded",
        });

        const hasNewerSnapshot = job.latestSnapshot.updatedAt > syncingTask.updatedAt;
        
        if (hasNewerSnapshot) {
          console.log(`Re-enqueueing task ${job.taskId} with newer snapshot despite previous failure`);
          const newerTask = job.latestSnapshot;
          this.queue.delete(job.taskId);
          await this.enqueue(newerTask, false);
        } else {
          this.queue.delete(job.taskId);
          console.log(`Sync failed for task ${job.taskId} after ${job.retryCount} attempts: ${result.error}`);
        }
      } else {
        // Schedule retry with exponential backoff
        // Update currentTask to latest snapshot for next retry
        job.currentTask = job.latestSnapshot;
        const delayMs = 1000 * Math.pow(2, job.retryCount); // 2s, 4s, 8s
        job.nextRetryAt = new Date(Date.now() + delayMs);
        job.status = "pending";

        await this.storage.updateTask(job.taskId, {
          syncStatus: "syncing",
          syncRetryCount: job.retryCount,
          syncError: result.error || "Sync failed, retrying...",
        });

        console.log(`Sync failed for task ${job.taskId}, retrying in ${delayMs}ms with latest snapshot`);
      }
    }
  }

  /**
   * Manually trigger sync for a task
   */
  async manualSync(taskId: string): Promise<{ success: boolean; message: string }> {
    // Fetch fresh task data
    const task = await this.storage.getTask(taskId);
    if (!task) {
      return { success: false, message: "Task not found" };
    }

    if (!task.syncEnabled) {
      return { success: false, message: "Sync not enabled for this task" };
    }

    if (!task.syncUrl) {
      return { success: false, message: "Sync URL not configured" };
    }

    // Enqueue with immediate processing
    await this.enqueue(task, true);
    
    return { success: true, message: "Sync triggered" };
  }

  /**
   * Get sync status for a task
   */
  getSyncStatus(taskId: string): { inQueue: boolean; job?: SyncJob } {
    const job = this.queue.get(taskId);
    return {
      inQueue: !!job,
      job: job ? { ...job } : undefined,
    };
  }
}

// Export singleton instance (will be initialized with storage in routes.ts)
export let syncScheduler: SyncScheduler | null = null;

export function initializeSyncScheduler(storage: IStorage) {
  syncScheduler = new SyncScheduler(storage);
  syncScheduler.start();
  return syncScheduler;
}
