import axios from "axios";

import fs from "fs";

const cache = new Map();
let dynamicCoinMap = null;

const loadCoinMap = async () => {
  if (dynamicCoinMap) return dynamicCoinMap;
  
  const COINS_FILE = "coins.json";
  if (fs.existsSync(COINS_FILE)) {
    dynamicCoinMap = JSON.parse(fs.readFileSync(COINS_FILE, "utf-8"));
    return dynamicCoinMap;
  }
  
  console.log("Fetching full coin list from Coingecko...");
  try {
    const res = await axios.get("https://api.coingecko.com/api/v3/coins/list");
    const map = {};
    for (const coin of res.data) {
      if (coin.symbol) map[coin.symbol.toLowerCase()] = coin.id;
      if (coin.name) map[coin.name.toLowerCase()] = coin.id;
      map[coin.id.toLowerCase()] = coin.id;
    }
    fs.writeFileSync(COINS_FILE, JSON.stringify(map));
    dynamicCoinMap = map;
    return dynamicCoinMap;
  } catch (err) {
    
    console.error("Failed to load coin map", err.message);
    return {};
  }
};

export const getCryptoPrice = async (coin) => {
  try {
    const map = await loadCoinMap();
    let normalizedCoin = coin.toLowerCase().trim();
    
    if (map[normalizedCoin]) {
      normalizedCoin = map[normalizedCoin];
    } else {
      normalizedCoin = normalizedCoin.replace(/\s+/g, '-');
    }

    if (cache.has(normalizedCoin)) {
      const cachedData = cache.get(normalizedCoin);
      if (Date.now() - cachedData.timestamp < 60000) {
        return { price: cachedData.price, cached: true };
      }
    }

    const res = await axios.get(
      `https://api.coingecko.com/api/v3/simple/price?ids=${normalizedCoin}&vs_currencies=usd`
    );

    const price = res.data[normalizedCoin]?.usd;

    if (!price) {
      throw new Error(`Coin ${normalizedCoin} not found`);
    }

    cache.set(normalizedCoin, { price, timestamp: Date.now() });

    return { price };

  } catch (error) {
    return { error: "Failed to fetch price: " + error.message };
  }
};