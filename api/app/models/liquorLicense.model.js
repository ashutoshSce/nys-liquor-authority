const mongoose = require('mongoose');

const LiquorLicenseSchema = mongoose.Schema({
  dtRowId: Number,
  serial_number: Number,
  license_type: String,
  license_status: String,
  credit_group: Number,
  filing_date: Date,
  effective_date: Date,
  expiration_date: Date,
  principal_name: String,
  premises_name: String,
  trade_name: String,
  zone: Number,
  address: String,
  zip: String,
  country: String,
  link: String
});

module.exports = mongoose.model('LiquorLicense', LiquorLicenseSchema, 'licenseInfo');
