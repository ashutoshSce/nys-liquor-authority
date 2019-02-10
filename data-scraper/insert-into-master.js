require('dotenv').config({
    path: __dirname + '/.env'
});
const MongoModule = require('./mongo');

const items = {
    masterId: 1,
    keys: {
        'Address:': 'address',
        'County:': 'county',
        'Credit Group:': 'credit_group',
        'Effective Date:': 'effective_date',
        'Expiration Date:': 'expiration_date',
        'Filing Date:': 'filing_date',
        'License Status:': 'license_status',
        'License Type:': 'license_type',
        'Premises Name:': 'premises_name',
        'Principal\'s Name:': 'principal_name',
        'Serial Number:': 'serial_number',
        'Trade Name:': 'trade_name',
        'Zone:': 'zone'
    },
    license_type: {
        "00": "NOT SELECTED",
        "A": "GROCERY STORE BEER",
        "AL": "AIRLINE COMPANY",
        "AX": "GROCERY BEER, WINE PROD",
        "BB": "BED AND BREAKFAST - 3 BEDROOMS",
        "BC": "WHOLESALE CIDER",
        "BL": "BOTTLE CLUB",
        "BP": "BALL PARK BEER",
        "BR": "BREWER RETAIL",
        "BT": "BREWER TASTING PERMIT - ANNUAL",
        "BW": "BED AND BREAKFAST - WINE",
        "C": "WHOLESALE BEER(C)",
        "CB": "CLUB BEER",
        "CD": "CIDER PRODUCER/WHOLESALER",
        "CD-": "CIDER PRODUCER RETAIL",
        "CF": "FARM CIDERY",
        "CL": "CLUB LIQUOR",
        "CM": "COMBINED CRAFT MANUFACTURER",
        "CO": "WHOLESALE BEER(CO)",
        "CR": "CABARET LIQUOR",
        "CT": "CATERING ESTABLISHMENT",
        "CW": "CLUB WINE",
        "CX": "CUSTOM BEERMAKERS CENTER",
        "CZ": "CUSTOM WINEMAKERS CENTER",
        "D": "BREWER",
        "DA": "DISTILLER \"A\"",
        "DB": "DISTILLER \"B\"",
        "DC": "DISTILLER \"C\"",
        "DD": "FARM DISTILLER \"D\"",
        "DS": "DRUG STORE BEER",
        "DW": "WINERY",
        "DX": "DRUG BEER, WINE PROD",
        "E": "VENDOR",
        "EB": "EATING PLACE BEER",
        "EL": "O.P. ENTERTAINMENT",
        "FD": "FARM BREWER",
        "FP": "TEMPORARY WINERY/FARM WINERY",
        "FV": "FISHING VESSEL",
        "FW": "FARM WINERY",
        "GC": "GOLF CLUB",
        "HB": "HOTEL BEER",
        "HL": "HOTEL LIQUOR",
        "HW": "HOTEL WINE",
        "IL": "IMPORTER",
        "L": "LIQUOR STORE",
        "LL": "WHOLESALE LIQUOR",
        "MI": "MICRO BREWER",
        "MR": "RESTAURANT BREWER",
        "MU": "MIXED USE LIQUOR",
        "MW": "MICRO WINERY",
        "MX": "PLENARY STORAGE",
        "NC": "NIGHT CLUB / CABARET LIQUOR",
        "OP": "ON-PREMISES LIQUOR",
        "RL": "RESTAURANT LIQUOR",
        "RR": "RAILROAD CAR",
        "RS": "ROADSIDE FARM MARKET",
        "RW": "RESTAURANT WINE",
        "SB": "SUMMER EATING PLACE BEER",
        "SC": "SUMMER CLUB WINE",
        "SH": "SUMMER HOTEL WINE",
        "SL": "SUMMER O.P. FOOD &amp; BEV",
        "SL-": "SUMMER CLUB LIQUOR",
        "SL1": "SUMMER VESSEL LIQUOR",
        "SL2":"SUMMER (0. P.) ENTERTAINMENT",
        "ST": "TEMPORARY PERMIT",
        "SW": "SUMMER RESTAURANT WINE",
        "TL": "O.P. FOOD AND BEV",
        "TS": "SUMMER TAVERN WINE",
        "TW": "TAVERN WINE",
        "VB": "VESSEL BEER",
        "VL": "VESSEL LIQUOR",
        "W": "WINE STORE",
        "WA": "WINERY / FARM WINERY RETAIL",
        "WC": "WINE CATERING",
        "WO": "WINERY RETAIL ON-PREMISES",
        "WS": "DIRECT WINE SHIPMENT",
        "WT": "WINE TASTING FUNCTION(WT)",
        "WW": "WHOLESALE WINE",
        "ZB": "WINTER EATING PLACE BEER",
        "ZL": "WINTER (O.P.) FOOD &amp; BEV",
        "ZL-":"WINTER CLUB LIQUOR",
        "ZT": "WINTER TAVERN WINE",
        "ZW": "WINTER RESTAURANT WINE"
    },
    license_status: {
        active: 'License is Active',
        inactive: 'License is Inactive',
        expired: 'Expired',
        pending: 'Pending',
        operating_under_spa: 'OPERATING UNDER SAPA'
    },
    county: {
        ALBA: 'ALBANY',
        ALLE: 'ALLEGANY',
        BRON: 'BRONX',
        BROO: 'BROOME',
        CATT: 'CATTARAUGUS',
        CAYU: 'CAYUGA',
        CHAU: 'CHAUTAUQUA',
        CHEM: 'CHEMUNG',
        CHEN: 'CHENANGO',
        CLIN: 'CLINTON',
        COLU: 'COLUMBIA',
        CORT: 'CORTLAND',
        DELA: 'DELAWARE',
        DUTC: 'DUTCHESS',
        ERIE: 'ERIE',
        ESSE: 'ESSEX',
        FRAN: 'FRANKLIN',
        FULT: 'FULTON',
        GENE: 'GENESEE',
        GREE: 'GREENE',
        HAMI: 'HAMILTON',
        HERK: 'HERKIMER',
        JEFF: 'JEFFERSON',
        KING: 'KINGS',
        LEWI: 'LEWIS',
        LIVI: 'LIVINGSTON',
        MADI: 'MADISON',
        MONR: 'MONROE',
        MONT: 'MONTGOMERY',
        NASS: 'NASSAU',
        NEW: 'NEW YORK',
        NIAG: 'NIAGARA',
        ONEI: 'ONEIDA',
        ONON: 'ONONDAGA',
        ONTA: 'ONTARIO',
        ORAN: 'ORANGE',
        ORLE: 'ORLEANS',
        OSWE: 'OSWEGO',
        OTSE: 'OTSEGO',
        PUTN: 'PUTNAM',
        QUEE: 'QUEENS',
        RENS: 'RENSSELAER',
        RICH: 'RICHMOND',
        ROCK: 'ROCKLAND',
        SARA: 'SARATOGA',
        SCHE: 'SCHENECTADY',
        SCHO: 'SCHOHARIE',
        SCHU: 'SCHUYLER',
        SENE: 'SENECA',
        'ST L': 'ST LAWRENCE',
        STEU: 'STEUBEN',
        SUFF: 'SUFFOLK',
        SULL: 'SULLIVAN',
        TIOG: 'TIOGA',
        TOMP: 'TOMPKINS',
        ULST: 'ULSTER',
        WARR: 'WARREN',
        WASH: 'WASHINGTON',
        WAYN: 'WAYNE',
        WEST: 'WESTCHESTER',
        WYOM: 'WYOMING',
        YATE: 'YATES',
    },
    updatedAt: new Date()
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
    items.county = sortByKeys(items.county);

    await mongo.writeObject('licenseMaster', items);
    await mongo.disconnectToDb();
})();