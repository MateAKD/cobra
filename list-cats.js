const mongoose = require('mongoose');
require('dotenv').config({ path: '.env.local' });

async function check() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const Category = mongoose.models.Category || mongoose.model('Category', new mongoose.Schema({
            id: String,
            name: String,
            order: Number,
            isSubcategory: Boolean,
            parentCategory: String
        }));

        const cats = await Category.find({}).sort({ parentCategory: 1, order: 1 }).lean();

        console.log('ID | NAME | PARENT | ORDER | IS_SUB');
        console.log('---|------|--------|-------|-------');
        cats.forEach(c => {
            console.log(`${c.id} | ${c.name} | ${c.parentCategory || '-'} | ${c.order} | ${c.isSubcategory}`);
        });

        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
    }
}
check();
