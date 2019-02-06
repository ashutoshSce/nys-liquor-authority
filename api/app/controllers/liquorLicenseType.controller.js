const {
  to
} = require('await-to-js');
const util = require('util');
const fp = require('lodash/fp');

const logger = require('../logger');
const liquorLicenseMaster = require('../models/liquorLicenseMaster.model');

const get = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  let licenseMaster, err, liquorLicenseTypeList=[];
  [err, licenseMaster] = await to(liquorLicenseMaster.findOne().lean());
  Object.keys(licenseMaster.r_license_type).forEach(key => {
    liquorLicenseTypeList.push({
      id: key,
      name: licenseMaster.r_license_type[key]
    });
  });
  liquorLicenseTypeList = fp.sortBy('name')(liquorLicenseTypeList);
  res.status(200).json(liquorLicenseTypeList);
};

module.exports.get = get;