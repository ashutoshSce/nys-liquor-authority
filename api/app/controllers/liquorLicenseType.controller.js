const { to } = require('await-to-js');
const fp = require('lodash/fp');

const liquorLicenseMaster = require('../models/liquorLicenseMaster.model');

const get = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  let liquorLicenseTypeList = [];
  const [, licenseMaster] = await to(liquorLicenseMaster.findOne().lean());
  Object.keys(licenseMaster.license_type).forEach(key => {
    liquorLicenseTypeList.push({
      id: key,
      name: licenseMaster.license_type[key]
    });
  });
  liquorLicenseTypeList = fp.sortBy('name')(liquorLicenseTypeList);
  res.status(200).json(liquorLicenseTypeList);
};

module.exports.get = get;
