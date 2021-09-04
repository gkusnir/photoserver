/*
  testing UI photoserver
*/

let wdir = '/media/data/projects/gkusnir/photoserver';
let puppeteer_module_path = wdir + "/symlinks/.nodeenvs/puppeteer/node_modules/puppeteer"; 

//const puppeteer = require('puppeteer');
const puppeteer = require(puppeteer_module_path);

// output file
let out_file = wdir + '/puppeteer/example.png';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://example.com');
  await page.screenshot({ path: out_file });

  await browser.close();
})();
