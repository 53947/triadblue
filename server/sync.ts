import type { Task } from "@shared/schema";

export interface SyncPayload {
  taskId: string;
  status: string;
  priority?: string;
  title?: string;
  description?: string;
  updatedAt: Date;
}

export class SyncService {
  private maxRetries = 3;
  private retryDelay = 1000; // Base delay in ms

  /**
   * Sync a task status update to an external endpoint
   */
  async syncTaskUpdate(task: Task): Promise<{ success: boolean; error?: string }> {
    if (!task.syncEnabled || !task.syncUrl) {
      return { success: false, error: "Sync not enabled or URL not configured" };
    }

    const payload: SyncPayload = {
      taskId: task.id,
      status: task.status,
      priority: task.priority,
      title: task.title,
      description: task.description || undefined,
      updatedAt: task.updatedAt,
    };

    try {
      const response = await fetch(task.syncUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        return {
          success: false,
          error: `HTTP ${response.status}: ${errorText}`,
        };
      }

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Unknown error during sync",
      };
    }
  }

  /**
   * Sync with retry logic
   */
  async syncWithRetry(
    task: Task,
    currentRetryCount: number = 0
  ): Promise<{ success: boolean; error?: string; retries: number }> {
    const result = await this.syncTaskUpdate(task);

    if (result.success) {
      return { success: true, retries: currentRetryCount };
    }

    // If failed and we haven't exceeded max retries, try again
    if (currentRetryCount < this.maxRetries) {
      const delay = this.retryDelay * Math.pow(2, currentRetryCount); // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, delay));
      return this.syncWithRetry(task, currentRetryCount + 1);
    }

    // Max retries exceeded
    return {
      success: false,
      error: result.error || "Max retries exceeded",
      retries: currentRetryCount,
    };
  }

  /**
   * Test a sync URL to verify connectivity
   */
  async testSyncConnection(syncUrl: string): Promise<{ success: boolean; error?: string }> {
    try {
      const response = await fetch(syncUrl, {
        method: "HEAD",
      });

      if (response.ok) {
        return { success: true };
      }

      return {
        success: false,
        error: `HTTP ${response.status}`,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Connection test failed",
      };
    }
  }
}

export const syncService = new SyncService();
