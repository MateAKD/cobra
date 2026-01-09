// Script para verificar el estado de las subcategorías en MongoDB
// Ejecutar con: node verify-subcategory-order.js

const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

const CategorySchema = new mongoose.Schema({
    id: String,
    name: String,
    order: Number,
    parentCategory: String,
    isSubcategory: Boolean
});

const Category = mongoose.models.Category || mongoose.model('Category', CategorySchema);

async function verifySubcategoryOrder() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Buscar subcategorías de "principales"
        const subcats = await Category.find({
            parentCategory: 'principales'
        }).sort({ order: 1 }).lean();

        console.log('📋 Subcategorías de "principales" (ordenadas por campo "order"):');
        console.log('================================================================\n');

        subcats.forEach((subcat, index) => {
            console.log(`${index + 1}. ${subcat.name}`);
            console.log(`   - ID: ${subcat.id}`);
            console.log(`   - Order: ${subcat.order}`);
            console.log(`   - Parent: ${subcat.parentCategory}`);
            console.log(`   - isSubcategory: ${subcat.isSubcategory}`);
            console.log('');
        });

        console.log('\n📊 Resumen:');
        console.log(`Total de subcategorías: ${subcats.length}`);

        // Verificar si hay duplicados en el campo "order"
        const orders = subcats.map(s => s.order);
        const duplicates = orders.filter((item, index) => orders.indexOf(item) !== index);
        if (duplicates.length > 0) {
            console.log(`⚠️  ADVERTENCIA: Hay valores duplicados en "order": ${duplicates.join(', ')}`);
        } else {
            console.log('✅ No hay duplicados en el campo "order"');
        }

        await mongoose.connection.close();
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

verifySubcategoryOrder();
