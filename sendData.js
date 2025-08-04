import axios from "axios";
import cheerio from "cheerio";

const targetUrl = "https://esenbogaairport.com/tr-TR/ucus-bilgileri/gelen-ucuslar";
const powerAutomateWebhook =
  "https://prod-168.westeurope.logic.azure.com:443/workflows/84d44977a58842489a1bb6ce087b09e8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kJVn8j0cQxlwyw6J1OqMhSjWON5BrRkgT8OlLSHv5sk";

try {
  const { data: html } = await axios.get(targetUrl);
  const $ = cheerio.load(html);

  const rows = $("#flightListTable tbody tr");

  const flights = [];

  rows.each((i, row) => {
    const tds = $(row).find("td");

    const logo = $(tds[0]).find("img").attr("src")?.trim() || "";
    const airline = $(tds[1]).text().trim();
    const destination = $(tds[2]).text().trim();
    const flightNo = $(tds[3]).text().trim();
    const time = $(tds[4]).text().trim();
    const estimated = $(tds[5]).text().trim();
    const status = $(tds[6]).text().trim();

    flights.push({
      logo: logo.startsWith("http") ? logo : `https://esenbogaairport.com${logo}`,
      airline,
      destination,
      flightNo,
      time,
      estimated,
      status
    });
  });

  console.log("Toplam uçuş verisi:", flights.length);

  // Power Automate'e gönder
  const response = await axios.post(powerAutomateWebhook, flights, {
    headers: {
      "Content-Type": "application/json"
    }
  });

  console.log("Power Automate'e gönderildi:", response.status);
} catch (err) {
  console.error("Hata oluştu:", err.message);
  process.exit(1);
}
