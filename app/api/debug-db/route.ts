// api/debug-db/route.ts
import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongoDb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const dbStats = await db.stats();
    const productsCount = await db.collection('products').countDocuments();
    const sampleProduct = await db.collection('products').findOne({});
    
    return NextResponse.json({
      database: {
        name: db.databaseName,
        uri: process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@'),
        collections: await db.listCollections().toArray()
      },
      stats: {
        productsCount,
        dbStats: {
          collections: dbStats.collections,
          objects: dbStats.objects,
          dataSize: dbStats.dataSize
        }
      },
      sampleProduct: sampleProduct ? {
        _id: sampleProduct._id.toString(),
        name: sampleProduct.name,
        createdAt: sampleProduct.createdAt
      } : null,
      environment: {
        node_env: process.env.NODE_ENV,
        vercel: process.env.VERCEL,
        vercel_env: process.env.VERCEL_ENV
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error),
      mongodb_uri: process.env.MONGODB_URI?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
    }, { status: 500 });
  }
}