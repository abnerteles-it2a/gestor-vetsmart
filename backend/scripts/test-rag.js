
// Native fetch is available in Node 18+
async function testRAG() {
    try {
        console.log('🧪 Testing RAG Integration...');

        // 1. Login
        const loginRes = await fetch('http://localhost:3001/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@vetsmart.com', password: '123456' })
        });
        
        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);
        const { token } = await loginRes.json();
        console.log('✅ Login successful.');

        // 2. Call AI Endpoint with Dermatitis symptoms
        console.log('🧠 Requesting AI diagnosis (expecting RAG usage)...');
        const aiRes = await fetch('http://localhost:3001/api/ai/suggest-treatment', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                species: 'Cachorro',
                breed: 'Bulldog Francês',
                age: '3 anos',
                weight: '12kg',
                symptoms: 'Coceira intensa nas patas e orelhas. Não respondeu bem a prednisona.',
                history: 'Suspeita de atopia.'
            })
        });

        if (!aiRes.ok) {
            const errText = await aiRes.text();
            throw new Error(`AI Request failed: ${aiRes.status} - ${errText}`);
        }

        const aiData = await aiRes.json();
        console.log('✅ AI Response received.');
        console.log('--- RAG Metadata ---');
        console.log(aiData._meta);
        
        console.log('\n--- Treatment Plan Snippet ---');
        // Log parts of the response to verify content
        console.log(JSON.stringify(aiData, null, 2));

    } catch (err) {
        console.error('❌ Test failed:', err);
    }
}

testRAG();
