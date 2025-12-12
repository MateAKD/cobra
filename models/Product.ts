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
    order: { type: Number, default: 0 }
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

const Product: Model<IProduct> = mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
