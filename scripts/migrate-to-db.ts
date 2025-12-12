import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import Category from '../models/Category';
import Product from '../models/Product';
import connectDB from '../lib/db';

// Load environment variables from .env.local
dotenv.config({ path: '.env.local' });

const DATA_DIR = path.join(process.cwd(), 'data');

async function migrate() {
    console.log('🚀 Starting migration...');

    try {
        // 1. Connect to Database
        await connectDB();
        console.log('✅ Connected to MongoDB');

        // 2. Clear existing data (optional, for safety during dev, maybe comment out for prod? 
        // ideally we want this to be idempotent or clean slate since it's first run)
        await Category.deleteMany({});
        await Product.deleteMany({});
        console.log('🧹 Cleared existing collections');

        // 3. Migrate Categories
        const categoriesPath = path.join(DATA_DIR, 'categories.json');
        const categoriesData = JSON.parse(await fs.readFile(categoriesPath, 'utf8'));

        // Read subcategory mapping to identify parents
        const subMappingPath = path.join(DATA_DIR, 'subcategory-mapping.json');
        let subCategoryMapping: Record<string, string> = {};
        try {
            subCategoryMapping = JSON.parse(await fs.readFile(subMappingPath, 'utf8'));
        } catch (e) {
            console.log('ℹ️ No subcategory mapping found or error reading it');
        }

        const categoriesToInsert = [];

        for (const [id, cat] of Object.entries(categoriesData) as [string, any][]) {
            const parentId = subCategoryMapping[id];
            categoriesToInsert.push({
                id: id,
                name: cat.name,
                description: cat.description || '',
                order: cat.order || 0,
                timeRestricted: cat.timeRestricted || false,
                startTime: cat.startTime,
                endTime: cat.endTime,
                // We assume visible true by default unless specified otherwise
                visible: true,
                isSubcategory: !!parentId,
                parentCategory: parentId,
                image: cat.image
            });
        }

        if (categoriesToInsert.length > 0) {
            await Category.insertMany(categoriesToInsert);
            console.log(`✅ Migrated ${categoriesToInsert.length} categories`);
        }

        // 4. Migrate Products (Menu)
        const menuPath = path.join(DATA_DIR, 'menu.json');
        const menuData = JSON.parse(await fs.readFile(menuPath, 'utf8'));
        const productsToInsert: any[] = [];

        // Helper to process items
        const processItems = (items: any[], categoryId: string, sectionName: string) => {
            if (!Array.isArray(items)) return;

            items.forEach((item, index) => {
                productsToInsert.push({
                    id: item.id || `${categoryId}-${index}-${Date.now()}`,
                    name: item.name,
                    description: item.description,
                    price: item.price,
                    categoryId: categoryId,
                    section: sectionName,
                    image: item.image,
                    ingredients: item.ingredients,
                    glass: item.glass,
                    technique: item.technique,
                    garnish: item.garnish,
                    tags: item.tags || [],
                    hidden: !!item.hidden,
                    hiddenReason: item.hiddenReason,
                    hiddenBy: item.hiddenBy,
                    hiddenAt: item.hiddenAt,
                    order: index
                });
            });
        };

        // Iterate over top-level keys in menu.json
        for (const [key, value] of Object.entries(menuData)) {
            if (Array.isArray(value)) {
                // Direct category (e.g., "entradas")
                processItems(value, key, 'menu');
            } else if (typeof value === 'object' && value !== null) {
                // Nested section (e.g., "vinos", "promociones")
                // "vinos": { "tintos": [...], "blancos": [...] }
                for (const [subKey, subValue] of Object.entries(value)) {
                    // Flatten: categoryId becomes the subKey (e.g., "tintos")
                    // We mark the section as the parent key (e.g., "vinos")
                    processItems(subValue as any[], subKey, key);
                }
            }
        }

        if (productsToInsert.length > 0) {
            await Product.insertMany(productsToInsert);
            console.log(`✅ Migrated ${productsToInsert.length} products`);
        }

        console.log('🎉 Migration completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

migrate();
