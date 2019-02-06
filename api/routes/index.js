const express = require('express');

const router = express.Router();

const LiquorLicenseController = require('../app/controllers/liquorLicense.controller');
const LiquorLicenseTypeController = require('../app/controllers/liquorLicenseType.controller');

/* GET liquor-license page. */
router.get('/liquor-license', LiquorLicenseController.get);

/* GET liquor-type page. */
router.get('/liquor-license-type', LiquorLicenseTypeController.get);

module.exports = router;
