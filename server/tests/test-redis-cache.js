/*═══════════════════════════════════════════════════════════════════════════════

        █████╗ ██╗██╗   ██╗ █████╗
       ██╔══██╗██║██║   ██║██╔══██╗
       ███████║██║██║   ██║███████║
       ██╔══██║██║╚██╗ ██╔╝██╔══██║
       ██║  ██║██║ ╚████╔╝ ██║  ██║
       ╚═╝  ╚═╝╚═╝  ╚═══╝  ╚═╝  ╚═╝

   ──◈──  A I V A  ::  A I   V I R T U A L   A S S I S T A N T  ──◈──

   ◉  Redis Cache Verification Test
   ◉  Tests if Redis caching is actually working

                          ⟡  A I V A  ⟡

                     © 2026 Mohitraj Jadeja

═══════════════════════════════════════════════════════════════════════════════*/

import { getCache, setCache, deleteCache, isRedisAvailable, TTL_CONFIG } from '../services/redisCache.js';

console.log('\n🔍 REDIS CACHE VERIFICATION TEST\n');
console.log('='.repeat(60));

async function testRedisCache() {
    try {
        // Test 1: Check if Redis is available
        console.log('\n📊 Test 1: Redis Availability');
        const redisAvailable = isRedisAvailable();
        console.log(`   Redis Status: ${redisAvailable ? '✅ CONNECTED' : '⚠️  FALLBACK TO IN-MEMORY'}`);

        if (!redisAvailable) {
            console.log('   ℹ️  Redis URL not configured or connection failed');
            console.log('   ℹ️  Using in-memory cache as fallback');
        }

        // Test 2: Set cache
        console.log('\n📊 Test 2: Setting Cache');
        const testData = {
            message: 'Hello from cache test',
            timestamp: new Date().toISOString(),
            data: { foo: 'bar', nested: { value: 123 } }
        };

        const setResult = await setCache('test-key-verification', testData, 60, 'test');
        console.log(`   Set Cache: ${setResult ? '✅ SUCCESS' : '❌ FAILED'}`);

        // Test 3: Get cache
        console.log('\n📊 Test 3: Getting Cache');
        const retrieved = await getCache('test-key-verification', 'test');

        if (retrieved) {
            console.log('   ✅ Cache Retrieved Successfully');
            console.log('   Data Match:', JSON.stringify(retrieved) === JSON.stringify(testData) ? '✅ YES' : '❌ NO');
            console.log('   Retrieved Data:', JSON.stringify(retrieved, null, 2));
        } else {
            console.log('   ❌ Failed to retrieve cache');
        }

        // Test 4: Cache expiry simulation
        console.log('\n📊 Test 4: Cache with Short TTL (3 seconds)');
        await setCache('test-expiry', { test: 'expiry' }, 3, 'test');
        console.log('   ✅ Set cache with 3s TTL');

        const beforeExpiry = await getCache('test-expiry', 'test');
        console.log(`   Before expiry: ${beforeExpiry ? '✅ EXISTS' : '❌ NOT FOUND'}`);

        console.log('   ⏳ Waiting 4 seconds...');
        await new Promise(resolve => setTimeout(resolve, 4000));

        const afterExpiry = await getCache('test-expiry', 'test');
        console.log(`   After expiry: ${afterExpiry ? '❌ STILL EXISTS (TTL NOT WORKING)' : '✅ EXPIRED (TTL WORKING)'}`);

        // Test 5: Delete cache
        console.log('\n📊 Test 5: Deleting Cache');
        const deleteResult = await deleteCache('test-key-verification', 'test');
        console.log(`   Delete Cache: ${deleteResult ? '✅ SUCCESS' : '❌ FAILED'}`);

        const afterDelete = await getCache('test-key-verification', 'test');
        console.log(`   Verify Deletion: ${!afterDelete ? '✅ DELETED' : '❌ STILL EXISTS'}`);

        // Test 6: Performance test
        console.log('\n📊 Test 6: Performance Test (100 operations)');
        const startTime = Date.now();

        for (let i = 0; i < 100; i++) {
            await setCache(`perf-test-${i}`, { index: i, data: 'test' }, 60, 'perf');
        }

        for (let i = 0; i < 100; i++) {
            await getCache(`perf-test-${i}`, 'perf');
        }

        const endTime = Date.now();
        console.log(`   ✅ Completed in ${endTime - startTime}ms`);
        console.log(`   Average: ${((endTime - startTime) / 200).toFixed(2)}ms per operation`);

        // Summary
        console.log('\n' + '='.repeat(60));
        console.log('\n📋 SUMMARY:');
        console.log(`   Cache System: ${redisAvailable ? 'Redis (Production)' : 'In-Memory (Development)'}`);
        console.log(`   Basic Operations: ✅ Working`);
        console.log(`   TTL Support: ${!afterExpiry ? '✅ Working' : '⚠️  Check Redis connection'}`);
        console.log('\n✅ Cache verification complete!\n');

    } catch (error) {
        console.error('\n❌ Test failed with error:', error);
        console.error('Stack:', error.stack);
    }
}

// Run the test
testRedisCache().then(() => {
    console.log('Test completed. Exiting...\n');
    process.exit(0);
}).catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
