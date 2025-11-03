// app/api/products/route.ts
import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongoDb';

export async function GET(request: NextRequest) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const products = await db.collection('products')
      .find({})
      .project({
        name: 1,
        slug: 1,
        description: 1,
        price: 1,
        discountPrice: 1,
        image: 1,
        categories: 1,
        brand: 1,
        colors: 1,
        styles: 1,
        materials: 1,
        sizes: 1,
        layout: 1, 
        createdAt: 1,
        updatedAt: 1
      })
      .toArray();

    // Serialize products with layout
    const serializedProducts = products.map(product => ({
      _id: product._id?.toString(),
      name: product.name,
      slug: product.slug,
      description: product.description,
      price: product.price,
      discountPrice: product.discountPrice || 0,
      image: product.image,
      categories: product.categories || [],
      brand: product.brand || '',
      colors: product.colors || [],
      styles: product.styles || [],
      materials: product.materials || [],
      sizes: product.sizes || [],
      layout: product.layout || { // ✅ Include layout with default values
        imageSize: "medium",
        textAlignment: "left", 
        showDescription: true,
        showPrice: true,
        borderStyle: "outlined"
      },
      createdAt: product.createdAt instanceof Date ? product.createdAt.toISOString() : product.createdAt,
      updatedAt: product.updatedAt instanceof Date ? product.updatedAt.toISOString() : product.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: serializedProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}