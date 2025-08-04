const puppeteer = require("puppeteer");
const fetch = require("node-fetch");

const webhookUrl = "https://prod-252.westeurope.logic.azure.com:443/workflows/..."; // senin Power Automate URL'in

(async () => {
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  // 🚀 1. GELEN UÇUŞLAR
  await page.goto("https://esenbogaairport.com/tr-TR/ucus-bilgileri/gelecek-ucuslar", { waitUntil: "networkidle2" });

  const gelenUcuslar = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tr");
    const ucuslar = [];

    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      if (cells.length === 6) {
        ucuslar.push({
          saat: cells[0].textContent.trim(),
          havayolu: cells[1].textContent.trim(),
          ucusNo: cells[2].textContent.trim(),
          nereden: cells[3].textContent.trim(),
          durum: cells[4].textContent.trim(),
          terminal: cells[5].textContent.trim(),
          tur: "Gelen"
        });
      }
    }
    return ucuslar;
  });

  // 🚀 2. GİDEN UÇUŞLAR
  await page.goto("https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar", { waitUntil: "networkidle2" });

  const gidenUcuslar = await page.evaluate(() => {
    const rows = document.querySelectorAll("table tr");
    const ucuslar = [];

    for (const row of rows) {
      const cells = row.querySelectorAll("td");
      if (cells.length === 6) {
        ucuslar.push({
          saat: cells[0].textContent.trim(),
          havayolu: cells[1].textContent.trim(),
          ucusNo: cells[2].textContent.trim(),
          nereye: cells[3].textContent.trim(),
          durum: cells[4].textContent.trim(),
          terminal: cells[5].textContent.trim(),
          tur: "Giden"
        });
      }
    }
    return ucuslar;
  });

  // ✉️ Power Automate'e gönder
  const tumUcuslar = gelenUcuslar.concat(gidenUcuslar);

  console.log("Toplam uçuş verisi:", tumUcuslar.length);

  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ data: tumUcuslar }),
  });

  console.log("Webhook yanıtı: ", await response.text());

  await browser.close();
})();
