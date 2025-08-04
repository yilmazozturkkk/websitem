const axios = require("axios");
const cheerio = require("cheerio");

// User-Agent header ekleyerek bot engellemelerini aşmaya yardımcı olalım
const axiosConfig = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
  },
  timeout: 10000 // 10 saniye timeout
};

// 🔁 Ortak fonksiyon (daha sağlam hata yönetimi ile)
async function ucuslariGetir(url) {
  try {
    const response = await axios.get(url, axiosConfig);
    const $ = cheerio.load(response.data);

    const tablo = $("table.flight-table tbody");
    if (tablo.length === 0) {
      throw new Error("Uçuş tablosu bulunamadı");
    }

    const veriler = [];
    tablo.find("tr").each((i, row) => {
      const kolonlar = $(row).find("td");
      if (kolonlar.length < 9) return; // Eksik kolon kontrolü

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

    if (veriler.length === 0) {
      throw new Error("Tablo bulundu ancak veri çekilemedi");
    }

    return veriler;
  } catch (error) {
    console.error(`URL: ${url} için veri çekme hatası:`, error.message);
    throw error; // Hata yukarıya fırlatılıyor
  }
}

// 🔗 Esenboğa URL'leri
const URL_LER = {
  GELEN: "https://esenbogaairport.com/tr-TR/ucus-bilgileri/gelen-ucuslar",
  GIDEN: "https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar"
};

// 🚀 Ana fonksiyon (daha detaylı loglama ile)
(async () => {
  try {
    console.log("Uçuş verileri çekilmeye başlıyor...");
    
    // Paralel veri çekme için Promise.all kullanımı
    const [gidenUcuslar, gelenUcuslar] = await Promise.all([
      ucuslariGetir(URL_LER.GIDEN),
      ucuslariGetir(URL_LER.GELEN)
    ]);

    const payload = {
      flights_departure: gidenUcuslar,
      flights_arrival: gelenUcuslar,
      timestamp: new Date().toISOString()
    };

    console.log(`Veriler hazır. Toplam ${gidenUcuslar.length} giden, ${gelenUcuslar.length} gelen uçuş.`);
    
    // 📤 Power Automate URL'ine gönder
    const response = await axios.post(
      "https://prod-168.westeurope.logic.azure.com:443/workflows/84d44977a58842489a1bb6ce087b09e8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kJVn8j0cQxlwyw6J1OqMhSjWON5BrRkgT8OlLSHv5sk", 
      payload,
      axiosConfig
    );
    
    console.log(`Power Automate'e gönderildi. Durum: ${response.status}`);
  } catch (error) {
    console.error("Kritik Hata:", {
      message: error.message,
      stack: error.stack,
      response: error.response?.status
    });
    process.exit(1); // Hata durumunda script'in fail olması için
  }
})();
