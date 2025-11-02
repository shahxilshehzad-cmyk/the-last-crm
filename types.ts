import { LeadStatus as OriginalLeadStatus } from './types';

export type LeadStatus = 'new' | 'contacted' | 'follow-up needed' | 'rejected' | 'appointment' | 'closed job' | 'lost job';
export type CommunicationType = 'call' | 'sms' | 'voicemail' | 'appointment';
export type TeamType = 'sales' | 'dealers' | 'admin';

export interface Communication {
  calls: number;
  sms: number;
  voicemails: number;
  notes: { date: string; text: string; author: string }[];
}

export interface Lead {
  id: number;
  listingLink: string;
  agentName: string;
  agentEmail: string;
  agentPhone?: string;
  address: string;
  city?: string;
  zipCode?: string;
  homeType?: string;
  homeValue?: string;
  roofFlag?: string;
  lastSoldDate?: string;
  permits?: string;
  status: LeadStatus;
  assignedTo: string; // TeamMember name
  dateAdded: string;
  communication: Communication;
  jobRevenue?: number;
  jobPhotos?: string[]; // Array of base64 encoded strings
}

export interface TeamMemberStats {
    leads: number;
    contacted: number;
    converted: number;
}

export interface User {
  id: number;
  username: string;
  password?: string;
  firstName: string;
  lastName: string;
  avatar: string;
  role: TeamType;
  email?: string;
  phone?: string;
}

export interface TeamMember extends User {
    stats: TeamMemberStats;
}

export interface CommunicationEvent {
  id: number;
  leadId: number;
  type: CommunicationType;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  notes?: string;
}

export interface Toast {
  id: number;
  message: string;
  type: 'success' | 'info' | 'error';
}