import type { Ticket, User, Notification } from "@/types";

export const mockAdmins: User[] = [
  { _id: "a1", name: "Ravi Kumar", email: "ravi@admin.com", phone: "9876543210", role: "admin", createdAt: "2025-01-10" },
  { _id: "a2", name: "Priya Sharma", email: "priya@admin.com", phone: "9876543211", role: "admin", createdAt: "2025-02-14" },
];

export const mockTeamLeads: User[] = [
  { _id: "t1", name: "Arjun Mehta", email: "arjun@tl.com", phone: "9876500001", role: "teamlead" },
  { _id: "t2", name: "Sneha Rao", email: "sneha@tl.com", phone: "9876500002", role: "teamlead" },
];

export const mockTickets: Ticket[] = [
  {
    _id: "tk1",
    ticketId: "TKT-1001",
    subject: "Payment not credited",
    category: "Billing",
    description: "I paid ₹5000 on 12th but it's not showing in my account.",
    status: "OPEN",
    priority: "HIGH",
    customer: { _id: "c1", name: "Amit Verma", email: "amit@mail.com", role: "customer" },
    createdAt: "2025-09-28",
  },
  {
    _id: "tk2",
    ticketId: "TKT-1002",
    subject: "App crashes on login",
    category: "Technical",
    description: "Whenever I try to login, app crashes on Android 13.",
    status: "ASSIGNED",
    priority: "URGENT",
    customer: { _id: "c2", name: "Neha Singh", email: "neha@mail.com", role: "customer" },
    assignedTo: mockTeamLeads[0],
    assignedBy: mockAdmins[0],
    createdAt: "2025-09-29",
  },
  {
    _id: "tk3",
    ticketId: "TKT-1003",
    subject: "Refund delayed",
    category: "Billing",
    description: "Refund initiated 10 days ago still not received.",
    status: "RESOLVED",
    priority: "MEDIUM",
    customer: { _id: "c3", name: "Rahul Joshi", email: "rahul@mail.com", role: "customer" },
    assignedTo: mockTeamLeads[1],
    assignedBy: mockAdmins[1],
    resolutionNotes: "Refund processed and confirmed via bank. Amount credited.",
    createdAt: "2025-09-20",
  },
];

export const mockNotifications: Notification[] = [
  { _id: "n1", title: "Ticket Resolved", message: "TKT-1003 resolved by Sneha Rao", read: false, createdAt: "2025-09-30" },
  { _id: "n2", title: "New Ticket", message: "TKT-1002 assigned to Arjun Mehta", read: true, createdAt: "2025-09-29" },
];