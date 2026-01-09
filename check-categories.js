const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function check() {
    try {
        const uri = process.env.MONGODB_URI;
        console.log('🔌 Conectando a MongoDB...');
        if (!uri) {
            console.error('❌ MONGODB_URI no definida en .env.local');
            process.exit(1);
        }
        console.log('URI starts with:', uri.substring(0, 20) + '...');
        await mongoose.connect(uri);
        console.log('✅ Conectado\n');

        const CategorySchema = new mongoose.Schema({
            id: String,
            name: String,
            order: Number,
            isSubcategory: Boolean,
            parentCategory: String,
            visible: Boolean
        });
        const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

        console.log('--- CATEGORÍAS PRINCIPALES ---');
        const mainCats = await Category.find({
            $or: [
                { isSubcategory: false },
                { isSubcategory: { $exists: false } },
                { parentCategory: { $exists: false } },
                { parentCategory: null }
            ]
        }).sort({ order: 1 });

        mainCats.forEach(c => {
            console.log(`[${c.order}] ${c.name} (${c.id})`);
        });

        console.log('\n--- SUBCATEGORÍAS DE PRINCIPALES ---');
        const subCats = await Category.find({ parentCategory: 'principales' }).sort({ order: 1 });
        subCats.forEach(c => {
            console.log(`[${c.order}] ${c.name} (${c.id})`);
        });

        console.log('\n--- TODAS LAS SUBCATEGORÍAS ---');
        const allSubs = await Category.find({
            $or: [
                { isSubcategory: true },
                { parentCategory: { $exists: true, $ne: null } }
            ]
        }).sort({ parentCategory: 1, order: 1 });

        allSubs.forEach(c => {
            console.log(`[${c.parentCategory}] [${c.order}] ${c.name} (${c.id})`);
        });

        await mongoose.disconnect();
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

check();
