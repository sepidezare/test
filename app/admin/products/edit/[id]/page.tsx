//src/app/admin/products/edit/[id]/page.tsx
import { notFound } from "next/navigation";
import { Product } from "../../../../../types/product";
import ProductForm from "@/app/components/admin/ProductForm";
import clientPromise from "../../../../../lib/mongoDb";
import { ObjectId } from "mongodb";

async function getProduct(id: string): Promise<Product | null> {
  try {
    if (!ObjectId.isValid(id)) {
      return null;
    }
    const client = await clientPromise;
    const db = client.db();
    const product = await db.collection("products").findOne({
      _id: new ObjectId(id),
    });

    if (!product) {
      return null;
    }

    // Ensure arrays are properly handled and default to empty arrays if undefined
    const categories = Array.isArray(product.categories)
      ? product.categories
      : [];
    const colors = Array.isArray(product.colors) ? product.colors : [];
    const sizes = Array.isArray(product.sizes) ? product.sizes : [];
    const styles = Array.isArray(product.styles) ? product.styles : [];
    const materials = Array.isArray(product.materials) ? product.materials : [];

    return {
      _id: product._id.toString(),
      name: product.name || "",
      description: product.description || "",
      price: product.price || 0,
      discountPrice: product.discountPrice || 0,
      image: product.image || "",
      brand: product.brand || "",
      categories: categories,
      colors: colors,
      sizes: sizes,
      styles: styles,
      materials: materials,
      slug: product.slug || "",
      createdAt:
        product.createdAt instanceof Date
          ? product.createdAt.toISOString()
          : product.createdAt || new Date().toISOString(),
      updatedAt:
        product.updatedAt instanceof Date
          ? product.updatedAt.toISOString()
          : product.updatedAt || new Date().toISOString(),
      layout: product.layout || {
        imageSize: "medium",
        textAlignment: "left",
        showDescription: true,
        showPrice: true,
        cardStyle: "detailed",
        borderStyle: "outlined",
      },
    } as Product;
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({
  params,
}: EditProductPageProps) {
  // Await the params
  const { id } = await params;

  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // Debug log to check what data is being passed to the form
  console.log("Product data passed to form:", {
    id: product._id,
    name: product.name,
    categories: product.categories,
    colors: product.colors,
    sizes: product.sizes,
    brand: product.brand,
  });

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Edit Product</h2>
          <p className="text-gray-600 mt-1">Update product information</p>
        </div>

        <ProductForm product={product} />
      </div>
    </div>
  );
}
