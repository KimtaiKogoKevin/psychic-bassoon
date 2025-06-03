// src/lib/shopify.ts
const SHOPIFY_STORE_DOMAIN = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_ACCESS_TOKEN = process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
  // This error will be caught during the build process or server-side rendering
  // if the env variables are not set, preventing runtime issues in the browser.
  console.error(
    'Shopify environment variables (NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN or NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN) are not set.'
  );
  // Depending on your error handling strategy, you might throw an error here
  // or have a fallback, but for now, logging is fine.
  // throw new Error('Shopify configuration is missing.');
}

const SHOPIFY_API_ENDPOINT = `https://${SHOPIFY_STORE_DOMAIN}/api/2024-04/graphql.json`; // Using a recent stable API version

export interface ShopifyErrorLocation {
  line: number;
  column: number;
}

export interface ShopifyError {
  message: string;
  locations?: ShopifyErrorLocation[];
  path?: string[];
  extensions?: any;
}

export interface ShopifyResponse<T> {
  data?: T; // Make data optional as errors might mean no data
  errors?: ShopifyError[];
}

export async function shopifyFetch<T>({
  query,
  variables,
  cache = 'force-cache', // Default to Next.js caching behavior
}: {
  query: string;
  variables?: Record<string, any>;
  cache?: RequestCache; // Allow overriding cache policy
}): Promise<ShopifyResponse<T>> {
  // Ensure variables are only included if they exist and are not empty
  const bodyPayload: { query: string; variables?: Record<string, any> } = { query };
  if (variables && Object.keys(variables).length > 0) {
    bodyPayload.variables = variables;
  }
  
  // Conditional logging for missing env vars if you want to handle it gracefully
  if (!SHOPIFY_STORE_DOMAIN || !SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
    console.error("Shopify API call attempted without complete configuration.");
    return { errors: [{ message: "Shopify configuration is missing." }] };
  }

  try {
    const response = await fetch(SHOPIFY_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': SHOPIFY_STOREFRONT_ACCESS_TOKEN,
      },
      body: JSON.stringify(bodyPayload),
      cache: cache, // Next.js extended fetch options
      // next: { revalidate: 60 } // Example: revalidate every 60 seconds
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Shopify API HTTP error! status: ${response.status}`, errorText);
      throw new Error(`Shopify API HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (result.errors) {
      console.error('Shopify API GraphQL Errors:', JSON.stringify(result.errors, null, 2));
      // It's common for Shopify to return errors alongside partial data,
      // so we don't necessarily throw here unless that's desired behavior.
    }

    return result as ShopifyResponse<T>;
  } catch (error) {
    console.error('Error fetching from Shopify:', error);
    // Return an error structure consistent with ShopifyResponse
    return { errors: [{ message: error instanceof Error ? error.message : String(error) }] };
  }
}

// --- Initial Type Definitions (Expand as needed) ---

export interface ShopifyImage {
  url: string;
  altText?: string | null;
  width?: number;
  height?: number;
}

export interface ShopifyMoney {
  amount: string;
  currencyCode: string;
}

export interface ShopifyPriceRange {
  minVariantPrice: ShopifyMoney;
  maxVariantPrice: ShopifyMoney;
}

export interface ShopifyProductVariant {
  id: string;
  title: string;
  sku?: string | null;
  availableForSale: boolean;
  price: ShopifyMoney;
  image?: ShopifyImage | null;
  selectedOptions: Array<{
    name: string;
    value: string;
  }>;
}

export interface ShopifyProduct {
  id: string;
  handle: string;
  title: string;
  descriptionHtml: string;
  tags: string[];
  vendor?: string;
  featuredImage?: ShopifyImage | null;
  priceRange: ShopifyPriceRange;
  variants: {
    edges: Array<{
      node: ShopifyProductVariant;
    }>;
  };
  options: Array<{
    id: string;
    name: string;
    values: string[];
  }>;
  // Add more fields as you query them
}

export interface ShopifyCollection {
  id: string;
  handle: string;
  title: string;
  descriptionHtml?: string | null;
  image?: ShopifyImage | null;
  products?: { // If fetching products within a collection
    edges: Array<{ node: ShopifyProduct }>;
  };
}