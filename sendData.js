const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar', {
    waitUntil: 'networkidle0',
    timeout: 0
  });

  // Tablo yüklensin diye bekle
  await page.waitForSelector('#flightListTable tbody tr');

  // Veriyi çek
  const flights = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('#flightListTable tbody tr'));
    return rows.map(row => {
      const cols = row.querySelectorAll('td');
      return {
        tarih: cols[0]?.textContent.trim() || '',
        planliSaat: cols[1]?.textContent.trim() || '',
        tahminiSaat: cols[2]?.textContent.trim() || '',
        havaYolu: cols[3]?.textContent.trim() || '',
        gidecegiYer: cols[4]?.textContent.trim() || '',
        ucusNumarasi: cols[5]?.textContent.trim() || '',
        checkIn: cols[6]?.textContent.trim() || '',
        aciklama: cols[7]?.textContent.trim() || '',
        ekle: cols[8]?.textContent.trim() || ''
      };
    });
  });

  console.log('✅ Çekilen Uçuş Verileri:');
  console.log(JSON.stringify(flights, null, 2));

  await browser.close();
})();
