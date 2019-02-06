require('dotenv').config();
const MongoModule = require('./mongo');

const items = {
    "masterId": 1,
    "keys": {
        "Address:": "address",
        "County:": "country",
        "Credit Group:": "credit_group",
        "Effective Date:": "effective_date",
        "Expiration Date:": "expiration_date",
        "Filing Date:": "filing_date",
        "License Status:": "license_status",
        "License Type:": "license_type",
        "Premises Name:": "premises_name",
        "Principal's Name:": "principal_name",
        "Serial Number:": "serial_number",
        "Trade Name:": "trade_name",
        "Zone:": "zone"
    },
    "license_type": {
        "CIDER PRODUCER/WHOLESALER":"CD",
        "BREWER RETAIL":"BR",
        "CABARET LIQUOR": "CR",
        "CATERING ESTABLISHMENT": "CT",
        "CLUB BEER": "CB",
        "CLUB LIQUOR": "CL",
        "CLUB WINE": "CW",
        "DISTILLER \"A\"": "DA",
        "DRUG BEER, WINE PROD": "DX",
        "EATING PLACE BEER": "EB",
        "GROCERY BEER, WINE PROD": "AX",
        "GROCERY STORE BEER": "A",
        "HOTEL LIQUOR": "HL",
        "HOTEL WINE": "HW",
        "IMPORTER": "IL",
        "LIQUOR STORE": "L",
        "MICRO BREWER": "MI",
        "O P  FOOD AND BEV": "TL",
        "ON-PREMISES LIQUOR": "OP",
        "RESTAURANT BREWER": "MR",
        "RESTAURANT LIQUOR": "RL",
        "RESTAURANT WINE": "RW",
        "SUMMER EATING PLACE BEER": "SB",
        "SUMMER O P  FOOD &amp; BEV": "SL",
        "SUMMER GOLF CLUB": "SL1",
        "SUMMER VESSEL LIQUOR": "SL2",
        "SUMMER RESTAURANT WINE": "SW",
        "TAVERN WINE": "TW",
        "TEMPORARY PERMIT": "ST",
        "VESSEL LIQUOR": "VL",
        "WHOLESALE BEER(C)": "C",
        "WHOLESALE BEER(CO)": "CO",
        "WHOLESALE CIDER": "BC",
        "WHOLESALE LIQUOR": "LL",
        "WHOLESALE WINE": "WW",
        "WINE STORE": "W",
        "WINTER (O P ) FOOD &amp; BEV": "ZL",
        "WINTER EATING PLACE BEER": "ZB"
    },
    "r_license_type": {
        "A": "GROCERY STORE BEER",
        "AX": "GROCERY BEER, WINE PROD",
        "BC": "WHOLESALE CIDER",
        "BR": "BREWER RETAIL",
        "C": "WHOLESALE BEER(C)",
        "CB": "CLUB BEER",
        "CD": "CIDER PRODUCER/WHOLESALER",
        "CL": "CLUB LIQUOR",
        "CO": "WHOLESALE BEER(CO)",
        "CR": "CABARET LIQUOR",
        "CT": "CATERING ESTABLISHMENT",
        "CW": "CLUB WINE",
        "DA": "DISTILLER \"A\"",
        "DX": "DRUG BEER, WINE PROD",
        "EB": "EATING PLACE BEER",
        "HL": "HOTEL LIQUOR",
        "HW": "HOTEL WINE",
        "IL": "IMPORTER",
        "L": "LIQUOR STORE",
        "LL": "WHOLESALE LIQUOR",
        "MI": "MICRO BREWER",
        "MR": "RESTAURANT BREWER",
        "OP": "ON-PREMISES LIQUOR",
        "RL": "RESTAURANT LIQUOR",
        "RW": "RESTAURANT WINE",
        "SB": "SUMMER EATING PLACE BEER",
        "SL": "SUMMER O.P. FOOD &amp; BEV",
        "ST": "TEMPORARY PERMIT",
        "SW": "SUMMER RESTAURANT WINE",
        "TL": "O.P. FOOD AND BEV",
        "TW": "TAVERN WINE",
        "VL": "VESSEL LIQUOR",
        "W": "WINE STORE",
        "WW": "WHOLESALE WINE",
        "ZL": "WINTER (O.P.) FOOD & BEV",
        "ZB": "WINTER EATING PLACE BEER"
    },
    "license_status": {
        active: 'License is Active',
        inactive: 'License is Inactive',
        expired: 'Expired',
        pending: 'Pending',
        operating_under_spa: 'OPERATING UNDER SAPA'
    },
    "country": {
        "NEW": "NEW YORK"
    },
    "updatedAt": new Date()
};

function sortByKeys(obj) {
    let keys = Object.keys(obj),
        i, len = keys.length;

    keys.sort();

    const newObj = {};
    for (i = 0; i < len; i++) {
        k = keys[i];
        newObj[k] = obj[k];
    }
    return newObj;
}

(async () => {
    const mongo = new MongoModule();
    await mongo.connectToDb();
    await mongo.destroyObject('licenseMaster', {});

    items.keys = sortByKeys(items.keys);
    items.license_type = sortByKeys(items.license_type);
    items.r_license_type = sortByKeys(items.r_license_type);
    items.country = sortByKeys(items.country);

    await mongo.writeObject('licenseMaster', items);
    await mongo.disconnectToDb();
})();