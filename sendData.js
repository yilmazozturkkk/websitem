const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();

  await page.goto('https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar', {
    waitUntil: 'networkidle2',
  });

  const flights = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('table tbody tr'));
    return rows.map(row => {
      const cells = row.querySelectorAll('td');
      return Array.from(cells).map(cell => cell.innerText.trim());
    });
  });

  await browser.close();

  console.log('Uçuş verisi:', flights);
})();
