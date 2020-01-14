/* Command: node license-info.js */

require('dotenv').config({
  path: __dirname + '/.env'
});
const puppeteer = require('puppeteer');
const {
  spawn
} = require('child_process');

const MongoModule = require('./mongo');
const LoggerModule = require('./logger');

const limit = 1000;

function swap(json) {
  var ret = {};
  for (var key in json) {
    ret[json[key]] = key;
  }
  return ret;
}

async function parseItems(logger, items, definedObjects, index) {
  return new Promise((resolve, reject) => {
    items['serial_number'] = items['serial_number'].trim();
    items['serial_number'] = parseFloat(items['serial_number']);

    if (items['county'] !== undefined) {
      items['county'] = items['county'].trim();
      if (items['county'].trim().length > 0 && definedObjects.county[items['county']] === undefined) {
        logger.sendMessageToSlack('New County found. ' + items['county']);
        resolve(null);
        return null;
      }else if(items['county'].trim().length === 0) {
       
      } else {
        items['county'] = definedObjects.county[items['county']];
      }
    }

    if (items['license_type'] !== undefined) {
      items['license_type'] = items['license_type'].trim();
      if (definedObjects.license_type[items['license_type']] === undefined) {
        let message = 'Index:' + index + ' New License Type:' + items['license_type'] + ' Link:' + items['link'];
        logger.sendMessageToSlack(message);
        resolve(null);
        return null;
      } else {
        items['license_type'] = definedObjects.license_type[items['license_type']];
      }
    }

    if (items['license_status'] !== undefined) {
      items['license_status'] = items['license_status'].trim();
      const licenseStatusMaster = swap(definedObjects.license_status);
      if (licenseStatusMaster[items['license_status']] !== undefined) {
        items['license_status'] = licenseStatusMaster[items['license_status']];
      } else {
        let message = 'Index:' + index + ' New License Status:' + items['license_status'] + ' Link:' + items['link'];
        logger.sendMessageToSlack(message);
        resolve(null);
        return null;
      }
    }

    if (items['zip'] !== undefined && (items['zip'].trim() === '' || items['zip'].trim() === ',')) {
      delete items['zip'];
    }

    if (items['credit_group'] !== undefined && items['credit_group'].trim() !== '') {
      items['credit_group'] = items['credit_group'].trim();
      items['credit_group'] = parseInt(items['credit_group']);
    } else if (items['credit_group'] !== undefined) {
      delete(items['credit_group']);
    }

    if (items['filing_date'] !== undefined && items['filing_date'].trim() !== '') {
      items['filing_date'] = items['filing_date'].trim();
      items['filing_date'] = new Date(items['filing_date']);
    } else if (items['filing_date'] !== undefined) {
      delete(items['filing_date']);
    }

    if (items['effective_date'] !== undefined && items['effective_date'].trim() !== '') {
      items['effective_date'] = items['effective_date'].trim();
      items['effective_date'] = new Date(items['effective_date']);
    } else if (items['effective_date'] !== undefined) {
      delete(items['effective_date']);
    }

    if (items['expiration_date'] !== undefined && items['expiration_date'].trim() !== '') {
      items['expiration_date'] = items['expiration_date'].trim();
      items['expiration_date'] = new Date(items['expiration_date']);
    } else if (items['expiration_date'] !== undefined) {
      delete(items['expiration_date']);
    }

    if (items['zone'] !== undefined && items['zone'].trim() !== '') {
      items['zone'] = items['zone'].trim();
      items['zone'] = parseInt(items['zone']);
    } else if (items['zone'] !== undefined) {
      delete(items['zone']);
    }

    if (items['premises_name'] !== undefined && items['premises_name'].trim() !== '') {
      items['premises_name'] = items['premises_name'].trim();
      items['premises_name'] = items['premises_name'].replace(/&amp;/g, '&');
    } else if (items['premises_name'] !== undefined) {
      delete(items['premises_name']);
    }

    if (items['principal_name'] !== undefined && items['principal_name'].trim() !== '') {
      items['principal_name'] = items['principal_name'].trim();
      items['principal_name'] = items['principal_name'].replace(/\s\s+/g, '');
    } else if (items['principal_name'] !== undefined) {
      delete(items['principal_name']);
    }

    resolve(items);
  });
}

