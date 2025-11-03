import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongoDb';
import { ObjectId } from 'mongodb';

// GET 
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ params is a Promise
) {
  try {
    const { id } = await params; // ✅ Await the params
    console.log('Fetching product layout with ID:', id);

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('products');

    let product: any = null;
    if (ObjectId.isValid(id)) {
      product = await collection.findOne<{ _id: ObjectId }>({ _id: new ObjectId(id) });
    }
    if (!product) {
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
    return NextResponse.json({ 
      success: true, 
      layout: product.layout || {
        imageSize: "medium",
        textAlignment: "left",
        showDescription: true,
        showPrice: true,
        borderStyle: "outlined"
      }
    });
  } catch (error) {
    console.error('Error fetching product layout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch product layout' },
      { status: 500 }
    );
  }
}

// PATCH
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> } // ✅ params is a Promise
) {
  try {
    const { id } = await params; // ✅ Await the params
    const { layout } = await request.json();
    
    console.log('Updating product layout for ID:', id, 'with layout:', layout);

    if (!layout) {
      return NextResponse.json(
        { success: false, error: 'Layout data is required' },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const collection = db.collection('products');

    let result: any;
    if (ObjectId.isValid(id)) {
      result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: { 
            layout: layout,
            updatedAt: new Date().toISOString()
          } 
        }
      );
    } else {
      result = await collection.updateOne(
        {
          $or: [{ _id: id as any }, { slug: id }],
        },
        { 
          $set: { 
            layout: layout,
            updatedAt: new Date().toISOString()
          } 
        }
      );
    }

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, error: 'Layout was not modified' },
        { status: 400 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Layout updated successfully',
      layout: layout
    });
  } catch (error) {
    console.error('Error updating product layout:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update product layout' },
      { status: 500 }
    );
  }
}