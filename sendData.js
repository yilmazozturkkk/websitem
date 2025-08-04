const fetch = require('node-fetch');
const { parse } = require('node-html-parser');

// Power Automate webhook URL'in buraya
const webhookUrl = 'https://prod-123.westeurope.logic.azure.com:443/workflows/xxx/triggers/manual/paths/invoke/...';

async function getUcusBilgileri() {
  const url = 'https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar';
  const response = await fetch(url);
  const html = await response.text();

  const root = parse(html);
  const table = root.querySelector('.flight-table tbody');

  if (!table) {
    throw new Error("Uçuş tablosu bulunamadı");
  }

  const rows = table.querySelectorAll('tr');
  const ucuslar = [];

  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 6) return;

    ucuslar.push({
      saat: cells[0].text.trim(),
      sefer: cells[1].text.trim(),
      havayolu: cells[2].text.trim(),
      varis: cells[3].text.trim(),
      durum: cells[4].text.trim(),
      kapi: cells[5].text.trim()
    });
  });

  return ucuslar;
}

async function main() {
  try {
    const ucusListesi = await getUcusBilgileri();

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ucusListesi })
    });

    console.log('Power Automate yanıt:', await response.text());
  } catch (error) {
    console.error('Hata:', error.message);
  }
}

main();
