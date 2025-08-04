const axios = require("axios");
const cheerio = require("cheerio");

// 🔁 Ortak fonksiyon
async function ucuslariGetir(url) {
  const response = await axios.get(url);
  const $ = cheerio.load(response.data);

  const tablo = $("table.flight-table tbody");
  if (tablo.length === 0) throw new Error("Uçuş tablosu bulunamadı");

  const veriler = [];
  tablo.find("tr").each((i, row) => {
    const kolonlar = $(row).find("td");
    if (kolonlar.length === 0) return;

    veriler.push({
      tarih: $(kolonlar[0]).text().trim(),
      planliSaat: $(kolonlar[1]).text().trim(),
      tahminiSaat: $(kolonlar[2]).text().trim(),
      havaYolu: $(kolonlar[3]).text().trim(),
      gidecegiYer: $(kolonlar[4]).text().trim(),
      ucusNumarasi: $(kolonlar[5]).text().trim(),
      checkIn: $(kolonlar[6]).text().trim(),
      aciklama: $(kolonlar[7]).text().trim(),
      ekle: $(kolonlar[8]).text().trim(),
    });
  });

  return veriler;
}

// 🔗 Esenboğa URL’leri
const gelenURL = "https://esenbogaairport.com/tr-TR/ucus-bilgileri/gelen-ucuslar";
const gidenURL = "https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar";

// 🚀 Ana fonksiyon
(async () => {
  try {
    const gidenUcuslar = await ucuslariGetir(gidenURL);
    const gelenUcuslar = await ucuslariGetir(gelenURL);

    const payload = {
      flights_departure: gidenUcuslar,
      flights_arrival: gelenUcuslar,
    };

    // 📤 Power Automate URL'ine gönder
    const response = await axios.post("https://prod-168.westeurope.logic.azure.com:443/workflows/84d44977a58842489a1bb6ce087b09e8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kJVn8j0cQxlwyw6J1OqMhSjWON5BrRkgT8OlLSHv5sk", payload);
    console.log("Power Automate’e gönderildi:", response.status);
  } catch (error) {
    console.error("Hata:", error.message);
  }
})();
