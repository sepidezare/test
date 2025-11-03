export const dynamic = "force-dynamic";

import ProductsTable from "@/app/components/admin/ProductsTable";
import clientPromise from "@/lib/mongoDb";
import Link from "next/link";

async function getProducts() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const products = await db
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const validProducts = products.filter(
      (p) => p._id && p.name && p.price !== undefined
    );
    const invalidProducts = products.filter(
      (p) => !p._id || !p.name || p.price === undefined
    );

    const defaultLayout = {
      imageSize: "medium" as const,
      textAlignment: "left" as const,
      showDescription: true,
      showPrice: true,
      cardStyle: "detailed" as const,
      borderStyle: "outlined" as const,
    };

    const toISOString = (date: any): string => {
      if (!date) return new Date().toISOString();
      if (date instanceof Date) return date.toISOString();
      if (typeof date === "string") {
        try {
          return new Date(date).toISOString();
        } catch {
          return new Date().toISOString();
        }
      }
      return new Date().toISOString();
    };

    const mappedProducts = validProducts.map((product) => {
      return {
        _id: product._id.toString(),
        name: product.name,
        slug: product.slug || "",
        description: product.description || "",
        price: product.price,
        discountPrice: product.discountPrice || 0,
        image: product.image || "/images/placeholder.jpg",
        categories: product.categories || [],
        brand: product.brand || "",
        colors: product.colors || [],
        sizes: product.sizes || [],
        createdAt: toISOString(product.createdAt),
        updatedAt: toISOString(product.updatedAt),
        layout: product.layout || defaultLayout,
      };
    });
    return {
      products: mappedProducts,
      stats: {
        total: products.length,
        valid: mappedProducts.length,
        invalid: invalidProducts.length,
      },
    };
  } catch (error) {
    return {
      products: [],
      stats: { total: 0, valid: 0, invalid: 0 },
      error: String(error),
    };
  }
}

export default async function ProductsPage() {
  const { products, stats, error } = await getProducts();

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Products Management</h2>
            <div className="text-sm text-gray-600 mt-1">
              Showing {products.length} of {stats.total} products
              {stats.invalid > 0 && (
                <span className="text-red-500 ml-2">
                  ({stats.invalid} invalid products hidden)
                </span>
              )}
            </div>
          </div>
          <Link
            href="/admin/products/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add New Product
          </Link>
        </div>

        {/* Debug Information */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <h3 className="text-red-800 font-semibold">Error:</h3>
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {stats.invalid > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <h3 className="text-yellow-800 font-semibold">
              Data Quality Warning:
            </h3>
            <p className="text-yellow-700">
              {stats.invalid} product(s) are missing required fields and are not
              displayed.
            </p>
          </div>
        )}

        <ProductsTable products={products} />
      </div>
    </div>
  );
}
