// Memory monitoring script - runs alongside Next.js dev server
// Logs memory usage to terminal without interfering with the dev server

let lastMemory = null;

const logMemoryUsage = () => {
  const memory = process.memoryUsage();
  const timestamp = new Date().toISOString();
  
  console.log('\n🔍 [MEMORY DIAGNOSTICS]');
  console.log(`   Time: ${timestamp}`);
  console.log(`   RSS (Resident Set Size): ${(memory.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Heap Total: ${(memory.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Heap Used: ${(memory.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   External: ${(memory.external / 1024 / 1024).toFixed(2)} MB`);
  console.log(`   Array Buffers: ${(memory.arrayBuffers / 1024 / 1024).toFixed(2)} MB`);
  
  if (lastMemory) {
    const rssDiff = memory.rss - lastMemory.rss;
    const heapUsedDiff = memory.heapUsed - lastMemory.heapUsed;
    const heapTotalDiff = memory.heapTotal - lastMemory.heapTotal;
    
    console.log(`   📊 RSS Change: ${(rssDiff / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   📊 Heap Used Change: ${(heapUsedDiff / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   📊 Heap Total Change: ${(heapTotalDiff / 1024 / 1024).toFixed(2)} MB`);
    
    if (rssDiff > 50 * 1024 * 1024) {
      console.log('   ⚠️  WARNING: RSS increased by >50MB since last check');
    }
    if (heapUsedDiff > 50 * 1024 * 1024) {
      console.log('   ⚠️  WARNING: Heap used increased by >50MB since last check');
    }
  }
  
  // Heap usage percentage
  const heapPercent = (memory.heapUsed / memory.heapTotal * 100).toFixed(1);
  console.log(`   Heap Usage: ${heapPercent}%`);
  
  if (heapPercent > 90) {
    console.log('   🚨 CRITICAL: Heap usage >90%');
  } else if (heapPercent > 80) {
    console.log('   ⚠️  WARNING: Heap usage >80%');
  }
  
  lastMemory = memory;
  console.log('   ' + '─'.repeat(50) + '\n');
};

// Log memory every 30 seconds
const memoryInterval = setInterval(logMemoryUsage, 30000);

// Initial memory log
logMemoryUsage();

// Log memory on garbage collection if available
if (global.gc) {
  const originalGC = global.gc;
  global.gc = () => {
    console.log('\n🧹 [GARBAGE COLLECTION]');
    logMemoryUsage();
    originalGC();
  };
}

console.log('🔍 Memory monitor started - logging every 30s');
console.log('💡 Run with --expose-gc flag to enable GC logging: node --expose-gc memory-monitor.js');

// Cleanup on exit
process.on('SIGINT', () => {
  clearInterval(memoryInterval);
  console.log('\n🔍 [FINAL MEMORY STATE]');
  logMemoryUsage();
  process.exit();
});
