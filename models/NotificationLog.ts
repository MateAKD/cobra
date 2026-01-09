import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INotificationLog extends Document {
    action: string;
    type: 'PRODUCT' | 'TIME_RANGE';
    details: any; // Stores product or timeRange data
    userInfo?: {
        ip?: string;
        userAgent?: string;
    };
    createdAt: Date;
    processed: boolean;
}

const NotificationLogSchema: Schema = new Schema({
    action: { type: String, required: true },
    type: { type: String, required: true, enum: ['PRODUCT', 'TIME_RANGE'] },
    details: { type: Schema.Types.Mixed, required: true },
    userInfo: {
        ip: String,
        userAgent: String
    },
    processed: { type: Boolean, default: false }
}, {
    timestamps: true
});

const NotificationLog: Model<INotificationLog> = mongoose.models.NotificationLog || mongoose.model<INotificationLog>('NotificationLog', NotificationLogSchema);

export default NotificationLog;
