// src/app/products/page.tsx
import Link from "next/link";
import { shopifyFetch, ShopifyProduct } from "@/lib/shopify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";

// Define your B2B product filter query here
// Example: "tag:wholesale" or "tag:b2b" or "tag:wholesale OR tag:b2b"
const B2B_PRODUCTS_FILTER = "tag:B2B"; // <--- !!! IMPORTANT: ADJUST THIS TO YOUR ACTUAL B2B TAG(S) !!!

const GET_B2B_PRODUCTS_QUERY = `
  query GetB2BProducts($first: Int!, $query: String) {
    products(first: $first, query: $query) { # The 'query' argument is used for filtering
      edges {
        node {
          id
          handle
          title
          tags # Useful for debugging the filter
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
  const shopifyResponse = await shopifyFetch<GetProductsResponse>({
    query: GET_B2B_PRODUCTS_QUERY,
    variables: { first: 24, query: B2B_PRODUCTS_FILTER }, // Fetch first 24 B2B products
    cache: "default",
  });

  if (shopifyResponse.errors || !shopifyResponse.data?.products) {
    console.error("Failed to fetch B2B products:", shopifyResponse.errors);
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">
        Wholesale Products
      </h1>
      {products.length === 0 ? (
        <p className="text-center text-muted-foreground">
          No wholesale products found. Please check if products are correctly
          tagged with: "{B2B_PRODUCTS_FILTER}".
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <Link
              href={`/products/${product.handle}`}
              key={product.id}
              className="group"
            >
              <Card className="h-full flex flex-col overflow-hidden transition-all group-hover:shadow-xl group-hover:border-primary">
                {product.featuredImage?.url && (
                  <div className="aspect-square relative w-full bg-muted overflow-hidden">
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader className="pt-4 pb-2">
                  <CardTitle className="text-base line-clamp-2 group-hover:text-primary">
                    {product.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow pt-0">
                  <p className="text-lg font-semibold">
                    {/* Formatting the price */}
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: product.priceRange.minVariantPrice.currencyCode,
                    }).format(
                      parseFloat(product.priceRange.minVariantPrice.amount)
                    )}
                  </p>
                  {/* Optional: Display tags for debugging
                   <p className="text-xs text-muted-foreground mt-1">Tags: {product.tags.join(', ')}</p>
                  */}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
