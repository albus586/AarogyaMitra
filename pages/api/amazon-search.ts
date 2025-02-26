import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import * as cheerio from "cheerio";

interface ProductInfo {
  title: string;
  price: string;
  rating: string;
  availability: string;
  imageUrl: string;
  link: string;
  brand: string;
}

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
  "Accept-Language": "en-US, en;q=0.5",
};

async function getProductDetails(url: string): Promise<ProductInfo | null> {
  try {
    const response = await axios.get(url, { headers: HEADERS });
    const $ = cheerio.load(response.data);

    const title = $("#productTitle").text().trim();
    const price = $(".a-price-whole").first().text().trim();
    const rating = $(".a-icon-alt").first().text().trim();
    const availability = $("#availability span").first().text().trim();
    const imageUrl = $("#imgTagWrapperId img").attr("src") || "";
    const brand = $(".a-size-base-plus.a-color-base").first().text().trim();

    if (!title) return null;

    return {
      title,
      price,
      rating,
      availability,
      imageUrl,
      link: url,
      brand,
    };
  } catch (error) {
    console.error("Error fetching product details:", error);
    return null;
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { query } = req.query;
  if (!query) {
    return res.status(400).json({ message: "Query parameter is required" });
  }

  try {
    const searchUrl = `https://www.amazon.in/s?k=${encodeURIComponent(
      query as string
    )}`;
    const response = await axios.get(searchUrl, { headers: HEADERS });
    const $ = cheerio.load(response.data);

    const productLinks = $(".a-link-normal.s-no-outline")
      .map((_, el) => $(el).attr("href"))
      .get()
      .filter((link) => link && link.includes("/dp/"))
      .slice(0, 3);

    const products = await Promise.all(
      productLinks.map(async (link) => {
        const fullUrl = `https://www.amazon.in${link}`;
        return await getProductDetails(fullUrl);
      })
    );

    const validProducts = products.filter((p): p is ProductInfo => p !== null);

    res.status(200).json(validProducts);
  } catch (error) {
    console.error("Error searching products:", error);
    res.status(500).json({ message: "Error fetching products" });
  }
}
