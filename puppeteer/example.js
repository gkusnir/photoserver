//const puppeteer = require('puppeteer');
const puppeteer = require('../../../node/.nodeenvs/puppeteer/node_modules/puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({ path: 'example.png' });

  await browser.close();
})();
