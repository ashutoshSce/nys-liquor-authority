/* Command: node list-county.js */
const fs = require('fs');
require('dotenv').config({
  path: __dirname + '/.env'
});
const puppeteer = require('puppeteer');
const LoggerModule = require('./logger');

(async () => {
  const logger = new LoggerModule();

  process.on('unhandledRejection', (err) => {
    logger.sendMessageToSlack('Caught exceptionn: ' + err.toString());
    process.exit();
  });

  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });


  const page = await browser.newPage();
  const pageUrl = 'https://www.tran.sla.ny.gov/JSP/query/PublicQueryAdvanceSearchPage.jsp';
  await page.goto(pageUrl);

  const countryMap = await page.evaluate(() => {
    const countryMap = {};
    document.querySelectorAll('#county option').forEach((node) => {
      const id = node.getAttribute('value');
      if(typeof id !== undefined && id !== '') {
        countryMap[id.trim()] = node.textContent.trim();
      }
    });
    return countryMap;
  });

  console.log(countryMap);
  console.log(Object.keys(countryMap).length);
  await page.close();
  await browser.close();
})();