const express = require('express');

const router = express.Router();

const LiquorLicenseController = require('../app/controllers/liquorLicense.controller');
const LiquorLicenseTypeController = require('../app/controllers/liquorLicenseType.controller');
const LiquorCountyController = require('../app/controllers/liquorCounty.controller');
const LiquorLicenseMigrationController = require('../app/controllers/liquorLicense-migration.controller');
const LicensePageMigrationController = require('../app/controllers/licensePage-migration.controller');

/* GET liquor-license page. */
router.get('/liquor-license', LiquorLicenseController.get);

/* GET liquor-type page. */
router.get('/liquor-license-type', LiquorLicenseTypeController.get);
router.get('/liquor-county', LiquorCountyController.get);

router.get('/liquor-license-migration/export', LiquorLicenseMigrationController.exportData);
router.get('/liquor-license-migration/import', LiquorLicenseMigrationController.importData);

router.get('/liquor-license-migration/export', LiquorLicenseMigrationController.exportData);
router.get('/liquor-license-migration/import', LiquorLicenseMigrationController.importData);

router.get('/license-page-migration/export', LicensePageMigrationController.exportData);
router.get('/license-page-migration/import', LicensePageMigrationController.importData);

module.exports = router;
