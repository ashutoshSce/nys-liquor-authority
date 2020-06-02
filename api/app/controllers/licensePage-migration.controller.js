const { to } = require('await-to-js');
const fs = require('fs');

const licensePage = require('../models/licensePage.model');

const exportData = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  let licensePageList = [];
  const licensePages = [];
  let err = {};
  const skip = parseInt(req.query.skip, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 5;
  const format = req.query.format || 'file';
  [err, licensePageList] = await to(
    licensePage
      .find()
      .skip(skip)
      .limit(limit)
  );
  if (!err) {
    licensePageList.forEach(vendor => {
      const item = {
        serial_number: vendor.serial_number
      };

      if (vendor.county !== undefined) {
        item.county = vendor.county;
      }

      if (vendor.license_type !== undefined) {
        item.license_type = vendor.license_type;
      }

      if (vendor.link !== undefined) {
        item.link = vendor.link;
      }

      licensePages.push(item);
    });
    if (format === 'file') {
      const path = `./migrations/l-${skip}-${limit}.json`;
      fs.writeFile(path, JSON.stringify(licensePages), e => {
        if (e) {
          throw e;
        }
      });
    }
  } else {
    console.log(err);
  }
  if (format === 'file') {
    res.status(200).json({
      count: licensePages.length,
      first: licensePages[0],
      last: licensePages[licensePages.length - 1]
    });
  } else if (format === 'json') {
    res.status(200).json(licensePages);
  }
};

const importData = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  let licensePageList = [];
  const skip = req.query.skip || 0;
  const limit = req.query.limit || 5;
  const path = `./migrations/l-${skip}-${limit}.json`;
  const data = fs.readFileSync(path);
  licensePageList = JSON.parse(data.toString());

  await to(licensePage.collection.insertMany(licensePageList));
  res.status(200).json({
    count: licensePageList.length,
    first: licensePageList[0],
    last: licensePageList[licensePageList.length - 1]
  });
};

module.exports.exportData = exportData;
module.exports.importData = importData;
