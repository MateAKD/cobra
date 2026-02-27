const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, '.env.local') });

async function checkProducts() {
    try {
        if (!process.env.MONGODB_URI) {
            console.error('ERROR: MONGODB_URI no definida en .env.local');
            return;
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB');

        const products = await mongoose.connection.db.collection('products').find({ deletedAt: null }).toArray();

        const categoriesStats = {};
        products.forEach(p => {
            const catId = p.categoryId || 'sin-categoria';
            if (!categoriesStats[catId]) {
                categoriesStats[catId] = { total: 0, visible: 0, hidden: 0 };
            }
            categoriesStats[catId].total++;
            if (p.hidden) categoriesStats[catId].hidden++;
            else categoriesStats[catId].visible++;
        });

        console.log('--- ESTADÍSTICAS DE PRODUCTOS POR CATEGORIA ---');
        console.table(categoriesStats);

        const targetCategories = ['promociones', 'bebidas', 'desayunos-y-meriendas', 'principales', 'bebidas-sin-alcohol', 'cervezas'];
        targetCategories.forEach(catId => {
            const pCount = products.filter(p => p.categoryId === catId).length;
            console.log(`Categoría "${catId}": ${pCount} productos found.`);
        });

        const sections = await mongoose.connection.db.collection('products').distinct('section');
        console.log('Secciones encontradas en DB:', sections);

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkProducts();
