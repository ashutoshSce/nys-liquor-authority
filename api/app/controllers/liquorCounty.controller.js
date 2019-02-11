const { to } = require('await-to-js');
const fp = require('lodash/fp');

const liquorLicenseMaster = require('../models/liquorLicenseMaster.model');

const get = async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  let licenseMaster = {};
  let err = {};
  let liquorCountyList = [];
  [err, licenseMaster] = await to(liquorLicenseMaster.findOne().lean());
  if (!err) {
    Object.keys(licenseMaster.county).forEach(key => {
      liquorCountyList.push({
        id: key,
        name: licenseMaster.county[key]
      });
    });
    liquorCountyList = fp.sortBy('name')(liquorCountyList);
  }
  res.status(200).json(liquorCountyList);
};

module.exports.get = get;
