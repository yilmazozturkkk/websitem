// sendData.js
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';

// Ayarları buraya yaz
const SOURCE_URL = 'https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar';
const POWER_AUTOMATE_WEBHOOK_URL = 'https://prod-xx.westeurope.logic.azure.com:443/workflows/...'; // senin URL'in

async function main() {
  try {
    // 1. HTML sayfasını çek
    const response = await fetch(SOURCE_URL);
    const html = await response.text();

    // 2. HTML içinden tabloyu ayrıştır
    const root = parse(html);
    const table = root.querySelector('#flightListTable');
    if (!table) throw new Error('Tablo bulunamadı');

    const rows = table.querySelectorAll('tbody tr');
    const data = [];

    for (let row of rows) {
      const cells = row.querySelectorAll('td').map(cell => cell.text.trim());
      if (cells.length >= 6) {
        data.push({
          saat: cells[0],
          havayolu: cells[1],
          ucusNo: cells[2],
          nereden: cells[3],
          durum: cells[4],
          kapi: cells[5],
        });
      }
    }

    console.log(`Toplam ${data.length} uçuş bulundu.`);

    // 3. Power Automate’e gönder
    const postRes = await fetch(POWER_AUTOMATE_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ flights: data }),
    });

    if (!postRes.ok) {
      throw new Error(`Power Automate hatası: ${postRes.statusText}`);
    }

    console.log('Veri başarıyla gönderildi.');
  } catch (error) {
    console.error('Hata:', error.message);
  }
}

main();
