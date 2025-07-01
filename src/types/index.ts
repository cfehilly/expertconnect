export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'employee' | 'expert' | 'management' | 'admin';
  department: string;
  expertise: string[];
  status: 'available' | 'busy' | 'offline';
  rating: number;
  completedHelps: number;
  createdAt?: Date;
  lastActive?: Date;
  created_at?: string;
  updated_at?: string;
  completed_helps?: number;
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requester: User;
  expert?: User;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  createdAt: Date;
  tags: string[];
  estimatedTime?: string;
}

export interface Message {
  id: string;
  senderId: string;
  content: string;
  timestamp: Date;
  type: 'text' | 'file' | 'system';
}

export interface Connection {
  id: string;
  requestId: string;
  participants: User[];
  messages: Message[];
  status: 'active' | 'completed' | 'closed';
  createdAt: Date;
}

export interface AuthUser extends User {
  accessToken?: string;
  refreshToken?: string;
}