const fetch = require('node-fetch');
const cheerio = require('cheerio');

const urls = [
  'https://uxdesign.cc/designing-for-adhd-keeping-focus-in-mind-3168d19b48d2',
  'https://www.additudemag.com/best-adhd-apps-organization-productivity/',
  'https://chadd.org/for-adults/organizing-and-managing-time-and-space/',
  'https://sensoryminds.com/articles/designing-for-adhd/',
  'https://builtinformars.com/case-studies/adhd-ux'
];

async function run() {
  console.log("Fetching sources...");
  for (const url of urls) {
    try {
      console.log(`\n--- Fetching ${url} ---`);
      const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      if (!res.ok) {
        console.log(`Failed to fetch ${url}: ${res.status}`);
        continue;
      }
      const html = await res.text();
      const $ = cheerio.load(html);
      
      // Remove scripts and styles
      $('script').remove();
      $('style').remove();
      
      // Get main text content (approximation)
      const text = $('body').text().replace(/\s+/g, ' ').substring(0, 1500); // Limit length
      console.log(text);
    } catch (e) {
      console.log(`Error fetching ${url}: ${e.message}`);
    }
  }
}

run();
