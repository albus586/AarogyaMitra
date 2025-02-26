import axios from "axios";
import * as cheerio from "cheerio";

export interface ProductInfo {
  title: string;
  price: string;
  imageUrl: string;
  rating: string;
  link: string;
  availability: string;
  brand: string;
}

export async function searchAmazonProducts(
  query: string
): Promise<ProductInfo[]> {
  try {
    const response = await fetch(
      `/api/amazon-search?query=${encodeURIComponent(query)}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch products");
    }
    const products: ProductInfo[] = await response.json();
    return products;
  } catch (error) {
    console.error("Error searching products:", error);
    return [];
  }
}
