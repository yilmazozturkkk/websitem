const puppeteer = require('puppeteer');
const axios = require('axios');

// Power Automate webhook URL'ini buraya yapıştır
const powerAutomateWebhookUrl = 'https://prod-168.westeurope.logic.azure.com:443/workflows/84d44977a58842489a1bb6ce087b09e8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kJVn8j0cQxlwyw6J1OqMhSjWON5BrRkgT8OlLSHv5sk';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();

  await page.goto('https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar', { waitUntil: 'networkidle2' });

  const flights = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    return rows.map(row => {
      const cells = row.querySelectorAll('td');
      return Array.from(cells).map(cell => cell.innerText.trim());
    });
  });

  await browser.close();

  console.log('Uçuş verisi:', flights);

  await axios.post(powerAutomateWebhookUrl, { flights });

  console.log('Veri Power Automate\'e gönderildi!');
})();
