// We'll use Puppeteer is our browser automation framework.
const puppeteer = require('puppeteer');

// This is where we'll put the code to get around the tests.
const preparePageForTests = async page => {
  // Pass the User-Agent Test.
  const userAgent =
    'Mozilla/5.0 (X11; Ubuntu; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/60.0.3112.101 Safari/537.36';
  await page.setUserAgent(userAgent);

  // Pass the Webdriver Test.
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false
    });
  });

  // Pass the Chrome Test.
  await page.evaluateOnNewDocument(() => {
    // We can mock this in as much depth as we need for the test.
    window.navigator.chrome = {
      runtime: {}
      // etc.
    };
  });

  // Pass the Permissions Test.
  await page.evaluateOnNewDocument(() => {
    const originalQuery = window.navigator.permissions.query;
    return (window.navigator.permissions.query = parameters =>
      parameters.name === 'notifications'
        ? Promise.resolve({ state: Notification.permission })
        : originalQuery(parameters));
  });

  // Pass the Plugins Length Test.
  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, 'plugins', {
      // This just needs to have `length > 0` for the current test,
      // but we could mock the plugins too if necessary.
      get: () => [1, 2, 3, 4, 5]
    });
  });

  // Pass the Languages Test.
  await page.evaluateOnNewDocument(() => {
    // Overwrite the `plugins` property to use a custom getter.
    Object.defineProperty(navigator, 'languages', {
      get: () => ['en-US', 'en']
    });
  });
};

function validURL(str) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i'
  ); // fragment locator
  return !!pattern.test(str);
}

const get = async (req, res) => {
  const url = req.query.url;
  if (!validURL(url)) {
    res.status(400).json({ error: 'url is not valid' });
  } else {
    const domain = url
      .replace('http://', '')
      .replace('https://', '')
      .replace('www.', '')
      .split(/[/?#]/)[0];

    // Launch the browser in headless mode and set up a page.
    const browser = await puppeteer.launch({
      args: ['--no-sandbox'],
      headless: true
    });
    const page = await browser.newPage();

    // Prepare for the tests (not yet implemented).
    await preparePageForTests(page);

    // Navigate to the page that will perform the tests.
    await page.goto(url);

    // Save a screenshot of the results.
    await page.screenshot({ path: `../view/dist/${domain}.png` });

    await browser.close();

    res.status(200).json({ path: `http://nys-liquor.ashutoshjha.me/${domain}.png` });
  }
};

module.exports.get = get;

