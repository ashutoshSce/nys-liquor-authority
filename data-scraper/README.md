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

Add master records to mongo collection, by running
```bash
node insert-into-master.js
```

Now either set up cron to run download-latest-list.js file once in a day.

```bash
crontab -e
0 1 * * * path/to/node path/to/download-latest-list.js NEW 1 
```

OR directly run code in terminal

```bash
node download-latest-list.js NEW 1 
```

Note: Here ```NEW``` will tell scraper to download only New York data, you may add different region code.
kindly refer original website [New York State Liquor Authority](https://www.tran.sla.ny.gov/JSP/query/PublicQueryAdvanceSearchPage.jsp) Choose a country dropdown section.