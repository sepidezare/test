// api/all-products-debug/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongoDb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const allProducts = await db
      .collection('products')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const detailedProducts = allProducts.map(product => ({
      _id: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      slug: product.slug,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      categories: product.categories,
      brand: product.brand
    }));

    return NextResponse.json({
      totalCount: allProducts.length,
      products: detailedProducts,
      database: db.databaseName
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}