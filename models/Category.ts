import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ICategory extends Document {
    id: string; // We'll keep the string 'id' to match existing frontend logic
    name: string;
    description: string;
    order: number;
    timeRestricted: boolean;
    startTime?: string;
    endTime?: string;
    visible: boolean;
    isSubcategory?: boolean;
    parentCategory?: string;
    image?: string;
}

const CategorySchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    timeRestricted: { type: Boolean, default: false },
    startTime: { type: String },
    endTime: { type: String },
    visible: { type: Boolean, default: true },
    isSubcategory: { type: Boolean, default: false },
    parentCategory: { type: String },
    image: { type: String }
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

// Prevent model recompilation error in development
const Category: Model<ICategory> = mongoose.models.Category || mongoose.model<ICategory>('Category', CategorySchema);

export default Category;
