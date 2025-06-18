// src/app/collections/[collectionHandle]/page.tsx
import Link from "next/link";
import {
  shopifyFetch,
  ShopifyProduct,
  ShopifyCollection,
  ShopifyMoney,
} from "@/lib/shopify";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { notFound } from "next/navigation";
import type { Metadata, ResolvingMetadata } from "next";

// --- CONFIGURATION ---
// IMPORTANT: This should be JUST THE TAG VALUE, e.g., "wholesale" or "b2b"
// This will be used in the ProductFilter for products within the collection.
const B2B_TAG_VALUE_FOR_FILTER = "tag:B2B"; // <--- !!! ADJUST TO YOUR ACTUAL B2B TAG VALUE !!!

// --- GRAPHQL QUERY (Corrected for filters argument) ---
const GET_COLLECTION_WITH_B2B_PRODUCTS_QUERY = `
  query GetCollectionWithB2BProducts(
    $handle: String!, 
    $firstProducts: Int!, 
    $productFilters: [ProductFilter!] 
  ) {
    collectionByHandle(handle: $handle) {
      id
      title
      descriptionHtml
      image {
        url
        altText
        width
        height
      }
      products(first: $firstProducts, filters: $productFilters) { 
        edges {
          node {
            id
            handle
            title
            tags
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
  }
`;

// --- TYPESCRIPT INTERFACES ---
type CollectionWithProducts = ShopifyCollection & {
  products: { edges: Array<{ node: ShopifyProduct }> };
};

interface GetCollectionWithProductsResponse {
  collectionByHandle: CollectionWithProducts | null;
}

type CollectionPageProps = {
  params: { collectionHandle: string };
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
  props: CollectionPageProps, // Use 'props'
  parent: ResolvingMetadata
): Promise<Metadata> {
  const collectionHandle = props.params.collectionHandle; // Access via props.params

  const pageTitle = collectionHandle
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return {
    title: `Collection: ${pageTitle} | Wholesale Portal`,
  };
}

// --- PAGE COMPONENT ---
export default async function CollectionDetailPage(props: CollectionPageProps) {
  // Use 'props'
  const collectionHandle = props.params.collectionHandle; // Access via props.params

  // Construct the product filter for products within this collection
  const productFiltersForCollection = [{ tag: B2B_TAG_VALUE_FOR_FILTER }];

  const shopifyResponse = await shopifyFetch<GetCollectionWithProductsResponse>(
    {
      query: GET_COLLECTION_WITH_B2B_PRODUCTS_QUERY,
      variables: {
        handle: collectionHandle,
        firstProducts: 24,
        productFilters: productFiltersForCollection,
      },
      cache: "default",
    }
  );

  const collection = shopifyResponse.data?.collectionByHandle;

  if (shopifyResponse.errors || !collection) {
    console.error(
      `Collection Detail Page: Failed to fetch collection '${collectionHandle}' or its B2B products. Errors:`,
      shopifyResponse.errors
    );
    notFound();
  }

  const products = collection.products.edges.map((edge) => edge.node);

  return (
    <div>
      <div className="mb-10 p-6 md:p-8 bg-muted/50 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
          {collection.image?.url && (
            <div className="w-full md:w-40 md:h-40 h-48 relative rounded-md overflow-hidden border self-center md:self-start shrink-0">
              <Image
                src={collection.image.url}
                alt={collection.image.altText || collection.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 160px"
              />
            </div>
          )}
          <div className="flex-grow">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 text-center md:text-left">
              {collection.title}
            </h1>
            {collection.descriptionHtml && (
              <div
                className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground text-center md:text-left"
                dangerouslySetInnerHTML={{ __html: collection.descriptionHtml }}
              />
            )}
          </div>
        </div>
      </div>

      {products.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          No B2B products found in this collection matching the tag: "
          {B2B_TAG_VALUE_FOR_FILTER}".
        </p>
      ) : (
        <>
          <h2 className="text-2xl font-semibold mb-6 text-center md:text-left">
            B2B Products in: {collection.title}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                href={`/products/${product.handle}`}
                key={product.id}
                className="group"
              >
                <Card className="h-full flex flex-col overflow-hidden transition-all group-hover:shadow-xl group-hover:border-primary">
                  {product.featuredImage?.url ? (
                    <div className="aspect-square relative w-full bg-muted overflow-hidden">
                      <Image
                        src={product.featuredImage.url}
                        alt={product.featuredImage.altText || product.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ) : (
                    <div className="aspect-square flex items-center justify-center bg-muted text-sm text-muted-foreground">
                      No Image
                    </div>
                  )}
                  <CardHeader className="pt-4 pb-2">
                    <CardTitle className="text-base line-clamp-2 group-hover:text-primary">
                      {product.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex-grow pt-0">
                    <p className="text-lg font-semibold">
                      {formatPrice(product.priceRange.minVariantPrice)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Optional: generateStaticParams for pre-rendering
// export async function generateStaticParams() {
//   const { data } = await shopifyFetch<{ collections: { edges: Array<{ node: { handle: string } }> } }>({
//     query: `query GetCollectionHandles { collections(first: 50) { edges { node { handle } } } }` // Fetch all collection handles
//   });
//   if (data?.errors || !data?.collections) { return []; }
//   return data.collections.edges.map(edge => ({ collectionHandle: edge.node.handle }));
// }
