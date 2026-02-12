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

// Helper to get auth headers
const getAuthHeaders = (): Record<string, string> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
};

// API Functions
export const resumeApi = {
    // Get all resumes (for dashboard)
    getAll: async (): Promise<ResumesResponse> => {
        const response = await fetch(`${API_URL}/api/resumes`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch resumes');
        }
        return response.json();
    },

    // Get single resume by ID
    getOne: async (id: string): Promise<ResumeResponse> => {
        const response = await fetch(`${API_URL}/api/resumes/${id}`, {
            headers: getAuthHeaders(),
        });
        if (!response.ok) {
            throw new Error('Failed to fetch resume');
        }
        return response.json();
    },

    // Create new resume (requires auth)
    create: async (data: { name: string; content?: ResumeContent; templateId?: string }): Promise<CreateUpdateResponse> => {
        const response = await fetch(`${API_URL}/api/resumes`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create resume');
        }
        return response.json();
    },

    // Update existing resume (requires auth)
    update: async (id: string, data: Partial<Resume>): Promise<CreateUpdateResponse> => {
        const response = await fetch(`${API_URL}/api/resumes/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data),
        });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to update resume');
        }
        return response.json();
    },

    // Delete resume (requires auth)
    delete: async (id: string): Promise<DeleteResponse> => {
        const response = await fetch(`${API_URL}/api/resumes/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders(),
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
    // Google OAuth login (NIT-only)
    googleAuth: async (credential: string) => {
        const response = await fetch(`${API_URL}/api/auth/google`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential }),
        });
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Google authentication failed');
        }
        return data;
    },

    // Admin login only (password-based)
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

// Unified Event API (replaces contestApi + courseApi)
export const eventApi = {
    // ==================== ADMIN: Event Management ====================

    getAllContests: async (token: string, filters?: { status?: string; type?: string }) => {
        const params = new URLSearchParams();
        if (filters?.status) params.append('status', filters.status);
        if (filters?.type) params.append('type', filters.type);

        const response = await fetch(`${API_URL}/api/events?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },

    getContest: async (token: string, id: string) => {
        const response = await fetch(`${API_URL}/api/events/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },

    createContest: async (token: string, contestData: any) => {
        const response = await fetch(`${API_URL}/api/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(contestData),
        });
        return response.json();
    },

    updateContest: async (token: string, id: string, contestData: any) => {
        const response = await fetch(`${API_URL}/api/events/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(contestData),
        });
        return response.json();
    },

    deleteContest: async (token: string, id: string) => {
        const response = await fetch(`${API_URL}/api/events/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },

    toggleContestStatus: async (token: string, id: string) => {
        const response = await fetch(`${API_URL}/api/events/${id}/toggle`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },

    regenerateQRToken: async (token: string, id: string) => {
        const response = await fetch(`${API_URL}/api/events/${id}/regenerate-qr`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },

    // ==================== ADMIN: Attendance Management ====================

    getContestAttendance: async (token: string, id: string, sort?: string, order?: string) => {
        const params = new URLSearchParams();
        if (sort) params.append('sort', sort);
        if (order) params.append('order', order);

        const response = await fetch(`${API_URL}/api/events/${id}/attendance?${params}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },

    exportAttendanceCSV: (token: string, id: string) => {
        return `${API_URL}/api/events/${id}/attendance/export?token=${encodeURIComponent(token)}`;
    },

    deleteAttendanceRecord: async (token: string, contestId: string, attendanceId: string) => {
        const response = await fetch(`${API_URL}/api/events/${contestId}/attendance/${attendanceId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },

    // ==================== PUBLIC: Attendance Marking ====================

    getContestByToken: async (qrToken: string) => {
        const response = await fetch(`${API_URL}/api/events/public/token/${qrToken}`);
        return response.json();
    },

    markAttendance: async (qrToken: string, attendanceData: {
        name: string;
        email: string;
        studentId: string;
        branch: string;
        phone?: string;
        latitude?: number;
        longitude?: number;
        locationAccuracy?: number;
    }) => {
        const response = await fetch(`${API_URL}/api/events/public/token/${qrToken}/mark`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(attendanceData),
        });
        return response.json();
    },

    checkAttendance: async (qrToken: string, email?: string, studentId?: string) => {
        const params = new URLSearchParams();
        if (email) params.append('email', email);
        if (studentId) params.append('studentId', studentId);

        const response = await fetch(`${API_URL}/api/events/public/token/${qrToken}/check?${params}`);
        return response.json();
    },

    // ==================== STUDENT: Attendance History ====================

    getMyAttendance: async (token: string) => {
        const response = await fetch(`${API_URL}/api/events/my-attendance`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },

    // ==================== PUBLIC: Browse Events ====================

    getPublishedCourses: async (category?: string, search?: string) => {
        const params = new URLSearchParams();
        if (category && category !== 'all') params.append('category', category);
        if (search) params.append('search', search);
        const response = await fetch(`${API_URL}/api/events/public?${params}`);
        return response.json();
    },

    getCourseById: async (id: string, token?: string) => {
        const headers: any = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const response = await fetch(`${API_URL}/api/events/public/${id}`, { headers });
        return response.json();
    },

    // ==================== STUDENT: Enrollment ====================

    enrollInCourse: async (id: string, token: string) => {
        const response = await fetch(`${API_URL}/api/events/${id}/enroll`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },

    unenrollFromCourse: async (id: string, token: string) => {
        const response = await fetch(`${API_URL}/api/events/${id}/enroll`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },

    getMyEnrollments: async (token: string) => {
        const response = await fetch(`${API_URL}/api/events/my-enrollments`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },

    // ==================== ADMIN: Course-like Management ====================

    getAllCourses: async (token: string) => {
        const response = await fetch(`${API_URL}/api/events`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },

    createCourse: async (token: string, courseData: any) => {
        const response = await fetch(`${API_URL}/api/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(courseData),
        });
        return response.json();
    },

    updateCourse: async (token: string, id: string, courseData: any) => {
        const response = await fetch(`${API_URL}/api/events/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(courseData),
        });
        return response.json();
    },

    deleteCourse: async (token: string, id: string) => {
        const response = await fetch(`${API_URL}/api/events/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },

    togglePublish: async (token: string, id: string) => {
        const response = await fetch(`${API_URL}/api/events/${id}/publish`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
        });
        return response.json();
    },
};

export default resumeApi;

