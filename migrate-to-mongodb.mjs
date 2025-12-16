import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: '.env.local' });

// Define Schemas Inline
const CategorySchema = new mongoose.Schema({
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
}, { timestamps: true });

const ProductSchema = new mongoose.Schema({
    id: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, default: '' },
    price: { type: String },
    categoryId: { type: String, required: true },
    section: { type: String, required: true }, // 'menu', 'vinos', etc.
    image: { type: String },
    ingredients: { type: String },
    glass: { type: String },
    technique: { type: String },
    garnish: { type: String },
    tags: [{ type: String }],
    hidden: { type: Boolean, default: false },
    hiddenReason: { type: String },
    hiddenBy: { type: String },
    hiddenAt: { type: Date },
    order: { type: Number, default: 0 }
}, { timestamps: true });

// Avoid overwriting models if they exist
const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);
const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

async function migrate() {
    try {
        console.log('🔌 Conectando a MongoDB...');
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI no definida en .env.local');
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Conectado a MongoDB Atlas\n');

        // Leer archivos JSON
        const menuPath = path.join(__dirname, 'data', 'menu.json');
        const categoriesPath = path.join(__dirname, 'data', 'categories.json');

        console.log('📖 Leyendo archivos JSON...');
        const menuData = JSON.parse(fs.readFileSync(menuPath, 'utf-8'));
        const categoriesData = JSON.parse(fs.readFileSync(categoriesPath, 'utf-8'));

        // Migrar categorías
        console.log('\n📦 Migrando categorías...');
        const categoryOps = Object.entries(categoriesData).map(([id, data]) => ({
            updateOne: {
                filter: { id },
                update: {
                    $set: {
                        id,
                        name: data.name,
                        description: data.description || '',
                        order: data.order || 0,
                        timeRestricted: data.timeRestricted || false,
                        startTime: data.startTime || '',
                        endTime: data.endTime || '',
                        visible: data.visible !== false
                    }
                },
                upsert: true
            }
        }));

        if (categoryOps.length > 0) {
            const catResult = await Category.bulkWrite(categoryOps);
            console.log(`✅ Categorías migradas: ${catResult.upsertedCount} nuevas, ${catResult.modifiedCount} actualizadas`);
        }

        // Migrar productos
        console.log('\n📦 Migrando productos...');
        const productOps = [];

        Object.entries(menuData).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                // Categoría directa (ej: "parrilla": [...])
                value.forEach((item, index) => {
                    productOps.push({
                        updateOne: {
                            filter: { id: item.id },
                            update: {
                                $set: {
                                    id: item.id,
                                    name: item.name,
                                    description: item.description || '',
                                    price: item.price,
                                    categoryId: key,
                                    section: 'menu',
                                    image: item.image || '',
                                    visible: !item.hidden,
                                    hidden: item.hidden || false,
                                    hiddenReason: item.hiddenReason || '',
                                    hiddenBy: item.hiddenBy || '',
                                    ingredients: item.ingredients || '',
                                    tags: item.tags || [],
                                    order: index
                                }
                            },
                            upsert: true
                        }
                    });
                });
            } else if (typeof value === 'object') {
                // Sección anidada (ej: "vinos": { "tintos": [...] })
                Object.entries(value).forEach(([subKey, items]) => {
                    if (Array.isArray(items)) {
                        items.forEach((item, index) => {
                            productOps.push({
                                updateOne: {
                                    filter: { id: item.id },
                                    update: {
                                        $set: {
                                            id: item.id,
                                            name: item.name,
                                            description: item.description || '',
                                            price: item.price,
                                            categoryId: subKey,
                                            section: key,
                                            image: item.image || '',
                                            visible: !item.hidden,
                                            hidden: item.hidden || false,
                                            hiddenReason: item.hiddenReason || '',
                                            hiddenBy: item.hiddenBy || '',
                                            ingredients: item.ingredients || '',
                                            tags: item.tags || [],
                                            order: index
                                        }
                                    },
                                    upsert: true
                                }
                            });
                        });
                    }
                });
            }
        });

        if (productOps.length > 0) {
            const prodResult = await Product.bulkWrite(productOps);
            console.log(`✅ Productos migrados: ${prodResult.upsertedCount} nuevos, ${prodResult.modifiedCount} actualizados`);
        }

        console.log('\n🎉 Migración completada exitosamente!');
        console.log(`📊 Total: ${categoryOps.length} categorías, ${productOps.length} productos`);

        await mongoose.disconnect();
        console.log('\n🔌 Desconectado de MongoDB');
        process.exit(0);

    } catch (error) {
        console.error('\n❌ Error durante la migración:', error);
        process.exit(1);
    }
}

migrate();

