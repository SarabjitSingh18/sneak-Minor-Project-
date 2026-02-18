import Firecrawl from "@mendable/firecrawl-js";

const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

/**
 * Scrapes a product page and extracts structured product data.
 * Includes retry logic and extended timeout for heavy pages.
 */
export async function scrapeProduct(url, retries = 2) {
  if (!url) {
    throw new Error("Product URL is required");
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`Scraping attempt ${attempt + 1} for: ${url}`);

      const result = await firecrawl.scrape(url, {
        timeout: 60000, // 60 seconds
        formats: [
          {
            type: "json",
            schema: {
              type: "object",
              required: [
                "productName",
                "currentPrice",
                "currencyCode",
                "productImageUrl",
              ],
              properties: {
                productName: {
                  type: "string",
                },
                currentPrice: {
                  type: "number", // Changed to number (important)
                },
                currencyCode: {
                  type: "string",
                },
                productImageUrl: {
                  type: "string",
                },
              },
            },
            prompt:
              "Extract the product name as 'productName', current price as a number as 'currentPrice', currency code (USD, EUR, etc) as 'currencyCode', and product image url as 'productImageUrl' if available.",
          },
        ],
      });

      const extractedData = result?.json;

      if (
        !extractedData ||
        !extractedData.productName ||
        extractedData.currentPrice == null
      ) {
        throw new Error("Invalid product data extracted");
      }

      console.log("✅ Product scraped successfully:", extractedData.productName);

      return extractedData;

    } catch (error) {
      console.error(
        `❌ Scrape attempt ${attempt + 1} failed for ${url}`,
        error.message
      );

      if (attempt === retries) {
        throw new Error(
          `Failed to scrape product after ${retries + 1} attempts`
        );
      }

      // Small delay before retry (prevents immediate retry hammering)
      await new Promise((resolve) => setTimeout(resolve, 3000));
    }
  }
}
