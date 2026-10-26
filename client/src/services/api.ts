// ==========================================
// Global Bridge - Client API Service Layer
// ==========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  applicationId?: number;
  leadId?: number;
  count?: number;
  errors?: any[];
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem("gb_token");
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["x-session-token"] = token;
  }
  return headers;
}

async function request<T = any>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const res = await fetch(endpoint, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    },
    credentials: "include",
  });

  const data = await res.json().catch(() => ({ success: false, error: "Network or JSON error" }));

  if (!res.ok) {
    const validationMessages = Array.isArray(data.errors)
      ? data.errors.map((item: any) => {
          if (typeof item === "string") return item;
          const field = item.field || item.path?.join(".");
          return field ? `${field}: ${item.message}` : item.message;
        }).filter(Boolean)
      : [];
    throw new Error(validationMessages.join("، ") || data.error || `HTTP ${res.status}`);
  }

  return data;
}

export const api = {
  // ==========================================
  // Public Endpoints
  // ==========================================
  public: {
    async getStats() {
      return request<any>(`/api/public/stats`);
    },

    async getJobs(params?: { department?: string; experienceLevel?: string; limit?: number }) {
      const q = new URLSearchParams();
      if (params?.department) q.set("department", params.department);
      if (params?.experienceLevel) q.set("experienceLevel", params.experienceLevel);
      if (params?.limit) q.set("limit", params.limit.toString());
      return request<any[]>(`/api/public/jobs?${q.toString()}`);
    },

    async getJob(slugOrId: string | number) {
      return request<any>(`/api/public/jobs/${slugOrId}`);
    },

    async applyForJob(body: {
      jobId: number;
      candidateName: string;
      email: string;
      phone?: string;
      country?: string;
      yearsExperience: number;
      primaryRole: string;
      skills: string[];
      linkedinUrl?: string;
      githubUrl?: string;
      portfolioUrl?: string;
      cvUrl?: string;
      cvFile?: { name: string; data: string };
      introduction: string;
      consentAt: string;
      trainingInterest?: boolean;
    }) {
      return request<any>(`/api/public/applications`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    async getTrainings(params?: { level?: string; format?: string }) {
      const q = new URLSearchParams();
      if (params?.level) q.set("level", params.level);
      if (params?.format) q.set("format", params.format);
      return request<any[]>(`/api/public/trainings?${q.toString()}`);
    },

    async getTraining(slug: string) {
      return request<any>(`/api/public/trainings/${slug}`);
    },

    async submitPartnershipLead(body: {
      companyName: string;
      contactPerson: string;
      workEmail: string;
      phone?: string;
      website?: string;
      country: string;
      companySize?: string;
      rolesNeeded: string;
      hiringVolume?: string;
      message?: string;
    }) {
      return request<any>(`/api/public/partnership-leads`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    async submitAdminAccessRequest(body: { name: string; email: string; reason: string }) {
      return request<any>(`/api/public/admin-access-requests`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },
  },

  // ==========================================
  // Company Dashboard Endpoints
  // ==========================================
  company: {
    async getDashboard() {
      return request<any>(`/api/company/dashboard`);
    },

    async getJobs() {
      return request<any[]>(`/api/company/jobs`);
    },

    async getJob(id: number | string) {
      return request<any>(`/api/company/jobs/${id}`);
    },

    async createJob(body: any) {
      return request<any>(`/api/company/jobs`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    async updateJob(id: number | string, body: any) {
      return request<any>(`/api/company/jobs/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },

    async getApplicants(params?: { jobId?: number; status?: string }) {
      const q = new URLSearchParams();
      if (params?.jobId) q.set("jobId", params.jobId.toString());
      if (params?.status) q.set("status", params.status);
      return request<any[]>(`/api/company/applicants?${q.toString()}`);
    },

    async getApplicant(id: number | string) {
      return request<any>(`/api/company/applicants/${id}`);
    },

    async updateApplicantStatus(id: number | string, status: string, note?: string) {
      return request<any>(`/api/company/applicants/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status, note }),
      });
    },

    async addApplicantNote(id: number | string, noteText: string) {
      return request<any>(`/api/company/applicants/${id}/notes`, {
        method: "POST",
        body: JSON.stringify({ body: noteText }),
      });
    },

    async getApplicantNotes(id: number | string) {
      return request<any[]>(`/api/company/applicants/${id}/notes`);
    },
  },

  // ==========================================
  // Admin Endpoints
  // ==========================================
  admin: {
    async getDashboard() {
      return request<any>(`/api/admin/dashboard`);
    },

    async getCompanies(params?: { status?: string; limit?: number }) {
      const q = new URLSearchParams();
      if (params?.status) q.set("status", params.status);
      if (params?.limit) q.set("limit", params.limit.toString());
      return request<any[]>(`/api/admin/companies?${q.toString()}`);
    },

    async getCompany(id: number | string) {
      return request<any>(`/api/admin/companies/${id}`);
    },

    async createCompany(body: any) {
      return request<any>(`/api/admin/companies`, {
        method: "POST",
        body: JSON.stringify(body),
      });
    },

    async updateCompany(id: number | string, body: any) {
      return request<any>(`/api/admin/companies/${id}`, {
        method: "PATCH",
        body: JSON.stringify(body),
      });
    },

    async getJobs(params?: { companyId?: number; status?: string }) {
      const q = new URLSearchParams();
      if (params?.companyId) q.set("companyId", params.companyId.toString());
      if (params?.status) q.set("status", params.status);
      return request<any[]>(`/api/admin/jobs?${q.toString()}`);
    },

    async getApplicants(params?: { jobId?: number; status?: string }) {
      const q = new URLSearchParams();
      if (params?.jobId) q.set("jobId", params.jobId.toString());
      if (params?.status) q.set("status", params.status);
      return request<any[]>(`/api/admin/applicants?${q.toString()}`);
    },

    async getTrainings(params?: { level?: string }) {
      const q = new URLSearchParams();
      if (params?.level) q.set("level", params.level);
      return request<any[]>(`/api/admin/trainings?${q.toString()}`);
    },

    async getActivity(limit: number = 20) {
      return request<any[]>(`/api/admin/activity?limit=${limit}`);
    },

    async getLeads(status?: string, type?: "partnership" | "admin_access") {
      const q = new URLSearchParams();
      if (status) q.set("status", status);
      if (type) q.set("type", type);
      return request<any[]>(`/api/admin/leads?${q.toString()}`);
    },

    async updateLeadStatus(id: number, status: string) {
      return request<any>(`/api/admin/leads/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
  },
};
