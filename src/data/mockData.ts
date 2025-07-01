import { User, HelpRequest } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Chen',
    email: 'sarah.chen@company.com',
    avatar: 'https://images.pexels.com/photos/3763188/pexels-photo-3763188.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'expert',
    department: 'Data Analytics',
    expertise: ['Excel', 'Power BI', 'SQL', 'Data Visualization'],
    status: 'available',
    rating: 4.9,
    completedHelps: 127
  },
  {
    id: '2',
    name: 'Michael Rodriguez',
    email: 'michael.rodriguez@company.com',
    avatar: 'https://images.pexels.com/photos/3777931/pexels-photo-3777931.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'management',
    department: 'Operations',
    expertise: ['Leadership', 'Process Optimization', 'Team Management'],
    status: 'available',
    rating: 4.8,
    completedHelps: 89
  },
  {
    id: '3',
    name: 'Emily Johnson',
    email: 'emily.johnson@company.com',
    avatar: 'https://images.pexels.com/photos/3768911/pexels-photo-3768911.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'expert',
    department: 'IT Support',
    expertise: ['Software Troubleshooting', 'Network Issues', 'Hardware Setup'],
    status: 'busy',
    rating: 4.7,
    completedHelps: 203
  },
  {
    id: '4',
    name: 'David Park',
    email: 'david.park@company.com',
    avatar: 'https://images.pexels.com/photos/3760263/pexels-photo-3760263.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'management',
    department: 'Human Resources',
    expertise: ['Career Development', 'Performance Reviews', 'Team Conflicts'],
    status: 'available',
    rating: 4.6,
    completedHelps: 156
  },
  {
    id: '5',
    name: 'Lisa Thompson',
    email: 'lisa.thompson@company.com',
    avatar: 'https://images.pexels.com/photos/3763152/pexels-photo-3763152.jpeg?auto=compress&cs=tinysrgb&w=400',
    role: 'expert',
    department: 'Finance',
    expertise: ['Financial Analysis', 'Budget Planning', 'Excel Formulas'],
    status: 'available',
    rating: 4.8,
    completedHelps: 94
  }
];

export const mockRequests: HelpRequest[] = [
  {
    id: '1',
    title: 'Need help with VLOOKUP formula in Excel',
    description: 'I\'m trying to create a complex VLOOKUP that references multiple sheets and I keep getting #N/A errors. Need someone to walk me through the syntax.',
    category: 'Excel',
    priority: 'medium',
    requester: {
      id: '6',
      name: 'John Smith',
      email: 'john.smith@company.com',
      avatar: 'https://images.pexels.com/photos/3760069/pexels-photo-3760069.jpeg?auto=compress&cs=tinysrgb&w=400',
      role: 'employee',
      department: 'Marketing',
      expertise: [],
      status: 'available',
      rating: 0,
      completedHelps: 0
    },
    status: 'open',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    tags: ['Excel', 'VLOOKUP', 'Formulas'],
    estimatedTime: '15-30 minutes'
  },
  {
    id: '2',
    title: 'Career development discussion needed',
    description: 'Looking to discuss potential career paths within the company and how to prepare for the next level. Would appreciate guidance from management.',
    category: 'Career',
    priority: 'low',
    requester: {
      id: '7',
      name: 'Amanda Wilson',
      email: 'amanda.wilson@company.com',
      avatar: 'https://images.pexels.com/photos/3760809/pexels-photo-3760809.jpeg?auto=compress&cs=tinysrgb&w=400',
      role: 'employee',
      department: 'Sales',
      expertise: [],
      status: 'available',
      rating: 0,
      completedHelps: 0
    },
    status: 'open',
    createdAt: new Date('2024-01-15T14:20:00Z'),
    tags: ['Career', 'Management', 'Development'],
    estimatedTime: '30-45 minutes'
  }
];