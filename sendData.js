import fetch from "node-fetch";
import cheerio from "cheerio";

const URL = "https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar";

async function scrapeFlights() {
  try {
    const response = await fetch(URL);
    const html = await response.text();
    const $ = cheerio.load(html);

    const flights = [];

    $(".table tbody tr").each((i, row) => {
      const tds = $(row).find("td");
      const saat = $(tds[0]).text().trim();
      const havayolu = $(tds[1]).text().trim();
      const ucusKodu = $(tds[2]).text().trim();
      const destinasyon = $(tds[3]).text().trim();
      const durum = $(tds[4]).text().trim();

      flights.push({
        saat,
        havayolu,
        ucusKodu,
        destinasyon,
        durum,
      });
    });

    console.log("Toplam uçuş:", flights.length);
    console.log(flights);

    // POST isteği ile gönder (örnek bir webhook URL)
    await fetch("https://prod-00.westeurope.logic.azure.com/...senin-webhook-url...", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(flights),
    });

  } catch (err) {
    console.error("Hata:", err);
    process.exit(1);
  }
}

scrapeFlights();
