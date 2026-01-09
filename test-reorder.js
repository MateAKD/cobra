// Native fetch in Node 18+

const API_URL = 'http://localhost:3000/api/admin/subcategory-order';

const testReorder = async () => {
    // 1. Get current
    console.log('Fetching current order...');
    const res1 = await fetch(API_URL, { cache: 'no-store' });
    const currentOrder = await res1.json();
    console.log('Current Principales:', currentOrder.principales);

    // 2. Reorder: Reverse it
    if (!currentOrder.principales) {
        console.error('No principales found');
        return;
    }
    const reversed = [...currentOrder.principales].reverse();
    console.log('Sending new order:', reversed);

    const res2 = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            categoryId: 'principales',
            subcategoryOrder: reversed
        })
    });
    const updateRes = await res2.json();
    console.log('Update response:', updateRes);

    // 3. Verify
    console.log('Verifying...');
    const res3 = await fetch(API_URL, { cache: 'no-store' });
    const newOrder = await res3.json();
    console.log('New Principales:', newOrder.principales);

    if (JSON.stringify(newOrder.principales) === JSON.stringify(reversed)) {
        console.log('SUCCESS: Order persisted.');
    } else {
        console.log('FAILURE: Order mismatch.');
        console.log('Expected:', reversed);
        console.log('Got:', newOrder.principales);
    }
};

testReorder();
