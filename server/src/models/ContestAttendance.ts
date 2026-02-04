import mongoose, { Document, Schema } from 'mongoose';

export interface IContestAttendance extends Document {
    contestId: mongoose.Types.ObjectId;
    userId?: mongoose.Types.ObjectId;  // If logged in
    // Student info (can be from form or auto-filled from user)
    name: string;
    email: string;
    studentId: string;           // Roll number like 2022UCP1234
    branch: string;              // UCP, UCE, UEC, etc.
    year?: number;               // 1, 2, 3, 4
    phone?: string;
    // Location data
    latitude?: number;
    longitude?: number;
    locationAccuracy?: number;
    distanceFromVenue?: number;  // Calculated distance in meters
    // Metadata
    markedAt: Date;
    deviceInfo?: string;
    ipAddress?: string;
    status: 'present' | 'late' | 'invalid_location';
}

const contestAttendanceSchema = new Schema<IContestAttendance>({
    contestId: {
        type: Schema.Types.ObjectId,
        ref: 'Contest',
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

// Compound index: one attendance per student per contest
contestAttendanceSchema.index({ contestId: 1, email: 1 }, { unique: true });
contestAttendanceSchema.index({ contestId: 1, studentId: 1 }, { unique: true });
contestAttendanceSchema.index({ contestId: 1, markedAt: 1 });

export const ContestAttendance = mongoose.model<IContestAttendance>('ContestAttendance', contestAttendanceSchema);
