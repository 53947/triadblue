import type { IStorage } from "./storage";
import type { Task, Project, InsertNotification } from "@shared/schema";

export class NotificationService {
  private notificationKeys = new Set<string>();

  constructor(private storage: IStorage) {}

  private getNotificationKey(userId: string, type: string, entityId?: string): string {
    return `${userId}:${type}:${entityId || 'none'}`;
  }

  private async checkPreference(userId: string, type: string): Promise<boolean> {
    const preferences = await this.storage.getNotificationPreferences(userId);
    const pref = preferences.find(p => p.type === type);
    return pref ? pref.enabled : true; // default enabled if no preference set
  }

  async createUrgentTaskNotification(userId: string, task: Task, project?: Project): Promise<void> {
    const key = this.getNotificationKey(userId, 'urgent_task', task.id);
    if (this.notificationKeys.has(key)) {
      console.log(`Skipping duplicate urgent_task notification for task ${task.id}`);
      return;
    }

    if (!await this.checkPreference(userId, 'urgent_task')) {
      console.log(`User ${userId} has disabled urgent_task notifications`);
      return;
    }

    const notification: InsertNotification = {
      userId,
      type: 'urgent_task',
      title: 'Urgent Task Created',
      message: `New urgent task: ${task.title}`,
      metadata: JSON.stringify({ taskId: task.id, priority: task.priority }),
      taskId: task.id,
      projectId: task.projectId,
      read: false,
    };

    await this.storage.createNotification(notification);
    this.notificationKeys.add(key);
    console.log(`Created urgent_task notification for task ${task.id}`);
  }

  async createSyncFailedNotification(userId: string, task: Task, error: string): Promise<void> {
    const key = this.getNotificationKey(userId, 'sync_failed', task.id);
    if (this.notificationKeys.has(key)) {
      console.log(`Skipping duplicate sync_failed notification for task ${task.id}`);
      return;
    }

    if (!await this.checkPreference(userId, 'sync_failed')) {
      console.log(`User ${userId} has disabled sync_failed notifications`);
      return;
    }

    const notification: InsertNotification = {
      userId,
      type: 'sync_failed',
      title: 'Task Sync Failed',
      message: `Failed to sync task "${task.title}": ${error}`,
      metadata: JSON.stringify({ taskId: task.id, error, syncUrl: task.syncUrl }),
      taskId: task.id,
      projectId: task.projectId,
      read: false,
    };

    await this.storage.createNotification(notification);
    this.notificationKeys.add(key);
    console.log(`Created sync_failed notification for task ${task.id}`);
  }

  async createTaskDueSoonNotification(userId: string, task: Task): Promise<void> {
    const key = this.getNotificationKey(userId, 'task_due_soon', task.id);
    if (this.notificationKeys.has(key)) {
      console.log(`Skipping duplicate task_due_soon notification for task ${task.id}`);
      return;
    }

    if (!await this.checkPreference(userId, 'task_due_soon')) {
      console.log(`User ${userId} has disabled task_due_soon notifications`);
      return;
    }

    const dueDate = task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'soon';
    const notification: InsertNotification = {
      userId,
      type: 'task_due_soon',
      title: 'Task Due Soon',
      message: `Task "${task.title}" is due ${dueDate}`,
      metadata: JSON.stringify({ taskId: task.id, dueDate: task.dueDate }),
      taskId: task.id,
      projectId: task.projectId,
      read: false,
    };

    await this.storage.createNotification(notification);
    this.notificationKeys.add(key);
    console.log(`Created task_due_soon notification for task ${task.id}`);
  }

  async createWebhookErrorNotification(userId: string, projectId: string, error: string): Promise<void> {
    const key = this.getNotificationKey(userId, 'webhook_error', projectId);
    if (this.notificationKeys.has(key)) {
      console.log(`Skipping duplicate webhook_error notification for project ${projectId}`);
      return;
    }

    if (!await this.checkPreference(userId, 'webhook_error')) {
      console.log(`User ${userId} has disabled webhook_error notifications`);
      return;
    }

    const notification: InsertNotification = {
      userId,
      type: 'webhook_error',
      title: 'Webhook Processing Error',
      message: `Webhook error for project: ${error}`,
      metadata: JSON.stringify({ error, projectId }),
      projectId,
      read: false,
    };

    await this.storage.createNotification(notification);
    this.notificationKeys.add(key);
    console.log(`Created webhook_error notification for project ${projectId}`);
  }

  async createGithubSyncNotification(userId: string, task: Task, issueNumber: number): Promise<void> {
    const key = this.getNotificationKey(userId, 'github_sync', task.id);
    if (this.notificationKeys.has(key)) {
      console.log(`Skipping duplicate github_sync notification for task ${task.id}`);
      return;
    }

    if (!await this.checkPreference(userId, 'github_sync')) {
      console.log(`User ${userId} has disabled github_sync notifications`);
      return;
    }

    const notification: InsertNotification = {
      userId,
      type: 'github_sync',
      title: 'GitHub Issue Created',
      message: `Task "${task.title}" synced to GitHub issue #${issueNumber}`,
      metadata: JSON.stringify({ taskId: task.id, issueNumber, issueUrl: task.githubIssueUrl }),
      taskId: task.id,
      projectId: task.projectId,
      read: false,
    };

    await this.storage.createNotification(notification);
    this.notificationKeys.add(key);
    console.log(`Created github_sync notification for task ${task.id}`);
  }

  async cleanupOldNotifications(daysToKeep: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const count = await this.storage.deleteNotificationsOlderThan(cutoffDate);
    console.log(`Cleaned up ${count} notifications older than ${daysToKeep} days`);
    return count;
  }

  clearIdempotencyCache(): void {
    this.notificationKeys.clear();
    console.log('Notification idempotency cache cleared');
  }
}
