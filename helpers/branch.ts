export interface Branch {
  uid: number;
  name: string;
  code: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  organisation: {
    uid: number;
    name: string;
  };
} 