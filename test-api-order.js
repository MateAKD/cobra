// Test script to verify the API response
const testSubcategoryOrderAPI = async () => {
    try {
        console.log('🧪 Testing /api/admin/subcategory-order endpoint...\n');

        const response = await fetch('http://localhost:3000/api/admin/subcategory-order', {
            cache: 'no-store'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        console.log('📦 API Response:');
        console.log(JSON.stringify(data, null, 2));

        console.log('\n📋 Subcategories for "principales":');
        if (data.principales) {
            data.principales.forEach((id, index) => {
                console.log(`  ${index}. ${id}`);
            });
        } else {
            console.log('  ⚠️  No subcategories found for "principales"');
        }

    } catch (error) {
        console.error('❌ Error:', error);
    }
};

testSubcategoryOrderAPI();
