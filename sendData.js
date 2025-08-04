const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();

  // Uçuş bilgilerini çeken fonksiyon
  const scrapeFlights = async (url) => {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 0 });
    await page.waitForSelector('#flightListTable tbody tr');

    return await page.evaluate(() => {
      const BASE_URL = 'https://esenbogaairport.com';
      const rows = Array.from(document.querySelectorAll('#flightListTable tbody tr'));
      return rows.map(row => {
        const cols = row.querySelectorAll('td');
        const logoImg = cols[3]?.querySelector('img');
        const logoSrc = logoImg ? BASE_URL + logoImg.getAttribute('src') : '';

        return {
          tarih: cols[0]?.textContent.trim() || '',
          planliSaat: cols[1]?.textContent.trim() || '',
          tahminiSaat: cols[2]?.textContent.trim() || '',
          havaYoluLogo: logoSrc,
          gidecegiYer: cols[4]?.textContent.trim() || '',
          ucusNumarasi: cols[5]?.textContent.trim() || '',
          checkIn: cols[6]?.textContent.trim() || '',
          aciklama: cols[7]?.textContent.trim() || '',
          ekle: cols[8]?.textContent.trim() || ''
        };
      });
    });
  };

  const gidenUrl = 'https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar';
  const gelenUrl = 'https://esenbogaairport.com/tr-TR/ucus-bilgileri/gelen-ucuslar';

  const gidenUcuslar = await scrapeFlights(gidenUrl);
  const gelenUcuslar = await scrapeFlights(gelenUrl);

  console.log('✈️ Giden Uçuşlar:');
  console.log(JSON.stringify(gidenUcuslar, null, 2));

  console.log('🛬 Gelen Uçuşlar:');
  console.log(JSON.stringify(gelenUcuslar, null, 2));

  await browser.close();
})();
