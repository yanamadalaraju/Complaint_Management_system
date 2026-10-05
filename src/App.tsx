import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import ProtectedRoute from "@/components/ProtectedRoute";
import SuperAdminLayout from "@/components/layouts/SuperAdminLayout";
import AdminLayout from "@/components/layouts/AdminLayout";
import TeamLeadLayout from "@/components/layouts/TeamLeadLayout";
import CustomerLayout from "@/components/layouts/CustomerLayout";

// Auth
import SuperAdminLogin from "@/pages/auth/SuperAdminLogin";
import AdminLogin from "@/pages/auth/AdminLogin";
import TeamLeadLogin from "@/pages/auth/TeamLeadLogin";
import CustomerLogin from "@/pages/auth/CustomerLogin";
import ForgotPassword from "@/pages/auth/ForgotPassword";

// Super Admin
import SADashboard from "@/pages/superadmin/Dashboard";
import ManageAdmins from "@/pages/superadmin/ManageAdmins";
import CreateAdmin from "@/pages/superadmin/CreateAdmin";
import EditAdmin from "@/pages/superadmin/EditAdmin";
import AdminDetails from "@/pages/superadmin/AdminDetails";
import SAAllTickets from "@/pages/superadmin/AllTickets";
import SAReports from "@/pages/superadmin/Reports";
import SASettings from "@/pages/superadmin/Settings";
import CreateProject from "./pages/superadmin/CreateProject";
import CreateCustomer from "./pages/superadmin/CreateCustomer";
import ManageProjects from "@/pages/superadmin/ManageProjects";
import ManageCustomers from "@/pages/superadmin/ManageCustomers";
import CustomerDetails from "@/pages/superadmin/CustomerDetails";
import EditCustomer from "@/pages/superadmin/EditCustomer";
import ProjectDetails from "@/pages/superadmin/ProjectDetails";
import EditProject from "@/pages/superadmin/EditProject";

// Admin
import ADashboard from "@/pages/admin/Dashboard";
import AAllTickets from "@/pages/admin/AllTickets";
import ATicketDetails from "@/pages/admin/TicketDetails";
import AssignTicket from "@/pages/admin/AssignTicket";
import ManageTeamLeads from "@/pages/admin/ManageTeamLeads";
import CreateTeamLead from "@/pages/admin/CreateTeamLead";
import EditTeamLead from "@/pages/admin/EditTeamLead";
import TeamLeadDetails from "@/pages/admin/TeamLeadDetails";

import AllProjects from "@/pages/admin/AllProjects";
import AdminProjectDetails from "@/pages/admin/ProjectDetails";
import AssignProject from "./pages/admin/AssignProject";

// Team Lead
import TLDashboard from "@/pages/teamlead/Dashboard";
import AssignedTickets from "@/pages/teamlead/AssignedTickets";
import TLTicketDetails from "@/pages/teamlead/TicketDetails";
import ResolveTicket from "@/pages/teamlead/ResolveTicket";
import ResolvedHistory from "@/pages/teamlead/ResolvedHistory";
import LeadProjectDetails from "@/pages/teamlead/ProjectDetails";
import AssignProjectMembers from "@/pages/teamlead/ProjectResolveTicket";
import Projects from "./pages/teamlead/Projects";

// Customer
import CDashboard from "@/pages/customer/Dashboard";
import RaiseTicket from "@/pages/customer/RaiseTicket";
import MyTickets from "@/pages/customer/MyTickets";
import CTicketDetails from "@/pages/customer/TicketDetails";

import MyProjects from "./pages/customer/MyProjects";
import CustomerProjectDetails from "./pages/customer/ProjectDetails"; // 👈 NEW

