const express = require("express");
const puppeteer = require("puppeteer-core");

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    const browser = await puppeteer.launch({
      executablePath: "/usr/bin/google-chrome",
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage();
    await page.goto("https://www.cme.sr", { waitUntil: "networkidle2" });

    const result = await page.evaluate(() => {
      const usdText = [...document.querySelectorAll("td")]
        .find(el => el.innerText.includes("USD"))
        ?.nextElementSibling?.innerText;

      const euroText = [...document.querySelectorAll("td")]
        .find(el => el.innerText.includes("EUR"))
        ?.nextElementSibling?.innerText;

      return {
        USD: usdText ? parseFloat(usdText.replace(",", ".")) : null,
        EURO: euroText ? parseFloat(euroText.replace(",", ".")) : null,
        timestamp: new Date().toISOString()
      };
    });

    await browser.close();
    res.json(result);
  } catch (error) {
    console.error("Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log("✅ CME Koers API Lite is running");
});