import { Metadata } from 'next';
import { supabaseAdmin } from '@/lib/db';
import ProductDetailClient from './ProductDetailClient';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const unwrappedParams = await params;
  const { data: product } = await supabaseAdmin!
    .from('products')
    .select('*, product_images(image_url, is_cover)')
    .eq('id', unwrappedParams.id)
    .single();

  if (!product) {
    return {
      title: 'Product Not Found - Her Highness',
    };
  }

  const coverImage = product.product_images?.find((i: any) => i.is_cover)?.image_url || product.product_images?.[0]?.image_url;

  return {
    title: `${product.name} | Her Highness Jewelry`,
    description: product.description || `Buy ${product.name} at Her Highness. Premium artificial jewelry.`,
    openGraph: {
      title: product.name,
      description: product.description,
      images: coverImage ? [coverImage] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const unwrappedParams = await params;
  
  // Fetch for JSON-LD Schema
  const { data: product } = await supabaseAdmin!
    .from('products')
    .select('*, product_images(image_url, is_cover)')
    .eq('id', unwrappedParams.id)
    .single();
    
  let schemaData = null;
  
  if (product) {
    const coverImage = product.product_images?.find((i: any) => i.is_cover)?.image_url || product.product_images?.[0]?.image_url;
    schemaData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": product.name,
      "image": coverImage ? [coverImage] : [],
      "description": product.description || `Buy ${product.name} at Her Highness.`,
      "sku": product.id,
      "offers": {
        "@type": "Offer",
        "url": `https://herhighness.com/shop/${product.id}`,
        "priceCurrency": "INR",
        "price": product.price,
        "availability": product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      }
    };
  }

  return (
    <>
      {schemaData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      )}
      <ProductDetailClient productId={unwrappedParams.id} />
    </>
  );
}
