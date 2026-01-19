import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
    entityType: 'product' | 'category';
    entityId: string;
    action: 'create' | 'update' | 'delete' | 'restore';
    changes: {
        field: string;
        oldValue: any;
        newValue: any;
    }[];
    performedBy: string;
    performedAt: Date;
    userAgent?: string;
}

const AuditLogSchema: Schema = new Schema({
    entityType: {
        type: String,
        required: true,
        enum: ['product', 'category'],
        index: true
    },
    entityId: {
        type: String,
        required: true,
        index: true
    },
    action: {
        type: String,
        required: true,
        enum: ['create', 'update', 'delete', 'restore'],
        index: true
    },
    changes: [{
        field: { type: String, required: true },
        oldValue: { type: Schema.Types.Mixed },
        newValue: { type: Schema.Types.Mixed }
    }],
    performedBy: {
        type: String,
        required: true,
        index: true
    },
    performedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    userAgent: { type: String }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Compound index for common queries
AuditLogSchema.index({ entityType: 1, entityId: 1, performedAt: -1 });

const AuditLog: Model<IAuditLog> = mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLog;
