// API Service for Resume operations
// Centralized API calls to the backend

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Types matching backend response
export interface ResumeListItem {
    _id: string;
    name: string;
    version: number;
    templateId: string;
    updatedAt: string;
    createdAt: string;
}

export interface ResumeContent {
    personalInfo: {
        name: string;
        email: string;
        phone: string;
        linkedin?: string;
        github?: string;
        portfolio?: string;
    };
    education: Array<{
        institution: string;
        branch: string;
        cgpa: number;
        startYear: number;
        endYear: number;
    }>;
    experience: Array<{
        company: string;
        role: string;
        startDate: string;
        endDate: string;
        bullets: string[];
    }>;
    projects: Array<{
        title: string;
        techStack: string[];
        description: string;
        bullets: string[];
        link?: string;
    }>;
    skills: {
        languages: string[];
        frameworks: string[];
        tools: string[];
        databases: string[];
    };
    achievements: Array<{
        title: string;
        description: string;
        date?: string;
    }>;
    certifications: Array<{
        name: string;
        issuer: string;
        date: string;
        link?: string;
    }>;
    pors: Array<{
        position: string;
        organization: string;
        duration: string;
        description: string;
    }>;
}

export interface Resume extends ResumeListItem {
    userId: string;
    content: ResumeContent;
    pdfUrl?: string;
}

// API Response types
interface ApiResponse<T> {
    success: boolean;
    error?: string;
    details?: string;
    [key: string]: unknown;
}

interface ResumesResponse extends ApiResponse<Resume[]> {
    count: number;
    resumes: ResumeListItem[];
}

interface ResumeResponse extends ApiResponse<Resume> {
    resume: Resume;
}

interface CreateUpdateResponse extends ApiResponse<Resume> {
    message: string;
    resume: Resume;
}

interface DeleteResponse extends ApiResponse<void> {
    message: string;
    deletedId: string;
}

// API Functions
export const resumeApi = {
    // Get all resumes (for dashboard)
    getAll: async (): Promise<ResumesResponse> => {
        const response = await fetch(`${API_URL}/api/resumes`);
        if (!response.ok) {
            throw new Error('Failed to fetch resumes');
        }
        return response.json();
    },

    // Get single resume by ID
    getOne: async (id: string): Promise<ResumeResponse> => {
        const response = await fetch(`${API_URL}/api/resumes/${id}`);
        if (!response.ok) {
            throw new Error('Failed to fetch resume');
        }
        return response.json();
    },

    // Create new resume
    create: async (data: { name: string; content?: ResumeContent; templateId?: string }): Promise<CreateUpdateResponse> => {
        const response = await fetch(`${API_URL}/api/resumes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create resume');
        }
        return response.json();
    },

    // Update existing resume
    update: async (id: string, data: Partial<Resume>): Promise<CreateUpdateResponse> => {
        const response = await fetch(`${API_URL}/api/resumes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update resume');
        }
        return response.json();
    },

    // Delete resume
    delete: async (id: string): Promise<DeleteResponse> => {
        const response = await fetch(`${API_URL}/api/resumes/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to delete resume');
        }
        return response.json();
    },
};

// Auth API Functions
export const authApi = {
    login: async (email: string, password: string) => {
        const response = await fetch(`${API_URL}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Login failed');
        }
        return data;
    },

    register: async (name: string, email: string, password: string) => {
        const response = await fetch(`${API_URL}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Registration failed');
        }
        return data;
    },

    getMe: async (token: string) => {
        const response = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to get user');
        }
        return data;
    },
};

// Stats API Functions (Admin)
export const statsApi = {
    getOverview: async (token: string) => {
        const response = await fetch(`${API_URL}/api/stats/overview`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to get stats');
        }
        return data;
    },

    getResumeStats: async (token: string) => {
        const response = await fetch(`${API_URL}/api/stats/resumes`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to get resume stats');
        }
        return data;
    },

    getAnalysisStats: async (token: string) => {
        const response = await fetch(`${API_URL}/api/stats/analysis`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to get analysis stats');
        }
        return data;
    },

    getActivity: async (token: string) => {
        const response = await fetch(`${API_URL}/api/stats/activity`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Failed to get activity');
        }
        return data;
    },
};

export default resumeApi;
