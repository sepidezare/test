import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongoDb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('Fetching product with ID:', id);

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('products');

    let product: any = null;
    if (ObjectId.isValid(id)) {
      console.log('Searching by ObjectId');
      product = await collection.findOne<{ _id: ObjectId }>({ _id: new ObjectId(id) });
    }
    if (!product) {
      console.log('Searching by string _id or slug');
      product = await collection.findOne({
        $or: [{ _id: id as any }, { slug: id }],
      });
    }

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }
    const serializedProduct = {
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
      layout: product.layout || {
        imageSize: "medium",
        textAlignment: "left",
        showDescription: true,
        showPrice: true,
        borderStyle: "outlined"
      },
      createdAt:
        product.createdAt instanceof Date
          ? product.createdAt.toISOString()
          : product.createdAt,
      updatedAt:
        product.updatedAt instanceof Date
          ? product.updatedAt.toISOString()
          : product.updatedAt,
    };

    return NextResponse.json({ success: true, data: serializedProduct });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}