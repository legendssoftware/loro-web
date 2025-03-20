export enum FeedbackType {
  GENERAL = 'GENERAL',
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  TASK = 'TASK',
  QUOTATION = 'QUOTATION',
  CLAIM = 'CLAIM',
  SUPPORT = 'SUPPORT',
  SUGGESTION = 'SUGGESTION',
  OTHER = 'OTHER'
}

export enum FeedbackStatus {
  NEW = 'NEW',
  IN_REVIEW = 'IN_REVIEW',
  RESPONDED = 'RESPONDED',
  CLOSED = 'CLOSED',
  FLAGGED = 'FLAGGED'
}

export interface Feedback {
  uid: number;
  type: FeedbackType;
  title: string;
  comments: string;
  rating?: number;
  attachments?: string[];
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
  clientId?: number;
  organisationId?: number;
  branchId?: number;
  taskId?: number;
}

export interface CreateFeedbackDto {
  type: FeedbackType;
  title: string;
  comments: string;
  rating?: number;
  attachments?: string[];
  token?: string;
  clientId?: number;
  organisationId?: number;
  branchId?: number;
  taskId?: number;
}

export interface TokenValidationResponse {
  valid: boolean;
  data?: {
    client?: {
      uid: number;
      name: string;
      email?: string;
      contactPerson?: string;
    };
    task?: {
      uid: number;
      title: string;
      description?: string;
    };
    organisation?: {
      uid: number;
    };
    branch?: {
      uid: number;
    };
  };
}