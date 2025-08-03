const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
    headless: true,
  });
  const page = await browser.newPage();

  await page.goto('https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar', { waitUntil: 'networkidle2' });

  console.log('Sayfa açıldı, tarama başarılı.');

  await browser.close();
})();