(async () => {
  const logger = new LoggerModule();

  process.on('unhandledRejection', (err) => {
    logger.sendMessageToSlack('Caught exception: ' + err.toString()).then(() => {
      spawn(process.env.NODE_PATH, [__dirname + '/license-info.js'], {
        detached: true
      });
      process.exit();
    });
  });

  logger.sendMessageToSlack('Start Running, limiting records by ' + limit);
  const mongo = new MongoModule();
  await mongo.connectToDb();
  const definedObjects = await mongo.readObject('licenseMaster');
  if (definedObjects === null) {
    logger.sendMessageToSlack('Forgot to run insert-into-master.js file. Plz run `node insert-into-master.js`').then(process.exit());
    return;
  }

  definedObjects.license_type = swap(definedObjects.license_type);
  definedObjects.county = swap(definedObjects.county);
  const licensePageList = await mongo.readObjectByJoin('licensePage', 0, limit);

  const browser = await puppeteer.launch({
    headless: true,
    ignoreHTTPSErrors: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  for (let i = 0; i < licensePageList.length; i++) {
    const page = await browser.newPage();
    const serialNumber = licensePageList[i].serial_number;
    const licenseType = licensePageList[i].license_type;
    const pageUrl = 'https://www.tran.sla.ny.gov/servlet/ApplicationServlet?pageName=com.ibm.nysla.data.publicquery.PublicQuerySuccessfulResultsPage&validated=true&serialNumber=' + serialNumber + '&licenseType=' + licenseType;

    await page.goto(pageUrl);
   
    let items = await page.evaluate((definedObjects) => {
      var items = {};
      var extraItems = new Array();
      var trList = document.querySelectorAll('body > table:nth-child(15) > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2) > table:nth-child(5) > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table:nth-child(6) > tbody > tr');
      var index = 0;
      var tdIndex = 0;
      for (index = 0; index < trList.length; index++) {
        var tdList = trList[index].querySelectorAll('td');
        for (tdIndex = 0; tdIndex < tdList.length;) {
          var text = tdList[tdIndex].innerHTML;
          if (definedObjects[text] !== undefined) {
            tdIndex++
            items[definedObjects[text]] = tdList[tdIndex].innerHTML
          } else if (text.indexOf('&nbsp;') < 0) {
            extraItems.push(text);
          }
          tdIndex++
        }
      }


      var linkEle = document.querySelector('.instructions > a');
      var tableNumber = 9;
      if (linkEle !== null) {
        var linkArr = linkEle.innerHTML.split(' ');
        items['main_bar'] = linkArr[linkArr.length - 1];
        items['main_bar_link'] = linkEle.href;
        tableNumber = 11;
      }

      trList = document.querySelectorAll('body > table:nth-child(15) > tbody > tr:nth-child(1) > td:nth-child(2) > table > tbody > tr:nth-child(2) > td:nth-child(2) > table:nth-child(5) > tbody > tr > td > table > tbody > tr > td:nth-child(2) > table:nth-child(' + tableNumber + ') > tbody > tr');
      for (index = 0; index < trList.length; index++) {
        var tdList = trList[index].querySelectorAll('td');
        for (tdIndex = 0; tdIndex < tdList.length;) {
          var text = tdList[tdIndex].innerHTML;
          if (definedObjects[text] !== undefined) {
            tdIndex++
            items[definedObjects[text]] = tdList[tdIndex].innerHTML
          } else if (text === '') {
            tdIndex++
            items['zip'] = tdList[tdIndex].innerHTML
          } else if (text.indexOf('&nbsp;') < 0) {
            extraItems.push(text);
          }
          tdIndex++
        }
      }

      if (extraItems.length > 0) {
        items['extra'] = extraItems.join('::');
      }

      return items;
    }, definedObjects.keys);

    if (items['serial_number'] === undefined) {
      items['serial_number'] = "" + serialNumber;
    }

    items['link'] = pageUrl;
    if (items['license_type'] === undefined) {
      await mongo.destroyObject('licensePage', {
        serial_number: parseFloat(items.serial_number)
      });
      await page.close();
      continue;
    }
    items = await parseItems(logger, items, definedObjects, i);
    if(items === null){
      await page.close();
      continue;
    }

    const queryObj = {
      serial_number: items.serial_number
    };
    const oldValue = await mongo.queryObject('licenseInfo', queryObj);
    oldValue === null ? await mongo.writeObject('licenseInfo', items) :
      await mongo.updateObject('licenseInfo', items, queryObj);
    
    await page.close();
  }
  
  await browser.close();
  await mongo.disconnectToDb();

  if (licensePageList.length === 0) {
    logger.sendMessageToSlack('Finished Scraping, zero record found.');
  } else {
    logger.sendMessageToSlack('Finished Scraping, reached to limit ' + limit).then(() => {
      spawn(process.env.NODE_PATH, [__dirname + '/license-info.js'], {
        detached: true
      });
      process.exit();
    });
   }
})();
