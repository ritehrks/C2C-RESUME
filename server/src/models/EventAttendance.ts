import mongoose, { Document, Schema } from 'mongoose';

export interface IEventAttendance extends Document {
    eventId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;
    // Student info
    name: string;
    email: string;
    studentId: string;
    branch: string;
    year?: number;
    phone?: string;
    // Location data
    latitude?: number;
    longitude?: number;
    locationAccuracy?: number;
    distanceFromVenue?: number;
    // Metadata
    markedAt: Date;
    deviceInfo?: string;
    ipAddress?: string;
    status: 'present' | 'late' | 'invalid_location';
}

const eventAttendanceSchema = new Schema<IEventAttendance>({
    eventId: {
        type: Schema.Types.ObjectId,
        ref: 'Event',
        required: true
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        lowercase: true,
        trim: true
    },
    studentId: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    branch: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    year: {
        type: Number
    },
    phone: {
        type: String,
        trim: true
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    locationAccuracy: {
        type: Number
    },
    distanceFromVenue: {
        type: Number
    },
    markedAt: {
        type: Date,
        default: Date.now
    },
    deviceInfo: {
        type: String
    },
    ipAddress: {
        type: String
    },
    status: {
        type: String,
        enum: ['present', 'late', 'invalid_location'],
        default: 'present'
    }
}, {
    timestamps: true
});

// Compound index: one attendance per student per event
eventAttendanceSchema.index({ eventId: 1, email: 1 }, { unique: true });
eventAttendanceSchema.index({ eventId: 1, studentId: 1 }, { unique: true });
eventAttendanceSchema.index({ eventId: 1, markedAt: 1 });

export const EventAttendance = mongoose.model<IEventAttendance>('EventAttendance', eventAttendanceSchema);
