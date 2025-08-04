import fetch from "node-fetch";
import * as cheerio from "cheerio";

const url = "https://esenbogaairport.com/tr-TR/ucus-bilgileri/giden-ucuslar";
const powerAutomateWebhook = "https://prod-168.westeurope.logic.azure.com:443/workflows/84d44977a58842489a1bb6ce087b09e8/triggers/manual/paths/invoke?api-version=2016-06-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=kJVn8j0cQxlwyw6J1OqMhSjWON5BrRkgT8OlLSHv5sk";

(async () => {
  const html = await fetch(url).then(res => res.text());
  const $ = cheerio.load(html);

  const ucuslar = [];

  $(".ucus-row").each((i, el) => {
    const saat = $(el).find(".ucus-saat").text().trim();
    const havayolu = $(el).find(".ucus-logo img").attr("alt")?.trim() || "";
    const logo = $(el).find(".ucus-logo img").attr("src") || "";
    const nereden = $(el).find(".ucus-nereden").text().trim();
    const ucusNo = $(el).find(".ucus-kod").text().trim();
    const durum = $(el).find(".ucus-durum").text().trim();

    ucuslar.push({
      saat,
      havayolu,
      logo: `https://esenbogaairport.com${logo}`,
      nereden,
      ucusNo,
      durum
    });
  });

  // Power Automate'e POST olarak gönder
  await fetch(powerAutomateWebhook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ucuslar })
  });

  console.log("Veriler başarıyla gönderildi.");
})();
