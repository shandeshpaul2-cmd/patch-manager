import axios from 'axios';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export type Notification = {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
  link?: string;
};

const API_BASE_URL = '/api';

export const notificationService = {
  async getNotifications(): Promise<Notification[]> {
    const response = await axios.get(`${API_BASE_URL}/notifications`);
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await axios.get(`${API_BASE_URL}/notifications/unread-count`);
    return response.data.count;
  },

  async markAsRead(id: string): Promise<void> {
    await axios.put(`${API_BASE_URL}/notifications/${id}/read`);
  },

  async markAllAsRead(): Promise<void> {
    await axios.put(`${API_BASE_URL}/notifications/mark-all-read`);
  },

  async deleteNotification(id: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/notifications/${id}`);
  },

  async clearAll(): Promise<void> {
    await axios.delete(`${API_BASE_URL}/notifications`);
  },
};
