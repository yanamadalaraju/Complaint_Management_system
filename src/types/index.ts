export type Role = "superadmin" | "admin" | "teamlead" | "teammember" | "customer";

export type TicketStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED"
  | "REJECTED";

export type Priority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  createdAt?: string;
}

export interface Ticket {
  _id: string;
  ticketId: string;
  subject: string;
  category: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  customer: User;
  assignedTo?: User; // team lead
  assignedBy?: User; // admin
  resolutionNotes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt?: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}