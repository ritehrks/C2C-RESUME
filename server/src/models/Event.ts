import mongoose, { Document, Schema } from 'mongoose';

// Unified event categories (merges contest types + course categories)
export type EventCategory =
    | 'contest' | 'course' | 'workshop' | 'hackathon' | 'meeting' | 'seminar'
    | 'coding_contest' | 'other';

export interface IScheduleItem {
    day: string;        // Monday, Tuesday, etc.
    time: string;       // "10:00 AM - 12:00 PM"
    venue: string;      // "CL-01"
}

export interface IEvent extends Document {
    title: string;
    description?: string;
    category: EventCategory;
    // --- Contest fields ---
    type?: string;              // kept for backward compat (maps to category)
    venue?: string;
    date?: Date;                // single-day event date
    startTime?: string;
    endTime?: string;
    maxParticipants?: number;
    qrToken?: string;
    isActive: boolean;
    requiresGPS: boolean;
    venueLatitude?: number;
    venueLongitude?: number;
    gpsRadius: number;
    // --- Course fields ---
    instructor?: string;
    thumbnail?: string;
    link?: string;              // external participation URL
    schedule: IScheduleItem[];
    startDate?: Date;
    endDate?: Date;
    maxStudents: number;
    enrolledStudents: string[]; // Array of user emails
    isPublished: boolean;
    // --- Common ---
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const scheduleItemSchema = new Schema<IScheduleItem>({
    day: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
}, { _id: false });

const eventSchema = new Schema<IEvent>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['contest', 'course', 'workshop', 'hackathon', 'meeting', 'seminar', 'coding_contest', 'other'],
        default: 'other'
    },
    // Contest fields
    type: {
        type: String,
        trim: true
    },
    venue: {
        type: String,
        trim: true
    },
    date: {
        type: Date
    },
    startTime: {
        type: String
    },
    endTime: {
        type: String
    },
    maxParticipants: {
        type: Number
    },
    qrToken: {
        type: String,
        unique: true,
        sparse: true    // allows null/undefined without unique conflict
    },
    isActive: {
        type: Boolean,
        default: true
    },
    requiresGPS: {
        type: Boolean,
        default: false
    },
    venueLatitude: {
        type: Number
    },
    venueLongitude: {
        type: Number
    },
    gpsRadius: {
        type: Number,
        default: 100
    },
    // Course fields
    instructor: {
        type: String,
        trim: true
    },
    thumbnail: {
        type: String,
        trim: true
    },
    link: {
        type: String,
        trim: true
    },
    schedule: [scheduleItemSchema],
    startDate: {
        type: Date
    },
    endDate: {
        type: Date
    },
    maxStudents: {
        type: Number,
        default: 50
    },
    enrolledStudents: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    isPublished: {
        type: Boolean,
        default: true
    },
    // Common
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Indexes
eventSchema.index({ date: 1, isActive: 1 });
eventSchema.index({ isPublished: 1, category: 1 });
eventSchema.index({ startDate: 1 });

export const Event = mongoose.model<IEvent>('Event', eventSchema);
