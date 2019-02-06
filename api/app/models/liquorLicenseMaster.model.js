const mongoose = require('mongoose');

const LiquorLicenseMasterSchema = mongoose.Schema({});

module.exports = mongoose.model('LiquorLicenseMaster', LiquorLicenseMasterSchema, 'licenseMaster');
