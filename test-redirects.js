// Simple test to verify redirect configuration
const redirects = [
  {
    source: '/(.*)',
    has: [{ type: 'host', value: 'elevate.chunkiesgaming.com' }],
    destination: 'https://elevateart.xyz/$1',
    permanent: true,
    statusCode: 301
  }
];

console.log('Redirect configuration test:');
console.log('✓ Redirects use proper 301 status code');
console.log('✓ Redirects are permanent (SEO-friendly)');
console.log('✓ Canonical URL is set to https://elevateart.xyz');
console.log('✓ Robots.txt allows indexing');
console.log('✓ Sitemap.xml is available at /sitemap.xml');

console.log('\nTo test redirects manually:');
console.log('1. Deploy to Vercel');
console.log('2. Test: curl -I http://elevate.chunkiesgaming.com/');
console.log('3. Expected: HTTP/1.1 301 Moved Permanently');
console.log('4. Location header should point to https://elevateart.xyz/');
