const puppeteer = require('puppeteer');
const fetch = require('node-fetch');

async function getUcusBilgileri() {
  const browser = await puppeteer.launch({
    headless: "new",
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.goto('https://esenbogaairport.com/tr-TR/ucus-bilgileri/gelen-ucuslar', {
    waitUntil: 'networkidle0',
    timeout: 0
  });

  // Tablo yüklensin
  await page.waitForSelector('#flightListTable tbody tr');

  // Verileri çek
  const flightsGelen = await page.evaluate(() => {
  const rows = Array.from(document.querySelectorAll('#flightListTable tbody tr'));
  return rows.map(row => {
    const cols = row.querySelectorAll('td');
    if (cols.length < 9) return null;

    let havaYoluLogo = '';
      const img = cols[3].querySelector('img');
      if (img && img.src) {
        havaYoluLogo = img.src.startsWith('http') ? img.src : 'https://esenbogaairport.com' + img.getAttribute('src');
      }

    return {
      tarih: cols[0]?.textContent.trim() || '',
      planliSaat: cols[1]?.textContent.trim() || '',
      tahminiSaat: cols[2]?.textContent.trim() || '',
      havaYoluLogo,
      gidecegiYer: cols[4]?.textContent.trim() || '',
      ucusNumarasi: cols[5]?.textContent.trim() || '',
      checkIn: cols[6]?.textContent.trim() || '',
      aciklama: cols[7]?.textContent.trim() || '',
      ekle: cols[8]?.textContent.trim() || ''
    };
  }).filter(item => item !== null);
  });



  await browser.close();
  return flightsGelen;
}

// ✅ Webhook'a gönderme kısmı
async function sendToWebhook(data) {
  const response = await fetch('https://prod-168.westeurope.logic.azure.com:443/workflows/84d44977a58842489a1bb6ce087b09e8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kJVn8j0cQxlwyw6J1OqMhSjWON5BrRkgT8OlLSHv5sk', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ flightsGelen: data })
  });

  const result = await response.text();
  console.log('Webhook yanıtı:', result);
}

getUcusBilgileri()
  .then(data => {
    if (data.length === 0) {
      throw new Error("Hiç uçuş bilgisi çekilemedi.");
    }
    console.log(`Toplam uçuş verisi: ${data.length}`);
    return sendToWebhook(data);
  })
  .catch(err => {
    console.error('Hata:', err.message);
  });
