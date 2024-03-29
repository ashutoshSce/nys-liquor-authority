/* Command: node license-county.js 0 */
const fs = require('fs');
require('dotenv').config({
  path: __dirname + '/.env'
});
const puppeteer = require('puppeteer');
const {
  spawn
} = require('child_process');

const MongoModule = require('./mongo');
const LoggerModule = require('./logger');
let countyIndex = parseInt(process.argv[2]);

(async () => {
  const logger = new LoggerModule();

  process.on('unhandledRejection', (err) => {
    logger.sendMessageToSlack('Caught exceptionn: ' + err.toString());
    spawn(process.env.NODE_PATH, [__dirname + '/license-county.js', countyIndex], {
      detached: true
    });
    process.exit();
  });

  const mongo = new MongoModule();
  await mongo.connectToDb();
  const definedObjects = await mongo.readObject('licenseMaster');
  if (definedObjects === null) {
    logger.sendMessageToSlack('Forgot to run insert-into-master.js file. Plz run `node insert-into-master.js`');
    process.exit();
    return;
  }
  const countyList = Object.keys(definedObjects.county);
  const newLicenseType = {};

  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  while (countyIndex < countyList.length) {
    let message = 'Start Running, getting records for Index:' + countyIndex + ' and county ' + definedObjects.county[countyList[countyIndex]];
    logger.sendMessageToSlack(message);
    await mongo.destroyObject('licensePage', {
      county: countyList[countyIndex]
    });

    const page = await browser.newPage();
    const pageUrl = 'https://www.tran.sla.ny.gov/JSP/query/PublicQueryAdvanceSearchPage.jsp';
    await page.goto(pageUrl);

    await page.select('#county', countyList[countyIndex]);

    await page.click('#searchButton');

    try {
      await page.waitForSelector('form[name=AdvanceSearchResults] a:nth-child(2)');
    } catch(error) {
      countyIndex++;
      logger.sendMessageToSlack('No result found' + error.toString());
      spawn(process.env.NODE_PATH, [__dirname + '/license-county.js', countyIndex], {
        detached: true
      });
      process.exit();
    }

    await page.evaluate(() => {
      document.querySelector('form[name=AdvanceSearchResults] a:nth-child(2)').click();
    });
    
    await page.waitForTimeout(60000);

    const textContent = await page.content();

    fs.writeFile(__dirname + '/download/' + countyList[countyIndex] + '.txt', textContent, function (err, data) {
      if (err) console.log(err);
    });

    const contentsArr = textContent.split('\n');
    const contentsArrLength = contentsArr.length;

    const objectList = [];
    for (let index = 0; index < contentsArrLength; index++) {
      if (contentsArr[index].match(/(^$)|(<html>)|(#County)/g)) {
        continue;
      }
      if (index === contentsArrLength - 1) {
        contentsArr[index] = contentsArr[index].replace(/(<\/pre>)|(<\/body>)|(<\/html>)/g, '');
      }

      const rowText = contentsArr[index].split('\t');
      if (rowText[2] === undefined) {
        continue;
      }

      if (definedObjects.license_type[rowText[2].trim()] === undefined && newLicenseType[rowText[2].trim()] === undefined) {
        newLicenseType[rowText[2].trim()] = 'https://www.tran.sla.ny.gov/servlet/ApplicationServlet?pageName=com.ibm.nysla.data.publicquery.PublicQuerySuccessfulResultsPage&validated=true&serialNumber=' + rowText[0] + '&licenseType=' + rowText[2].trim();
      }

      objectList.push({
        serial_number: parseFloat(rowText[0].trim()),
        county: rowText[1].trim(),
        license_type: rowText[2].trim(),
        link: 'https://www.tran.sla.ny.gov/servlet/ApplicationServlet?pageName=com.ibm.nysla.data.publicquery.PublicQuerySuccessfulResultsPage&validated=true&serialNumber=' + rowText[0] + '&licenseType=' + rowText[2].trim()
      });
    }

    if (objectList.length === 0) {
      logger.sendMessageToSlack('Index:' + countyIndex + ' Empty objectList found.');
      process.exit();
    }

    const newLicenseList = Object.values(newLicenseType);
    if (newLicenseList.length > 0) {
      logger.sendMessageToSlack(newLicenseList.join('\n'));
    }

    let flag = true;
    while (flag) {
      await mongo.writeUnOrderedBulkObject('licensePage', objectList)
        .then(() => {
          if (typeof serialIds === 'undefined') {
            flag = false;
          } else if(serialIds.length > 0) {
             mongo.destroyObject('licenseInfo', {
              serial_number: {
                $in: serialIds
              }
             });
	     mongo.destroyObject('licensePage', {
              $or: [{
                  county: countyList[countyIndex]
                },
                {
                  serial_number: {
                    $in: serialIds
                  }
                }
              ]
            }).then(() => flag = true)		  
          } else { throw new Error('Empty Serial IDs Exception.'); }
        })
    }

    logger.sendMessageToSlack('Finished Scraping, ' + objectList.length + ' records found for Index:' + countyIndex + ' and county ' + definedObjects.county[countyList[countyIndex]]);
    countyIndex++;

    await page.close();
  }

  await browser.close();
  await mongo.disconnectToDb();
  logger.sendMessageToSlack('Finished scraping countywise.');
  spawn(process.env.NODE_PATH, [__dirname + '/license-info.js', 1], {
    detached: true
  });
  process.exit();
})();
