const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env.local') });

async function checkCategoriesAndProducts() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB');

        const categories = await mongoose.connection.db.collection('categories').find({}).toArray();
        const products = await mongoose.connection.db.collection('products').find({ deletedAt: null }).toArray();

        console.log('\n--- CATEGORÍAS ---');
        categories.forEach(c => {
            const pCount = products.filter(p => p.categoryId === c.id).length;
            console.log(`ID: ${c.id.padEnd(25)} | Name: ${String(c.name || '').padEnd(20)} | Parent: ${String(c.parentCategory || 'N/A').padEnd(15)} | Prods: ${pCount}`);
        });

        console.log('\n--- CATEGORÍAS PADRE POTENCIALMENTE VACÍAS ---');
        const parents = [...new Set(categories.map(c => c.parentCategory).filter(Boolean))];
        parents.forEach(pId => {
            const children = categories.filter(c => c.parentCategory === pId).map(c => c.id);
            const childProds = products.filter(p => children.includes(p.categoryId)).length;
            const directProds = products.filter(p => p.categoryId === pId).length;
            console.log(`Parent ID: ${pId.padEnd(20)} | Children: ${children.length} | Child Prods: ${childProds} | Direct Prods: ${directProds}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error:', error);
    }
}

checkCategoriesAndProducts();
