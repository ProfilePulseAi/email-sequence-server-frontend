export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  dob?: Date;
  phone?: string;
  address?: {
    street: string;
    city: string;
    state: string;
  };
  zip?: string;
  country?: string;
  googleSignIn?: string;
  linkedSignIn?: string;
  signupType: 'google' | 'email' | 'linkedIn';
  isActive: boolean;
  role: 'ADMIN' | 'VIEWER';
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  company?: string;
  position?: string;
  phone?: string;
  website?: string;
  industry?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Email {
  id: number;
  userId: number;
  taskName: string;
  state: 'SCHEDULE' | 'DELIVERED' | 'FAILED';
  client: Client;
  outreach: Outreach;
  outreachStateId: number;
  mailbox: MailBox;
  scheduled10minInterval: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  deliveryTime?: Date;
  deliveryStatus?: string;
  messageId?: string;
  parentMessageId?: string;
  opened: boolean;
  replied: boolean;
  openedEmail?: {
    count: number;
    openedAt: Date;
  };
  clicked?: Array<{
    url: string;
    clickedAt: Date;
  }>;
  subject?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Outreach {
  id: number;
  userId: number;
  name: string;
  description?: string;
  isActive: boolean;
  templates?: EmailTemplate[];
  stateList?: State[];
  subject?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

export interface ImapConfig {
  host: string;
  port: number;
  auth: {
    user: string;
    pass: string;
  };
}

export interface MailBox {
  id: number;
  userId?: number;
  emailId: string;
  name: string;
  smtpConfig: SmtpConfig;
  imapConfig?: ImapConfig;
  shouldCheckReplies: boolean;
  sentEmails?: number;
  failedEmails?: number;
  sendingProbability: number;
  replyTo: string;
  maxEmailsPerDay: number;
  scheduledCount?: number;
  mailsPer10Mins?: number;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface EmailTemplate {
  id: number;
  subject: string;
  content: string;
  type: string;
  delay?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Template {
  id: number;
  name: string;
  description?: string;
  filename: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  isActive: boolean;
  userId: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface TemplateContent {
  content: string;
  template: Template;
}

export interface TemplateUploadResult {
  success: boolean;
  templateId: number;
  message: string;
  filePath: string;
}

export interface AuthResponse {
  access_token: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dob?: Date;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

export interface DashboardStats {
  totalEmails: number;
  deliveredEmails: number;
  openedEmails: number;
  repliedEmails: number;
  totalClients: number;
  activeOutreaches: number;
  emailsThisWeek: number;
  openRate: number;
  replyRate: number;
}

export interface CSVUploadResult {
  processed: number;
  successful: number;
  failed: number;
  errors?: string[];
  duplicates?: number;
  updated?: number;
}

export interface CSVUploadOptions {
  skipDuplicates?: boolean;
  updateExisting?: boolean;
  validateOnly?: boolean;
}

export interface CSVValidationResult {
  valid: boolean;
  validRows: number;
  invalidRows: number;
  errors: string[];
  warnings?: string[];
}

export interface CSVUploadHistory {
  id: number;
  filename: string;
  uploadedAt: string;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  status: 'completed' | 'failed' | 'processing';
  errorDetails?: string;
}

// Outreach State Types
export interface State {
  name: string;
  scheduleAfterDays: number;
  description: string;
  templateId: string;
}

export interface OutreachState {
  name: string;
  scheduleAfterDays: number;
  description: string;
  templateId: string;
}

export interface OutreachDto {
  id?: number;
  name: string;
  userId?: number;
  stateList: OutreachState[];
  subject: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

// ReactFlow Node Types
export interface FlowNodeData {
  label: string;
  type: 'wait' | 'engagementTrigger' | 'takeAction' | 'end';
  
  // Wait node properties
  waitValue?: number;
  waitUnit?: 'hours' | 'days';
  cancelActions?: ('email_opened' | 'email_replied' | 'link_clicked')[];
  specificLink?: string;
  linkedTemplateId?: string;
  
  // Engagement Trigger node properties
  actionType?: 'email_replied' | 'link_clicked' | 'email_opened' | 'send_email' | 'create_task';
  condition?: string;
  
  // Take Action node properties
  templateId?: string;
  taskTitle?: string;
  taskPlatform?: 'jira' | 'linear' | 'trello' | 'github' | 'clickup';
  
  // Common properties
  description?: string;
  
  // Legacy properties (for backward compatibility)
  waitDays?: number;
}

export interface FlowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: FlowNodeData;
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: string;
}

export interface OutreachFlow {
  nodes: FlowNode[];
  edges: FlowEdge[];
}

// Service Configuration Types
export type Platform = 'jira' | 'linear' | 'trello' | 'github' | 'clickup' | 'slack' | 'discord';

export interface ServiceConfig {
  id: number;
  name: string;
  platform: Platform;
  isActive: boolean;
  userId: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateServiceConfigDto {
  name: string;
  platform: Platform;
  credentials: Record<string, any>;
  description?: string;
}

export interface UpdateServiceConfigDto {
  name?: string;
  credentials?: Record<string, any>;
  isActive?: boolean;
  description?: string;
}

export interface ServiceCredentials {
  [key: string]: any;
  // Platform-specific credentials will be typed based on platform
}

// Platform-specific credential types
export interface JiraCredentials {
  host: string;
  email: string;
  token: string;
}

export interface LinearCredentials {
  token: string;
}

export interface TrelloCredentials {
  key: string;
  token: string;
}

export interface GithubCredentials {
  token: string;
  owner?: string;
  repo?: string;
}

export interface ClickupCredentials {
  token: string;
  teamId?: string;
}

export interface SlackCredentials {
  webhookUrl: string;
}

export interface DiscordCredentials {
  webhookUrl: string;
}
