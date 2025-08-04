import fetch from "node-fetch";
import cheerio from "cheerio";

const URL = "https://esenbogaairport.com/tr-TR/ucus-bilgileri/gelen-ucuslar";

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
    await fetch("https://prod-168.westeurope.logic.azure.com:443/workflows/84d44977a58842489a1bb6ce087b09e8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kJVn8j0cQxlwyw6J1OqMhSjWON5BrRkgT8OlLSHv5sk", {
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
