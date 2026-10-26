import React from "react";
import { Route, Switch } from "wouter";

// Layouts
import PublicLayout from "./layouts/PublicLayout";
import CompanyLayout from "./layouts/CompanyLayout";
import AdminLayout from "./layouts/AdminLayout";

// Auth Guard
import ProtectedRoute from "./components/ProtectedRoute";

// Public Pages
import HomePage from "./pages/public/HomePage";
import JobsPage from "./pages/public/JobsPage";
import JobDetailPage from "./pages/public/JobDetailPage";
import JobApplyPage from "./pages/public/JobApplyPage";
import TrainingPage from "./pages/public/TrainingPage";
import TrainingDetailPage from "./pages/public/TrainingDetailPage";
import CompaniesPage from "./pages/public/CompaniesPage";
import AboutPage from "./pages/public/AboutPage";
import LoginPage from "./pages/public/LoginPage";

// Company Pages
import CompanyDashboardPage from "./pages/company/CompanyDashboardPage";
import CompanyJobsPage from "./pages/company/CompanyJobsPage";
import CompanyJobNewPage from "./pages/company/CompanyJobNewPage";
import CompanyJobEditPage from "./pages/company/CompanyJobEditPage";
import CompanyApplicantsPage from "./pages/company/CompanyApplicantsPage";
import CompanyApplicantDetailPage from "./pages/company/CompanyApplicantDetailPage";

// Admin Pages
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import AdminCompaniesPage from "./pages/admin/AdminCompaniesPage";
import AdminJobsPage from "./pages/admin/AdminJobsPage";
import AdminApplicantsPage from "./pages/admin/AdminApplicantsPage";
import AdminTrainingPage from "./pages/admin/AdminTrainingPage";
import AdminActivityPage from "./pages/admin/AdminActivityPage";
import AdminRegistrationRequestsPage from "./pages/admin/AdminRegistrationRequestsPage";

// 404
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <Switch>
      {/* 1. Public Routes */}
      <Route path="/">
        <PublicLayout>
          <HomePage />
        </PublicLayout>
      </Route>

      <Route path="/jobs">
        <PublicLayout>
          <JobsPage />
        </PublicLayout>
      </Route>

      <Route path="/jobs/:id/apply">
        <PublicLayout>
          <JobApplyPage />
        </PublicLayout>
      </Route>

      <Route path="/jobs/:id">
        <PublicLayout>
          <JobDetailPage />
        </PublicLayout>
      </Route>

      <Route path="/training">
        <PublicLayout>
          <TrainingPage />
        </PublicLayout>
      </Route>

      <Route path="/training/:id">
        <PublicLayout>
          <TrainingDetailPage />
        </PublicLayout>
      </Route>

      <Route path="/companies">
        <PublicLayout>
          <CompaniesPage />
        </PublicLayout>
      </Route>

      <Route path="/about">
        <PublicLayout>
          <AboutPage />
        </PublicLayout>
      </Route>

      <Route path="/login">
        <PublicLayout>
          <LoginPage />
        </PublicLayout>
      </Route>

      {/* 2. Company Private Routes — requires company or admin role */}
      <Route path="/company/dashboard">
        <ProtectedRoute roles={["company", "admin"]}>
          <CompanyLayout>
            <CompanyDashboardPage />
          </CompanyLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/company/jobs/new">
        <ProtectedRoute roles={["company", "admin"]}>
          <CompanyLayout>
            <CompanyJobNewPage />
          </CompanyLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/company/jobs/:id/edit">
        <ProtectedRoute roles={["company", "admin"]}>
          <CompanyLayout>
            <CompanyJobEditPage />
          </CompanyLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/company/jobs">
        <ProtectedRoute roles={["company", "admin"]}>
          <CompanyLayout>
            <CompanyJobsPage />
          </CompanyLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/company/applicants/:id">
        <ProtectedRoute roles={["company", "admin"]}>
          <CompanyLayout>
            <CompanyApplicantDetailPage />
          </CompanyLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/company/applicants">
        <ProtectedRoute roles={["company", "admin"]}>
          <CompanyLayout>
            <CompanyApplicantsPage />
          </CompanyLayout>
        </ProtectedRoute>
      </Route>

      {/* 3. Admin Private Routes — requires admin role only */}
      <Route path="/admin">
        <ProtectedRoute roles={["admin"]}>
          <AdminLayout>
            <AdminDashboardPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/companies">
        <ProtectedRoute roles={["admin"]}>
          <AdminLayout>
            <AdminCompaniesPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/registration-requests">
        <ProtectedRoute roles={["admin"]}>
          <AdminLayout>
            <AdminRegistrationRequestsPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/jobs">
        <ProtectedRoute roles={["admin"]}>
          <AdminLayout>
            <AdminJobsPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/applicants">
        <ProtectedRoute roles={["admin"]}>
          <AdminLayout>
            <AdminApplicantsPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/training">
        <ProtectedRoute roles={["admin"]}>
          <AdminLayout>
            <AdminTrainingPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      <Route path="/admin/activity">
        <ProtectedRoute roles={["admin"]}>
          <AdminLayout>
            <AdminActivityPage />
          </AdminLayout>
        </ProtectedRoute>
      </Route>

      {/* 4. 404 Fallback */}
      <Route>
        <PublicLayout>
          <NotFoundPage />
        </PublicLayout>
      </Route>
    </Switch>
  );
}
