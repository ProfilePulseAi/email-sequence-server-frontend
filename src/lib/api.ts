import { MailBox } from '@/types';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

class ApiService {
  private api: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value?: any) => void;
    reject: (error?: any) => void;
  }> = [];

  constructor() {
    this.api = axios.create({
      baseURL:  'http://localhost:11000/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = Cookies.get('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            // If already refreshing, queue the request
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.api(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = Cookies.get('refresh_token');
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await this.api.post('/refresh/token', {
              refresh_token: refreshToken
            });

            const { access_token, refresh_token: newRefreshToken } = response.data;

            if (access_token) {
              Cookies.set('auth_token', access_token, { expires: 7 });
              originalRequest.headers.Authorization = `Bearer ${access_token}`;
            }

            if (newRefreshToken) {
              Cookies.set('refresh_token', newRefreshToken, { expires: 30 }); // Refresh tokens typically last longer
            }

            // Process queued requests
            this.processQueue(null, access_token);

            return this.api(originalRequest);
          } catch (refreshError) {
            // Refresh failed - clear tokens and redirect to login
            this.processQueue(refreshError, null);
            Cookies.remove('auth_token');
            Cookies.remove('refresh_token');
            Cookies.remove('user_data');
            
            if (typeof window !== 'undefined') {
              window.location.href = '/login';
            }
            
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        } else if (error.response?.status >= 500) {
          toast.error('Server error. Please try again later.');
        } else if (error.code === 'ECONNABORTED') {
          toast.error('Request timeout. Please try again.');
        }
        
        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: any, token: string | null = null) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/users/login', { email, password });
    const { access_token, refresh_token, user } = response.data;
    
    // Store the tokens and user data in cookies
    if (access_token) {
      Cookies.set('auth_token', access_token, { expires: 7 }); // Expires in 7 days
    }
    if (refresh_token) {
      Cookies.set('refresh_token', refresh_token, { expires: 30 }); // Refresh tokens last longer
    }
    if (user) {
      Cookies.set('user_data', JSON.stringify(user), { expires: 7 });
    }
    
    return response.data;
  }

  async logout() {
    try {
      // Optionally call a logout endpoint on the server
      await this.api.post('/users/logout');
    } catch (error) {
      // Continue with logout even if server call fails
      console.warn('Server logout failed:', error);
    } finally {
      // Clear all tokens and user data
      Cookies.remove('auth_token');
      Cookies.remove('refresh_token');
      Cookies.remove('user_data');
      
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  async refreshToken(): Promise<string | null> {
    try {
      const refreshToken = Cookies.get('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await this.api.post('/refresh/token', {
        refresh_token: refreshToken
      });

      const { access_token, refresh_token: newRefreshToken } = response.data;

      if (access_token) {
        Cookies.set('auth_token', access_token, { expires: 7 });
      }

      if (newRefreshToken) {
        Cookies.set('refresh_token', newRefreshToken, { expires: 30 });
      }

      return access_token;
    } catch (error) {
      // Clear tokens on refresh failure
      Cookies.remove('auth_token');
      Cookies.remove('refresh_token');
      Cookies.remove('user_data');
      throw error;
    }
  }

  async register(userData: any) {
    const response = await this.api.post('/users/register', userData);
    return response.data;
  }

  async getProfile() {
    const response = await this.api.get('/users/profile');
    return response.data;
  }

  // Client endpoints
  async getClients() {
    const response = await this.api.get('/clients');
    return response.data;
  }

  async getAllClients() {
    const response = await this.api.get('/clients/admin');
    return response.data;
  }

  async createClient(clientData: any) {
    const response = await this.api.post('/clients', clientData);
    return response.data;
  }

  async updateClient(id: number, clientData: any) {
    const response = await this.api.put(`/clients/${id}`, clientData);
    return response.data;
  }

  async deleteClient(id: number) {
    const response = await this.api.delete(`/clients/${id}`);
    return response.data;
  }

  // CSV Upload endpoints for bulk client creation
  async uploadClientsCSV(file: File, options?: { 
    skipDuplicates?: boolean; 
    updateExisting?: boolean;
    validateOnly?: boolean;
  }) {
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error('File size exceeds 10MB limit');
    }

    // Validate file type
    if (!file.name.toLowerCase().endsWith('.csv')) {
      throw new Error('Only CSV files are allowed');
    }

    const formData = new FormData();
    formData.append('csv_file', file);
    
    // Add options as JSON string if provided
    if (options) {
      formData.append('options', JSON.stringify(options));
    }

    const response = await this.api.post('/clients/upload-csv', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: 60000, // Extended timeout for large file processing
    });
    return response.data;
  }

  async validateClientsCSV(file: File) {
    return this.uploadClientsCSV(file, { validateOnly: true });
  }

  async downloadClientsCSVTemplate() {
    const response = await this.api.get('/clients/csv-template', {
      responseType: 'blob',
    });
    
    // Create a download link for the template
    const blob = new Blob([response.data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'clients_template.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
    
    return response.data;
  }

  async getCSVUploadHistory() {
    const response = await this.api.get('/clients/upload-history');
    return response.data;
  }

  // Email endpoints
  async getEmails() {
    const response = await this.api.get('/email');
    return response.data;
  }

  async getAllEmails() {
    const response = await this.api.get('/email/admin');
    return response.data;
  }

  async getScheduledEmails(stateId: number = -1) {
    const response = await this.api.get(`/email/schedule/list/${stateId}`);
    return response.data;
  }

  async reconcileEmails(stateId: number) {
    const response = await this.api.get(`/email/reconcile/${stateId}`);
    return response.data;
  }

  async sendTestEmail(testData: any) {
    const response = await this.api.post('/email/test', testData);
    return response.data;
  }

  async sendScheduledEmails() {
    const response = await this.api.get('/email/schedule/email');
    return response.data;
  }

  async checkEmails() {
    const response = await this.api.get('/email/check');
    return response.data;
  }

  async replyToEmail(replyData: any) {
    const response = await this.api.post('/email/reply', replyData);
    return response.data;
  }

  // Outreach endpoints
  async getOutreaches() {
    const response = await this.api.get('/outreach');
    return response.data;
  }

  async createOutreach(outreachData: any) {
    const response = await this.api.post('/outreach', outreachData);
    return response.data;
  }

  async updateOutreach(id: number, outreachData: any) {
    const response = await this.api.put(`/outreach/${id}`, outreachData);
    return response.data;
  }

  async scheduleOutreach(id: number, scheduleData: any) {
    const response = await this.api.post(`/outreach/schedule/${id}`, scheduleData);
    return response.data;
  }

  // Mailbox endpoints
  async getMailboxes() {
    const response = await this.api.get('/mailbox');
    return response.data;
  }

  async getAllMailboxes() {
    const response = await this.api.get('/mailbox');
    return response.data;
  }

  async createMailbox(mailboxData: any) {
    const response = await this.api.post('/mailbox', mailboxData);
    return response.data;
  }

  async updateMailbox(id: number, mailboxData: MailBox) {
    // Remove sentEmails from mailboxData if it exists
    if (mailboxData.sentEmails) {
      delete mailboxData.sentEmails;
    }
    if (mailboxData.createdAt) {
      delete mailboxData.createdAt;
    }
    if (mailboxData.updatedAt) {
      delete mailboxData.updatedAt;
    }
    if (mailboxData.scheduledCount || mailboxData.scheduledCount === 0) {
      delete mailboxData.scheduledCount;
    }
    
    const response = await this.api.put(`/mailbox/${id}`, mailboxData);
    return response.data;
  }

  async deleteMailbox(id: number) {
    const response = await this.api.delete(`/mailbox/${id}`);
    return response.data;
  }

  // Templates
  async getTemplates() {
    return this.request({ method: 'GET', url: '/templates' });
  }

  async getTemplate(id: number) {
    return this.request({ method: 'GET', url: `/templates/${id}` });
  }

  async getTemplateContent(id: number) {
    return this.request({ method: 'GET', url: `/templates/${id}/content` });
  }

  async createTemplate(data: { name: string; description?: string; htmlContent: string }) {
    return this.request({ method: 'POST', url: '/templates', data });
  }

  async updateTemplate(id: number, data: { name?: string; description?: string; isActive?: boolean }) {
    return this.request({ method: 'PUT', url: `/templates/${id}`, data });
  }

  async deleteTemplate(id: number) {
    return this.request({ method: 'DELETE', url: `/templates/${id}` });
  }

  async uploadTemplate(formData: FormData) {
    return this.request({ 
      method: 'POST', 
      url: '/templates/upload', 
      data: formData,
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }

  // Service Configurations
  async getServiceConfigs() {
    return this.request({ method: 'GET', url: '/service-configs' });
  }

  async getServiceConfig(id: number) {
    return this.request({ method: 'GET', url: `/service-configs/${id}` });
  }

  async createServiceConfig(data: any) {
    return this.request({ method: 'POST', url: '/service-configs', data });
  }

  async updateServiceConfig(id: number, data: any) {
    return this.request({ method: 'PUT', url: `/service-configs/${id}`, data });
  }

  async deleteServiceConfig(id: number) {
    return this.request({ method: 'DELETE', url: `/service-configs/${id}` });
  }

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.api.request(config);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;

// Individual function exports for convenience
export const getOutreaches = () => apiService.getOutreaches();
export const createOutreach = (outreachData: any) => apiService.createOutreach(outreachData);
export const updateOutreach = (id: number, outreachData: any) => apiService.updateOutreach(id, outreachData);
