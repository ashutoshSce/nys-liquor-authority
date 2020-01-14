const express = require('express');

const router = express.Router();

const LiquorLicenseController = require('../app/controllers/liquorLicense.controller');
const LiquorLicenseTypeController = require('../app/controllers/liquorLicenseType.controller');
const LiquorCountyController = require('../app/controllers/liquorCounty.controller');
const WebCrawlerController = require('../app/controllers/webCrawler.controller');

/* GET liquor-license page. */
router.get('/liquor-license', LiquorLicenseController.get);

/* GET liquor-type page. */
router.get('/liquor-license-type', LiquorLicenseTypeController.get);
router.get('/liquor-county', LiquorCountyController.get);

router.get('/crawl', WebCrawlerController.get);

module.exports = router;
