import { User, ServiceCatalogItem, ServiceRequest, Announcement, CommunityConcern, AuditLogItem, RequestStatus } from '../types';

const TOKEN_KEY = 'lumangbayan_auth_token';

export const authStorage = {
  getToken(): string | null {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  setToken(token: string) {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.warn('Storage set error:', e);
    }
  },
  clearToken() {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(TOKEN_KEY);
    } catch (e) {
      console.warn('Storage clear error:', e);
    }
  }
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(path, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}: Failed to perform action`);
  }

  return data as T;
}

export const api = {
  // Auth
  async login(identifier: string, password: string): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    authStorage.setToken(res.token);
    return res;
  },

  async register(data: {
    fullName: string;
    email: string;
    password: string;
    phone?: string;
    purok?: string;
    address?: string;
    username?: string;
  }): Promise<{ user: User; token: string }> {
    const res = await request<{ user: User; token: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    authStorage.setToken(res.token);
    return res;
  },

  async logout(): Promise<void> {
    try {
      await request('/api/auth/logout', { method: 'POST' });
    } finally {
      authStorage.clearToken();
    }
  },

  async forgotPassword(email: string, newPassword?: string): Promise<{ success: boolean; message: string; verified?: boolean }> {
    return request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email, newPassword })
    });
  },

  async getMe(): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/me');
  },

  async updateProfile(data: Partial<User>): Promise<{ user: User }> {
    return request<{ user: User }>('/api/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Services
  async getServices(): Promise<ServiceCatalogItem[]> {
    return request<ServiceCatalogItem[]>('/api/services');
  },

  async updateService(id: string, data: { fee?: number; isOnlineEnabled?: boolean; requirements?: any[] }): Promise<{ success: boolean }> {
    return request(`/api/services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  // Requests
  async getRequests(): Promise<ServiceRequest[]> {
    return request<ServiceRequest[]>('/api/requests');
  },

  async createRequest(data: {
    serviceId: string;
    serviceName: string;
    purpose: string;
    customDetails?: string;
    fee?: number;
    submittedDocuments: any[];
  }): Promise<ServiceRequest> {
    return request<ServiceRequest>('/api/requests', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async updateRequestStatus(
    id: string,
    data: {
      status: RequestStatus;
      adminNote?: string;
      captainRemarks?: string;
      orNumber?: string;
      pickupDate?: string;
      certificateNumber?: string;
    }
  ): Promise<{ success: boolean; certificateNumber?: string }> {
    return request(`/api/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    });
  },

  // Announcements
  async getAnnouncements(): Promise<Announcement[]> {
    return request<Announcement[]>('/api/announcements');
  },

  async createAnnouncement(data: { title: string; body: string; category: string }): Promise<Announcement> {
    return request<Announcement>('/api/announcements', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  async deleteAnnouncement(id: string): Promise<void> {
    return request(`/api/announcements/${id}`, { method: 'DELETE' });
  },

  async togglePinAnnouncement(id: string): Promise<void> {
    return request(`/api/announcements/${id}/pin`, { method: 'PATCH' });
  },

  // Concerns
  async getConcerns(): Promise<CommunityConcern[]> {
    return request<CommunityConcern[]>('/api/concerns');
  },

  async createConcern(data: { category: string; subject: string; description: string; isUrgent?: boolean }): Promise<{ id: string; referenceNumber: string }> {
    return request('/api/concerns', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // Admin
  async getAdminResidents(): Promise<User[]> {
    return request<User[]>('/api/admin/residents');
  },

  async getAdminAuditLogs(): Promise<AuditLogItem[]> {
    return request<AuditLogItem[]>('/api/admin/audit-logs');
  },

  // Public Track Lookup
  async trackReference(ref: string): Promise<any> {
    return request(`/api/track/${encodeURIComponent(ref)}`);
  }
};
