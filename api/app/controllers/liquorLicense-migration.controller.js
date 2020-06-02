const { to } = require('await-to-js');
const fs = require('fs');

const liquorLicense = require('../models/liquorLicense.model');

const exportData = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  let liquorLicenseList = [];
  const liquorLicenses = [];
  let err = {};
  const skip = parseInt(req.query.skip, 10) || 0;
  const limit = parseInt(req.query.limit, 10) || 5;
  const format = req.query.format || 'file';
  [err, liquorLicenseList] = await to(
    liquorLicense
      .find()
      .skip(skip)
      .limit(limit)
  );
  if (!err) {
    liquorLicenseList.forEach(vendor => {
      const item = {
        serial_number: vendor.serial_number
      };

      if (vendor.license_type !== undefined) {
        item.license_type = vendor.license_type;
      }

      if (vendor.license_status !== undefined) {
        item.license_status = vendor.license_status;
      }

      if (vendor.credit_group !== undefined) {
        item.credit_group = vendor.credit_group;
      }

      if (vendor.filing_date !== undefined) {
        item.filing_date = vendor.filing_date;
      }

      if (vendor.effective_date !== undefined) {
        item.effective_date = vendor.effective_date;
      }

      if (vendor.expiration_date !== undefined) {
        item.expiration_date = vendor.expiration_date;
      }

      if (vendor.principal_name !== undefined) {
        item.principal_name = vendor.principal_name;
      }

      if (vendor.premises_name !== undefined) {
        item.premises_name = vendor.premises_name;
      }

      if (vendor.trade_name !== undefined) {
        item.trade_name = vendor.trade_name;
      }

      if (vendor.zone !== undefined) {
        item.zone = vendor.zone;
      }

      if (vendor.address !== undefined) {
        item.address = vendor.address;
      }

      if (vendor.zip !== undefined) {
        item.zip = vendor.zip;
      }

      if (vendor.county !== undefined) {
        item.county = vendor.county;
      }

      if (vendor.link !== undefined) {
        item.link = vendor.link;
      }

      liquorLicenses.push(item);
    });
    if (format === 'file') {
      const path = `./migrations/${skip}-${limit}.json`;
      fs.writeFile(path, JSON.stringify(liquorLicenses), e => {
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
      count: liquorLicenses.length,
      first: liquorLicenses[0],
      last: liquorLicenses[liquorLicenses.length - 1]
    });
  } else if (format === 'json') {
    res.status(200).json(liquorLicenses);
  }
};

const importData = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  let liquorLicenseList = [];
  const skip = req.query.skip || 0;
  const limit = req.query.limit || 5;
  const path = `./migrations/${skip}-${limit}.json`;
  const data = fs.readFileSync(path);
  liquorLicenseList = JSON.parse(data.toString());
  liquorLicenseList.forEach(item => {
    if (item.filing_date !== undefined) {
      item.filing_date = new Date(item.filing_date);
    }

    if (item.effective_date !== undefined) {
      item.effective_date = new Date(item.effective_date);
    }

    if (item.expiration_date !== undefined) {
      item.expiration_date = new Date(item.expiration_date);
    }
  });

  await to(liquorLicense.collection.insertMany(liquorLicenseList));
  res.status(200).json({
    count: liquorLicenseList.length,
    first: liquorLicenseList[0],
    last: liquorLicenseList[liquorLicenseList.length - 1]
  });
};

module.exports.exportData = exportData;
module.exports.importData = importData;
