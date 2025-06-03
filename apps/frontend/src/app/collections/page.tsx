// src/app/collections/page.tsx
import Link from 'next/link';
import { shopifyFetch, ShopifyCollection } from '@/lib/shopify';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import Image from 'next/image';

const GET_ALL_COLLECTIONS_QUERY = `
  query GetAllCollections {
    collections(first: 25) { # Fetch up to 25 collections
      edges {
        node {
          id
          handle
          title
          descriptionHtml
          image {
            url
            altText
            width
            height
          }
        }
      }
    }
  }
`;

interface GetAllCollectionsResponse {
  collections: {
    edges: Array<{ node: ShopifyCollection }>;
  };
}

// This page will be a Server Component, fetching data on the server.
export default async function CollectionsPage() {
  const shopifyResponse = await shopifyFetch<GetAllCollectionsResponse>({
    query: GET_ALL_COLLECTIONS_QUERY,
    cache: 'default', // Or specific Next.js caching like { next: { revalidate: 3600 } }
  });

  if (shopifyResponse.errors || !shopifyResponse.data?.collections) {
    console.error("Failed to fetch collections:", shopifyResponse.errors);
    return <div className="text-center py-10">
             <p className="text-xl text-red-600">Could not load collections.</p>
             <p className="text-sm text-muted-foreground">Please try again later or contact support.</p>
           </div>;
  }

  const collections = shopifyResponse.data.collections.edges.map(edge => edge.node);

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-center md:text-left">Our Collections</h1>
      {collections.length === 0 ? (
        <p className="text-center text-muted-foreground">No collections found.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Link href={`/collections/${collection.handle}`} key={collection.id} className="group">
              <Card className="h-full flex flex-col overflow-hidden transition-all group-hover:shadow-xl group-hover:border-primary">
                {collection.image?.url && (
                  <div className="aspect-[16/9] relative w-full overflow-hidden">
                    <Image
                      src={collection.image.url}
                      alt={collection.image.altText || collection.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="group-hover:text-primary">{collection.title}</CardTitle>
                </CardHeader>
                {collection.descriptionHtml && (
                   <CardContent className="flex-grow">
                    <div 
                      className="text-sm text-muted-foreground line-clamp-3" 
                      dangerouslySetInnerHTML={{ __html: collection.descriptionHtml }} 
                    />
                  </CardContent>
                )}
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}