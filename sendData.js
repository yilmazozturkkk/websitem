const fetch = require('node-fetch');
const { parse } = require('node-html-parser');

// Esenboğa Giden Uçuşlar Sayfası
const url = "https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar";

// Power Automate Webhook URL'in (sen buraya kendi URL’ni koyacaksın)
const webhookUrl = "https://prod-168.westeurope.logic.azure.com:443/workflows/84d44977a58842489a1bb6ce087b09e8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kJVn8j0cQxlwyw6J1OqMhSjWON5BrRkgT8OlLSHv5sk"; // 👈 kendi URL'inle değiştir

async function getUcusBilgileri() {
  try {
    const res = await fetch(url);
    const html = await res.text();
    const root = parse(html);

    const rows = root.querySelectorAll("table tbody tr");
    const veriler = [];

    rows.forEach(row => {
      const cols = row.querySelectorAll("td");
      if (cols.length > 0) {
        veriler.push({
          saat: cols[0].text.trim(),
          havayolu: cols[1].text.trim(),
          ucusNo: cols[2].text.trim(),
          hedef: cols[3].text.trim(),
          durum: cols[4].text.trim(),
        });
      }
    });

    console.log("Veriler:", veriler);

    // Power Automate'e gönder
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ucuslar: veriler }),
    });

    console.log("Power Automate yanıtı:", response.status);
  } catch (err) {
    console.error("Hata:", err);
  }
}

getUcusBilgileri();
