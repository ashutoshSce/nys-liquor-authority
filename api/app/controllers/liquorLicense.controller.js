const {
  to
} = require('await-to-js');
const fs = require('fs');
const util = require('util');
const hdate = require('human-date');
const Json2csvParser = require('json2csv').Parser;

const logger = require('../logger');
const config = require('../../config');
const liquorLicense = require('../models/liquorLicense.model');
const liquorLicenseMaster = require('../models/liquorLicenseMaster.model');

const get = async (req, res) => {
  if (req.query.exportExcel !== undefined && req.query.exportExcel == 1) {
    res.status(200).json(req.url);
    return;
  }

  let sort = {},
    where = {},
    csvHeaderFields = [],
    filterMap = {},
    intervalMap = {},
    skip = 0,
    limit = 0,
    select = {
      "_id": 0,
      "link": 1,
    },
    liquorLicenseList, licenseMaster, err, count, filtered;
  [err, licenseMaster] = await to(liquorLicenseMaster.findOne().lean());


  const keysList = Object.keys(liquorLicense.schema.paths);

  // calculations of skip and limit
  if (req.query.meta !== undefined) {
    const meta = JSON.parse(req.query.meta);
    skip = parseInt(meta.start);
    limit = parseInt(meta.length);
    if (Number.isNaN(skip) || skip < 0) {
      skip = 0;
    }
    if (Number.isNaN(limit) || limit === 0 || limit > config.pagination.max_size) {
      limit = config.pagination.size
    }
  } else {
    skip = 0;
    limit = config.pagination.size;
  }

  if (req.query.filters !== undefined) {
    filterMap = JSON.parse(req.query.filters);
  }

  if (req.query.intervals !== undefined) {
    intervalMap = JSON.parse(req.query.intervals);
  }

  // calculations of sorting, filter and intervals condition
  req.query.columns.forEach((column) => {
    const detail = JSON.parse(column);
    if (keysList.includes(detail.name)) {
      csvHeaderFields.push(detail.name);
      select[detail.name] = 1;

      if (detail.meta.sort !== null) {
        sort[detail.name] = detail.meta.sort === 'ASC' ? 1 : -1;
      }

      if (filterMap[detail.name] !== undefined && detail.meta.array && filterMap[detail.name].length > 0) {
        where[detail.name] = {
          $in: filterMap[detail.name]
        };
      }

      let isInterval = false;
      if (intervalMap[detail.name] !== undefined && intervalMap[detail.name].dbDateFormat !== undefined) {
        where[detail.name] = {
          $gte: '',
          $lte: ''
        };

        if (intervalMap[detail.name].min !== undefined && intervalMap[detail.name].min !== null) {
          let value = intervalMap[detail.name].min;
          if (detail.meta.date) {
            value = new Date(intervalMap[detail.name].min.split('-').reverse().join('-'))
          }
          where[detail.name].$gte = value;
          isInterval = true;
        } else {
          delete where[detail.name].$gte;
        }

        if (intervalMap[detail.name].max !== undefined && intervalMap[detail.name].max !== null) {
          let value = intervalMap[detail.name].max;
          if (detail.meta.date) {
            value = new Date(intervalMap[detail.name].max.split('-').reverse().join('-'))
          }
          where[detail.name].$lte = value;
          isInterval = true;
        } else {
          delete where[detail.name].$lte;
        }

        if (!isInterval) {
          delete where[detail.name];
        }
      }
    }
  });

  if (req.query.exportExcel === undefined) {
    [err, count] = await to(liquorLicense.countDocuments());
    [err, filtered] = await to(liquorLicense.countDocuments(where));
  } else {
    skip = 0;
    limit = 0;
  }
  [err, liquorLicenseList] = await to(liquorLicense.find(where).select(select).sort(sort).skip(skip).limit(limit).lean());
  for (let index = 0; index < liquorLicenseList.length; index++) {
    liquorLicenseList[index]['dtRowId'] = liquorLicenseList[index].serial_number;
    liquorLicenseList[index].license_type = licenseMaster.license_type[liquorLicenseList[index].license_type];
    if (liquorLicenseList[index].filing_date !== undefined) {
      liquorLicenseList[index].filing_date = hdate.prettyPrint(liquorLicenseList[index].filing_date);
    }

    if (liquorLicenseList[index].effective_date !== undefined) {
      liquorLicenseList[index].effective_date = hdate.prettyPrint(liquorLicenseList[index].effective_date);
    }

    if (liquorLicenseList[index].expiration_date !== undefined) {
      liquorLicenseList[index].expiration_date = hdate.prettyPrint(liquorLicenseList[index].expiration_date);
    }

    if (licenseMaster.license_status[liquorLicenseList[index].license_status] !== undefined) {
      liquorLicenseList[index].license_status = licenseMaster.license_status[liquorLicenseList[index].license_status];
    }

    if (licenseMaster.county[liquorLicenseList[index].county] !== undefined) {
      liquorLicenseList[index].county = licenseMaster.county[liquorLicenseList[index].county];
    }

    if (req.query.exportExcel === undefined) {
      liquorLicenseList[index].serial_number = `<a href="${liquorLicenseList[index].link}" target="_blank">${liquorLicenseList[index].serial_number}</a>`;
    }
  }

  if (req.query.exportExcel !== undefined) {
    const json2csvParser = new Json2csvParser({
      csvHeaderFields
    });
    const csv = json2csvParser.parse(liquorLicenseList);
    let path = './logs/' + Date.now() + '.csv';
    fs.writeFile(path, csv, function (err, data) {
      if (err) {
        throw err;
      } else {
        res.download(path);
      }
    });
  } else {
    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({
      data: liquorLicenseList,
      filtered,
      count,
      filters: count !== filtered,
      fullRecordInfo: true
    });
  }
};

module.exports.get = get;