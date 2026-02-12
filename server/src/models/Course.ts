import mongoose, { Document, Schema } from 'mongoose';

export type CourseCategory = 'programming' | 'web-dev' | 'data-science' | 'ai-ml' | 'design' | 'dsa' | 'other';

export interface IScheduleItem {
    day: string;        // Monday, Tuesday, etc.
    time: string;       // "10:00 AM - 12:00 PM"
    venue: string;      // "CL-01"
}

export interface ICourse extends Document {
    title: string;
    description: string;
    instructor: string;
    category: CourseCategory;
    thumbnail?: string;
    schedule: IScheduleItem[];
    startDate: Date;
    endDate: Date;
    maxStudents: number;
    enrolledStudents: string[];   // Array of user emails
    isPublished: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const scheduleItemSchema = new Schema<IScheduleItem>({
    day: { type: String, required: true },
    time: { type: String, required: true },
    venue: { type: String, required: true },
}, { _id: false });

const courseSchema = new Schema<ICourse>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    instructor: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['programming', 'web-dev', 'data-science', 'ai-ml', 'design', 'dsa', 'other'],
        default: 'other'
    },
    thumbnail: {
        type: String,
        trim: true
    },
    schedule: [scheduleItemSchema],
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
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
        default: false
    },
    createdBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true
});

courseSchema.index({ isPublished: 1, category: 1 });
courseSchema.index({ startDate: 1 });

export const Course = mongoose.model<ICourse>('Course', courseSchema);
