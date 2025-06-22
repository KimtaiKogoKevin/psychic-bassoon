// src/app/products/page.tsx
import { shopifyFetch, ShopifyProduct } from "@/lib/shopify";
import { ProductGrid } from "@/components/products/ProductGrid"; // We will create/update this next

// Define your B2B product filter query string for Shopify
// This query fetches products that have the "wholesale" OR "b2b" tag. Adjust as needed.
const B2B_PRODUCTS_BASE_FILTER = "tag:B2B"; // <--- !!! ADJUST THIS !!!

const GET_ALL_B2B_PRODUCTS_FOR_FILTERING_QUERY = `
  query GetAllB2BProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) {
      edges {
        node {
          id
          handle
          title
          tags     # Essential for tag filtering and search
          vendor   # Essential for vendor filtering
          featuredImage {
            url
            altText
            width
            height
          }
          priceRange {
            minVariantPrice {
              amount
              currencyCode
            }
          }
          # Add any other product fields needed for the Product Card display
        }
      }
    }
  }
`;

interface GetProductsResponse {
  products: {
    edges: Array<{ node: ShopifyProduct }>;
  };
}

export default async function ProductsPage() {
  // Fetch a larger set of products for client-side filtering.
  // Consider pagination if you have thousands of B2B products.
  const shopifyResponse = await shopifyFetch<GetProductsResponse>({
    query: GET_ALL_B2B_PRODUCTS_FOR_FILTERING_QUERY,
    variables: { first: 250, query: B2B_PRODUCTS_BASE_FILTER },
    cache: "default",
  });

  if (shopifyResponse.errors || !shopifyResponse.data?.products) {
    console.error(
      "Products Page: Failed to fetch B2B products for filtering:",
      shopifyResponse.errors
    );
    return (
      <div className="text-center py-10">
        <p className="text-xl text-red-600">
          Could not load wholesale products.
        </p>
        <p className="text-sm text-muted-foreground">
          Please ensure products are tagged correctly for B2B access.
        </p>
      </div>
    );
  }

  const products = shopifyResponse.data.products.edges.map((edge) => edge.node);

  // Extract unique tags and vendors for filter dropdown options
  const allTags = new Set<string>();
  const allVendors = new Set<string>();

  products.forEach((product) => {
    product.tags.forEach((tag) => {
      // Optional: Exclude your primary B2B tags from the filter options if not useful
      // if (tag.toLowerCase() !== 'wholesale' && tag.toLowerCase() !== 'b2b') {
      //   allTags.add(tag);
      // } else {
      allTags.add(tag); // For now, include all tags
      // }
    });
    if (product.vendor) {
      allVendors.add(product.vendor);
    }
  });

  const uniqueTags = Array.from(allTags).sort();
  const uniqueVendors = Array.from(allVendors).sort();

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
        Wholesale Products
      </h1>
      <ProductGrid
        initialProducts={products}
        availableTags={uniqueTags}
        availableVendors={uniqueVendors}
      />
    </div>
  );
}
