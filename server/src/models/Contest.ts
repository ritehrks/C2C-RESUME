import mongoose, { Document, Schema } from 'mongoose';

// Contest Types
export type ContestType = 'coding_contest' | 'workshop' | 'hackathon' | 'meeting' | 'seminar' | 'other';

export interface IContest extends Document {
    title: string;
    description?: string;
    type: ContestType;
    venue: string;
    date: Date;
    startTime: string;
    endTime: string;
    maxParticipants?: number;
    qrToken: string;           // Unique token for QR code
    isActive: boolean;
    requiresGPS: boolean;
    venueLatitude?: number;
    venueLongitude?: number;
    gpsRadius: number;         // in meters
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const contestSchema = new Schema<IContest>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        enum: ['coding_contest', 'workshop', 'hackathon', 'meeting', 'seminar', 'other'],
        default: 'other'
    },
    venue: {
        type: String,
        required: true,
        trim: true
    },
    date: {
        type: Date,
        required: true
    },
    startTime: {
        type: String,
        required: true
    },
    endTime: {
        type: String,
        required: true
    },
    maxParticipants: {
        type: Number
    },
    qrToken: {
        type: String,
        required: true,
        unique: true
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
        default: 100  // 100 meters default
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

// Index for quick QR token lookup
contestSchema.index({ qrToken: 1 });
contestSchema.index({ date: 1, isActive: 1 });

export const Contest = mongoose.model<IContest>('Contest', contestSchema);
