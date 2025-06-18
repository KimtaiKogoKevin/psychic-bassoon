// src/app/products/[productHandle]/page.tsx
import { shopifyFetch, ShopifyProduct, ShopifyMoney } from "@/lib/shopify";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";

// --- CONFIGURATION ---
// This is used to construct the Shopify search query string for verification.
// Example: "tag:wholesale" or "tag:b2b" or "(tag:wholesale OR tag:b2b)"
const B2B_PRODUCT_VERIFICATION_QUERY_PART = "(tag:B2B)"; // <--- !!! ADJUST TO YOUR FULL B2B TAG QUERY !!!

// --- GRAPHQL QUERY ---
const GET_PRODUCT_BY_HANDLE_QUERY = `
  query GetProductByHandle($handle: String!, $productQueryForVerification: String!) {
    productByHandle(handle: $handle) {
      id
      handle
      title
      descriptionHtml
      tags
      vendor
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
        maxVariantPrice {
          amount
          currencyCode
        }
      }
      options {
        id
        name
        values
      }
      variants(first: 20) {
        edges {
          node {
            id
            title
            sku
            availableForSale
            image {
              url
              altText
              width
              height
            }
            price {
              amount
              currencyCode
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
    b2bVerifiedProduct: products(first: 1, query: $productQueryForVerification) {
      edges {
        node {
          id
        }
      }
    }
  }
`;

// --- TYPESCRIPT INTERFACES ---
interface GetProductResponse {
  productByHandle: ShopifyProduct | null;
  b2bVerifiedProduct?: {
    edges: Array<{ node: { id: string } }>;
  } | null;
}

type ProductPageProps = {
  params: { productHandle: string };
};

// --- HELPER FUNCTIONS ---
const formatPrice = (money: ShopifyMoney): string => {
  if (
    !money ||
    typeof money.amount === "undefined" ||
    typeof money.currencyCode === "undefined"
  ) {
    return "Price unavailable";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));
};

// --- METADATA GENERATION ---
export async function generateMetadata(
  props: ProductPageProps, // Use 'props'
  parent: ResolvingMetadata
): Promise<Metadata> {
  const productHandle = props.params.productHandle; // Access via props.params

  // Minimal fetch for title for metadata to avoid full product fetch if possible
  // Or derive a generic title
  const pageTitle = productHandle
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `${pageTitle} | Wholesale Portal`,
    // description: `Details for wholesale product: ${pageTitle}`,
  };
}

// --- PAGE COMPONENT ---
export default async function ProductDetailPage(props: ProductPageProps) {
  // Use 'props'
  const productHandle = props.params.productHandle; // Access via props.params

  // Construct the verification query using the product handle and the B2B tag query part
  const b2bVerificationQueryString = `handle:${productHandle} AND ${B2B_PRODUCT_VERIFICATION_QUERY_PART}`;

  const shopifyResponse = await shopifyFetch<GetProductResponse>({
    query: GET_PRODUCT_BY_HANDLE_QUERY,
    variables: {
      handle: productHandle,
      productQueryForVerification: b2bVerificationQueryString,
    },
    cache: "default",
  });

  const product = shopifyResponse.data?.productByHandle;

  if (shopifyResponse.errors || !product) {
    console.error(
      `Product Detail Page: Failed to fetch product by handle '${productHandle}'. Errors:`,
      shopifyResponse.errors
    );
    notFound();
  }

  const isB2BProduct =
    shopifyResponse.data?.b2bVerifiedProduct?.edges?.length > 0 &&
    shopifyResponse.data.b2bVerifiedProduct.edges[0].node.id === product.id;

  if (!isB2BProduct) {
    console.warn(
      `Product Detail Page: Product '${productHandle}' (ID: ${product.id}) found but is not a B2B product or verification failed. Verification query: "${b2bVerificationQueryString}". Verified product data:`,
      shopifyResponse.data?.b2bVerifiedProduct
    );
    notFound();
  }

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <div className="grid md:grid-cols-2 gap-8 lg:gap-12 items-start">
        <div className="sticky top-24 self-start">
          {product.featuredImage?.url ? (
            <div className="aspect-square relative bg-muted rounded-lg overflow-hidden shadow-lg">
              <Image
                src={product.featuredImage.url}
                alt={product.featuredImage.altText || product.title}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          ) : (
            <div className="aspect-square flex items-center justify-center bg-muted rounded-lg text-muted-foreground">
              No Image Available
            </div>
          )}
        </div>

        <div>
          {product.vendor && (
            <p className="text-sm text-muted-foreground mb-2">
              {product.vendor}
            </p>
          )}
          <h1 className="text-3xl lg:text-4xl font-bold mb-4">
            {product.title}
          </h1>

          <p className="text-2xl font-semibold text-primary mb-6">
            {formatPrice(product.priceRange.minVariantPrice)}
            {product.priceRange.minVariantPrice.amount !==
              product.priceRange.maxVariantPrice.amount &&
              product.priceRange.maxVariantPrice &&
              ` - ${formatPrice(product.priceRange.maxVariantPrice)}`}
          </p>

          {product.descriptionHtml && (
            <div
              className="prose prose-sm dark:prose-invert max-w-none mb-6 text-foreground"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
          )}

          {product.options &&
            product.options.length > 0 &&
            product.options.some(
              (opt) =>
                opt.name.toLowerCase() !== "title" || opt.values.length > 1
            ) && (
              <div className="space-y-4 mb-6">
                {product.options.map((option) => {
                  if (
                    option.name.toLowerCase() === "title" &&
                    option.values.length <= 1 &&
                    option.values[0]?.toLowerCase() === "default title"
                  ) {
                    return null;
                  }
                  return (
                    <div key={option.id}>
                      <h3 className="text-sm font-medium text-muted-foreground mb-2">
                        {option.name}
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {option.values.map((value) => (
                          <Button
                            key={value}
                            variant="outline"
                            size="sm"
                            disabled
                          >
                            {value}
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          <Button size="lg" className="w-full mt-6" disabled>
            Add to B2B Cart
          </Button>

          {product.tags && product.tags.length > 0 && (
            <p className="text-xs text-muted-foreground mt-4">
              Tags: {product.tags.join(", ")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Optional: generateStaticParams for pre-rendering
// export async function generateStaticParams() {
//   const shopifyResponse = await shopifyFetch<{ products: { edges: Array<{ node: { handle: string } }> } }>({
//     query: `query GetB2BProductHandles { products(first: 250, query: "${B2B_PRODUCT_VERIFICATION_QUERY_PART}") { edges { node { handle } } } }`
//   });
//   if (shopifyResponse.errors || !shopifyResponse.data?.products) { return []; }
//   return shopifyResponse.data.products.edges.map(edge => ({ productHandle: edge.node.handle }));
// }
