const mongoose = require('mongoose');

const LicensePageSchema = mongoose.Schema({
  serial_number: Number,
  county: String,
  license_type: String,
  link: String
});

module.exports = mongoose.model('LicensePage', LicensePageSchema, 'licensePage');
