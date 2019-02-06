/* Command: node download-latest-list.js NEW 1 */

require('dotenv').config();
const puppeteer = require('puppeteer');
const {
  spawn
} = require('child_process');

const MongoModule = require('./mongo');
const LoggerModule = require('./logger');

const countryName = process.argv[2];
const dropCollection = process.argv[3];

(async () => {
  const logger = new LoggerModule();

  process.on('unhandledRejection', (err) => {
    logger.sendMessageToSlack('Caught exception: ' + err.toString());
    spawn(process.env.NODE_PATH, [process.env.APP_PATH + '/download-latest-list.js', 'NEW', '1'], {
      detached: true
    });
    setInterval(() => process.exit(1), 1000);
  });

  let message = 'Start Running, getting records for country ' + countryName;
  if (dropCollection !== undefined) {
    message += ', also deleted existing records.';
  }
  logger.sendMessageToSlack(message);
  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true
  });
  const page = await browser.newPage();
  await page.goto('https://www.tran.sla.ny.gov/JSP/query/PublicQueryAdvanceSearchPage.jsp');

  const mongo = new MongoModule();
  await mongo.connectToDb();
  const definedObjects = await mongo.readObject('licenseMaster');
  if (dropCollection !== undefined) {
    if (definedObjects.country[countryName] === undefined) {
      let message = 'New Country Name:' + countryName;
      logger.sendMessageToSlack(message);
      setInterval(() => process.exit(1), 1000);
    }
    await mongo.destroyObject('licenseInfo', {
      country: definedObjects.country[countryName],
    });
    await mongo.destroyObject('licensePage', {
      country: countryName
    });
  }

  await page.select('#county', countryName);
  await Promise.all([
    await page.click('#searchButton'),
    page.waitForNavigation({
      waitUntil: 'networkidle0'
    }),
  ]);

  await page.click('form[name=AdvanceSearchResults] a:nth-child(2)');
  await page.waitFor(6000);

  const textContent = await page.content();
  await browser.close();

  const contentsArr = textContent.split('\n');
  const contentsArrLength = contentsArr.length;

  for (let index = 0; index < contentsArrLength; index++) {
    if (contentsArr[index].match(/(^$)|(<html>)|(#County)/g)) {
      continue;
    }
    const rowText = contentsArr[index].split('\t');

    if (definedObjects.r_license_type[rowText[2].trim()] === undefined) {
      logger.sendMessageToSlack('https://www.tran.sla.ny.gov/servlet/ApplicationServlet?pageName=com.ibm.nysla.data.publicquery.PublicQuerySuccessfulResultsPage&validated=true&serialNumber=' + rowText[0] + '&licenseType=' + rowText[2].trim());
    }

    await mongo.writeObject('licensePage', {
      serial_number: parseFloat(rowText[0].trim()),
      country: rowText[1].trim(),
      license_type: rowText[2].trim(),
      link: 'https://www.tran.sla.ny.gov/servlet/ApplicationServlet?pageName=com.ibm.nysla.data.publicquery.PublicQuerySuccessfulResultsPage&validated=true&serialNumber=' + rowText[0] + '&licenseType=' + rowText[2].trim()
    });
  }

  await mongo.disconnectToDb();
  logger.sendMessageToSlack('Finished Scraping, ' + contentsArrLength + ' records found for country ' + definedObjects.country[countryName]);

  spawn(process.env.NODE_PATH, [process.env.APP_PATH + '/license-info.js'], {
    detached: true
  });
  setInterval(() => process.exit(1), 1000);
})();