// Common
import Home from "@/pages/common/Home";
import NotFound from "@/pages/common/NotFound";
import Unauthorized from "@/pages/common/Unauthorized";
import AdminNotifications from "./pages/admin/AdminNotifications";
import CustomerNotifications from "./pages/customer/CustomerNotifications";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/superadmin/login" element={<SuperAdminLogin />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/teamlead/login" element={<TeamLeadLogin />} />
          <Route path="/customer/login" element={<CustomerLogin />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* =============== Super Admin =============== */}
          <Route element={<ProtectedRoute allowedRole="superadmin" />}>
            <Route element={<SuperAdminLayout />}>
              <Route path="/superadmin/dashboard" element={<SADashboard />} />

              {/* Admins */}
              <Route path="/superadmin/admins" element={<ManageAdmins />} />
              <Route
                path="/superadmin/admins/create"
                element={<CreateAdmin />}
              />
              <Route
                path="/superadmin/admins/edit/:id"
                element={<EditAdmin />}
              />
              <Route path="/superadmin/admins/:id" element={<AdminDetails />} />

              {/* Projects */}
              <Route
                path="/superadmin/projects"
                element={<ManageProjects />}
              />
              <Route
                path="/superadmin/projects/create"
                element={<CreateProject />}
              />
              <Route
                path="/superadmin/projects/edit/:id"
                element={<EditProject />}
              />
              <Route
                path="/superadmin/projects/:id"
                element={<ProjectDetails />}
              />

              {/* Customers */}
              <Route
                path="/superadmin/customers"
                element={<ManageCustomers />}
              />
              <Route
                path="/superadmin/customers/create"
                element={<CreateCustomer />}
              />
              <Route
                path="/superadmin/customers/edit/:id"
                element={<EditCustomer />}
              />
              <Route
                path="/superadmin/customers/:id"
                element={<CustomerDetails />}
              />

              {/* Other */}
              <Route path="/superadmin/tickets" element={<SAAllTickets />} />
              <Route path="/superadmin/reports" element={<SAReports />} />
              <Route path="/superadmin/settings" element={<SASettings />} />
            </Route>
          </Route>

          {/* =============== Admin =============== */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<ADashboard />} />

              {/* Tickets */}
              <Route path="/admin/tickets" element={<AAllTickets />} />
              <Route path="/admin/tickets/:id" element={<ATicketDetails />} />
              <Route
                path="/admin/tickets/:id/assign"
                element={<AssignTicket />}
              />

              {/* Projects */}
              <Route path="/admin/projects" element={<AllProjects />} />
              <Route
                path="/admin/projects/:id/assign"
                element={<AssignProject />}
              />
              <Route
                path="/admin/projects/:id"
                element={<AdminProjectDetails />}
              />

              {/* Team Leads */}
              <Route path="/admin/teamleads" element={<ManageTeamLeads />} />
              <Route
                path="/admin/teamleads/create"
                element={<CreateTeamLead />}
              />
              <Route
                path="/admin/teamleads/edit/:id"
                element={<EditTeamLead />}
              />
              <Route
                path="/admin/teamleads/:id"
                element={<TeamLeadDetails />}
              />

              {/* Notifications */}
              <Route
                path="/admin/notifications"
                element={<AdminNotifications />}
              />
            </Route>
          </Route>

          {/* =============== Team Lead =============== */}
          <Route element={<ProtectedRoute allowedRole="teamlead" />}>
            <Route element={<TeamLeadLayout />}>
              <Route path="/teamlead/dashboard" element={<TLDashboard />} />
              <Route path="/teamlead/tickets" element={<AssignedTickets />} />
              <Route
                path="/teamlead/tickets/:id"
                element={<TLTicketDetails />}
              />
              <Route
                path="/teamlead/tickets/:id/resolve"
                element={<ResolveTicket />}
              />
              <Route path="/teamlead/resolved" element={<ResolvedHistory />} />

              <Route path="/teamlead/projects" element={<Projects />} />
              <Route
                path="/teamlead/projects/:id"
                element={<LeadProjectDetails />}
              />
              <Route
                path="/teamlead/projects/:id/assign"
                element={<AssignProjectMembers />}
              />
            </Route>
          </Route>

          {/* =============== Customer =============== */}
          <Route element={<ProtectedRoute allowedRole="customer" />}>
            <Route element={<CustomerLayout />}>
              <Route path="/customer/dashboard" element={<CDashboard />} />
              <Route path="/customer/tickets" element={<MyTickets />} />
              <Route
                path="/customer/tickets/create"
                element={<RaiseTicket />}
              />
              <Route
                path="/customer/tickets/:id"
                element={<CTicketDetails />}
              />

              {/* Projects */}
              <Route path="/customer/projects" element={<MyProjects />} />
              <Route
                path="/customer/projects/:id"
                element={<CustomerProjectDetails />}
              />

              <Route
                path="/customer/notifications"
                element={<CustomerNotifications />}
              />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;