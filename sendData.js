const axios = require("axios");
const cheerio = require("cheerio");

async function getFlightData() {
  try {
    const url = "https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar";
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);

    const flightData = [];

    $("#flightListTable tbody tr").each((index, element) => {
      const tds = $(element).find("td");

      const tarih = $(tds[0]).text().trim();
      const planli = $(tds[1]).text().trim();
      const tahmini = $(tds[2]).text().trim();
      const havayolu = $(tds[3]).text().trim();
      const gidilecekYer = $(tds[4]).text().trim();
      const ucusNo = $(tds[5]).text().trim();
      const checkin = $(tds[6]).text().trim();
      const aciklama = $(tds[7]).text().trim();

      // Logo (img src'si varsa çek)
      const logo = $(tds[3]).find("img").attr("src");
      const logoURL = logo ? `https://esenbogaairport.com${logo}` : null;

      flightData.push({
        tarih,
        planli,
        tahmini,
        havayolu,
        gidilecekYer,
        ucusNo,
        checkin,
        aciklama,
        logo: logoURL
      });
    });

    console.log("✅ Çekilen Uçuş Verileri:");
    console.log(flightData);

    return flightData;
  } catch (error) {
    console.error("❌ Veri çekme hatası:", error.message);
    return [];
  }
}

async function sendToPowerAutomate(data) {
  try {
    const automateUrl = "https://prod-168.westeurope.logic.azure.com:443/workflows/84d44977a58842489a1bb6ce087b09e8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kJVn8j0cQxlwyw6J1OqMhSjWON5BrRkgT8OlLSHv5sk";

    const response = await axios.post(automateUrl, data, {
      headers: {
        "Content-Type": "application/json"
      }
    });

    console.log("✅ Power Automate'e başarıyla gönderildi:", response.status);
  } catch (error) {
    console.error("❌ Power Automate gönderme hatası:", error.message);
  }
}

(async () => {
  const flights = await getFlightData();
  if (flights.length > 0) {
    await sendToPowerAutomate(flights);
  } else {
    console.log("⚠️ Veri bulunamadı veya çekilemedi.");
  }
})();
