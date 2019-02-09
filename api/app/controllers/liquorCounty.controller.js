const {
  to
} = require('await-to-js');
const util = require('util');
const fp = require('lodash/fp');

const logger = require('../logger');
const liquorLicenseMaster = require('../models/liquorLicenseMaster.model');

const get = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  let licenseMaster, err, liquorCountyList = [];
  [err, licenseMaster] = await to(liquorLicenseMaster.findOne().lean());
  Object.keys(licenseMaster.county).forEach(key => {
    liquorCountyList.push({
      id: key,
      name: licenseMaster.county[key]
    });
  });
  liquorCountyList = fp.sortBy('name')(liquorCountyList);
  res.status(200).json(liquorCountyList);
};

module.exports.get = get;