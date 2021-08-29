# nys-liquor-authority/data-scraper

## Getting Started

### Installation

To run data-scraper copy .env.example to .env file.
update required environment variable in it.

```bash
npm install
# or "yarn"
```

Note: It will install Puppeteer along with other dependencies, it downloads a recent version of Chromium (~170MB Mac, ~282MB Linux, ~280MB Win) that is guaranteed to work with the API. 

Get List of County in terminal, by running
```bash
node list-country.js
```

Get this list into terminal and paste into insert-into-master.js file for items.county key

Add master records to mongo collection, by running
```bash
node insert-into-master.js
```

Now either set up cron to run license-county.js file once in a day.

```bash
crontab -e
0 1 * * * path/to/node path/to/license-county.js 0 
```

OR directly run code in terminal

```bash
node license-county.js 0
```

kindly refer original website [New York State Liquor Authority](https://www.tran.sla.ny.gov/JSP/query/PublicQueryAdvanceSearchPage.jsp) Choose a county dropdown section.