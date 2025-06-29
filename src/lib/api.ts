import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import Cookies from 'js-cookie';
import { toast } from 'react-hot-toast';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
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
      (error) => {
        if (error.response?.status === 401) {
          // Unauthorized - clear token and redirect to login
          Cookies.remove('auth_token');
          Cookies.remove('user_data');
          if (typeof window !== 'undefined') {
            window.location.href = '/login';
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

  // Auth endpoints
  async login(email: string, password: string) {
    const response = await this.api.post('/users/login', { email, password });
    return response.data;
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
    const response = await this.api.get('/client');
    return response.data;
  }

  async getAllClients() {
    const response = await this.api.get('/client/admin');
    return response.data;
  }

  async createClient(clientData: any) {
    const response = await this.api.post('/client', clientData);
    return response.data;
  }

  async updateClient(id: number, clientData: any) {
    const response = await this.api.put(`/client/${id}`, clientData);
    return response.data;
  }

  async deleteClient(id: number) {
    const response = await this.api.delete(`/client/${id}`);
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
    const response = await this.api.get('/mailbox/user');
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

  // Generic request method
  async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    const response = await this.api.request(config);
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
