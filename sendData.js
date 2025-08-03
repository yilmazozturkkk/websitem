const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox']
  });
  const page = await browser.newPage();
  await page.goto('https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar', {
    waitUntil: 'networkidle0',
    timeout: 0
  });

  // Tablonun DOM'a yüklenmesini bekle
  await page.waitForSelector('#flightListTable tbody tr');

  const ucuslar = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#flightListTable tbody tr'));
    return rows.map(row => {
      const cols = row.querySelectorAll('td');
      return {
        saat: cols[0]?.innerText.trim(),
        firma: cols[1]?.innerText.trim(),
        ucusNo: cols[2]?.innerText.trim(),
        nereden: cols[3]?.innerText.trim(),
        durum: cols[4]?.innerText.trim()
      };
    });
  });

  console.log('✅ Çekilen Uçuş Verileri:');
  console.log(ucuslar);

  await browser.close();
})();
