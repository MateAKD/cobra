import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProduct extends Document {
    id: string;
    name: string;
    description?: string;
    price: string | number; // Handling both string/number for compatibility
    categoryId: string; // References Category.id (string)
    section: string; // e.g., 'main', 'drinks', 'wines', 'promotions' - useful for grouping
    image?: string;
    ingredients?: string;
    glass?: string;
    technique?: string;
    garnish?: string;
    tags?: string[];
    hidden: boolean;
    hiddenReason?: string;
    hiddenBy?: string;
    hiddenAt?: string;
    order: number;
    deletedAt?: Date;
    deletedBy?: string;
}

const ProductSchema: Schema = new Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Schema.Types.Mixed, required: true }, // Mixed to allow "1200" or 1200
    categoryId: { type: String, required: true, index: true },
    section: { type: String, required: true, index: true }, // To organize: 'menu', 'bebidas', 'vinos', etc.
    image: { type: String },
    ingredients: { type: String },
    glass: { type: String },
    technique: { type: String },
    garnish: { type: String },
    tags: { type: [String], default: [] },
    hidden: { type: Boolean, default: false },
    hiddenReason: { type: String },
    hiddenBy: { type: String },
    hiddenAt: { type: String },
    order: { type: Number, default: 0 },
    deletedAt: { type: Date, default: null },
    deletedBy: { type: String }
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

// Performance indexes for frequent queries
ProductSchema.index({ deletedAt: 1, order: 1 }); // For main menu query with soft delete filter
ProductSchema.index({ categoryId: 1, hidden: 1 }); // For filtering products by category and visibility
ProductSchema.index({ section: 1, hidden: 1 }); // For section-based queries

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
