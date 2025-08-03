const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar', { waitUntil: 'domcontentloaded' });

  const flightData = await page.evaluate(() => {
    const rows = document.querySelectorAll('.flight-table tbody tr');
    let flights = [];

    rows.forEach(row => {
      const cols = row.querySelectorAll('td');
      if (cols.length >= 6) {
        flights.push({
          time: cols[0].innerText.trim(),
          flightNumber: cols[1].innerText.trim(),
          airline: cols[2].innerText.trim(),
          destination: cols[3].innerText.trim(),
          gate: cols[4].innerText.trim(),
          status: cols[5].innerText.trim()
        });
      }
    });

    return flights;
  });

  console.log("✅ Çekilen Uçuş Verileri:");
  console.log(JSON.stringify(flightData, null, 2)); // 2 boşlukla formatlı yazdır

  await browser.close();
})();
