export const revalidate = 0;

import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongoDb';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { Product } from '@/types/product';
import { put } from '@vercel/blob';

const UPLOAD_CONFIG = {
  MAX_FILE_SIZE: {
    IMAGE: 5 * 1024 * 1024,
  },
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/avif',
  ],
  ALLOWED_EXTENSIONS: {
    IMAGE: ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'],
  },
};


export async function GET(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    const products = await db
      .collection('products')
      .find({})
      .sort({ createdAt: -1 })
      .toArray();
    products.forEach((product, index) => {
      console.log(`🔄 Product ${index}:`, {
        _id: product._id?.toString(),
        name: product.name,
        price: product.price,
        image: product.image,
        hasImage: !!product.image,
        hasId: !!product._id,
        hasName: !!product.name,
        hasPrice: product.price !== undefined
      });
    });

    const serializedProducts = products.map(product => {
      return {
        _id: product._id?.toString() || `invalid-${Date.now()}`,
        name: product.name || 'Unnamed Product',
        slug: product.slug || '',
        description: product.description || '',
        price: product.price ?? 0,
        discountPrice: product.discountPrice || 0,
        image: product.image || '',
        categories: product.categories || [],
        brand: product.brand || '',
        colors: product.colors || [],
        styles: product.styles || [],
        materials: product.materials || [],
        sizes: product.sizes || [],
        createdAt: product.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: product.updatedAt?.toISOString() || new Date().toISOString(),
      };
    });
    
    return NextResponse.json(serializedProducts);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST
export async function POST(request: Request) {
  try {
    const client = await clientPromise;
    const db = client.db();

    const formData = await request.formData();

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const price = parseFloat(formData.get('price') as string);
    const discountPrice = parseFloat(formData.get('discountPrice') as string) || 0;

    const categories = JSON.parse(formData.get('categories') as string || '[]');
    const brand = formData.get('brand') as string;
    const colors = JSON.parse(formData.get('colors') as string || '[]');
    const sizes = JSON.parse(formData.get('sizes') as string || '[]');

     const layout = JSON.parse(formData.get('layout') as string || '[]');

    if (!name || !description || isNaN(price)) {
      return NextResponse.json(
        { error: 'Name, description, and price are required' },
        { status: 400 }
      );
    }

    if (!categories || categories.length === 0) {
      return NextResponse.json(
        { error: 'At least one category is required' },
        { status: 400 }
      );
    }

    if (!brand) {
      return NextResponse.json(
        { error: 'Brand is required' },
        { status: 400 }
      );
    }

    if (discountPrice > price) {
      return NextResponse.json(
        { error: 'Discount price cannot be greater than regular price' },
        { status: 400 }
      );
    }

    let mainImageUrl = formData.get('imageUrl') as string;
    const mainImageFile = formData.get('mainImage') as File;

    if (mainImageFile && mainImageFile.size > 0) {
      const validationError = validateFile(mainImageFile, 'image');
      if (validationError) {
        return NextResponse.json({ error: `Main image: ${validationError}` }, { status: 400 });
      }
      mainImageUrl = await saveUploadedFile(mainImageFile);
    }

    if (!mainImageUrl) {
      return NextResponse.json({ error: 'Main image is required' }, { status: 400 });
    }

    const slug = generateSlug(name);
    const productData: Omit<Product, '_id'> = {
      name,
      description,
      price,
      discountPrice,
      image: mainImageUrl,
      slug,
      categories,
      brand,
      colors,
      sizes,
      layout,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const result = await db.collection('products').insertOne(productData);
    
    return NextResponse.json({
      success: true,
      insertedId: result.insertedId.toString(),
      product: {
        ...productData,
        _id: result.insertedId.toString(),
      },
      message: 'Product created successfully',
    });
  } catch (error) {
    console.error("Error creating product:", error);

    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 }
    );
  }
}

function validateFile(file: File, expectedType: 'image'): string | null {
  if (expectedType === 'image') {
    if (!UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return `Image type not allowed. Allowed types: ${UPLOAD_CONFIG.ALLOWED_IMAGE_TYPES.join(', ')}`;
    }
    if (file.size > UPLOAD_CONFIG.MAX_FILE_SIZE.IMAGE) {
      const maxSizeMB = UPLOAD_CONFIG.MAX_FILE_SIZE.IMAGE / (1024 * 1024);
      return `Image size too large. Maximum size: ${maxSizeMB}MB`;
    }
  }
  
  const fileExtension = path.extname(file.name).toLowerCase();
  const allowedExtensions = UPLOAD_CONFIG.ALLOWED_EXTENSIONS.IMAGE;
  if (!allowedExtensions.includes(fileExtension)) {
    return `File extension not allowed. Allowed extensions: ${allowedExtensions.join(', ')}`;
  }
  
  const dangerousTypes = [
    'application/x-msdownload',
    'application/x-sh',
    'application/x-bat',
    'application/x-csh',
    'application/x-php',
    'text/x-php',
    'application/x-httpd-php',
  ];
  if (dangerousTypes.includes(file.type)) {
    return 'File type is not allowed for security reasons';
  }
  
  if (file.size === 0) {
    return 'File is empty';
  }
  
  return null;
}

async function saveUploadedFile(file: File): Promise<string> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  if (process.env.VERCEL === '1' || process.env.VERCEL_ENV) {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('Vercel Blob: BLOB_READ_WRITE_TOKEN is not set!');
    }

    const ext = path.extname(file.name);
    const safeName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9.-]/g, '_');
    const fileName = `products/${Date.now()}-${safeName}${ext}`;

    const blob = await put(fileName, buffer, {
      access: 'public',
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    if (!blob?.url) {
      throw new Error('Vercel Blob: Failed to upload file');
    }

    return blob.url;
  }

  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(uploadDir, { recursive: true });
  const ext = path.extname(file.name);
  const safeName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `${Date.now()}-${safeName}${ext}`;
  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);
  return `/uploads/${fileName}`;
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}