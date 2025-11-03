//admin/products/page.tsx
import { Product } from "@/types/product";
import ProductsTable from "@/app/components/admin/ProductsTable";
import clientPromise from "@/lib/mongoDb";
import Link from "next/link";

// admin/products/page.tsx
async function getProducts(): Promise<Product[]> {
  try {
    const client = await clientPromise;
    const db = client.db();

    console.log("Fetching products from database:", db.databaseName);

    const products = await db
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log("Raw products from DB:", products);

    const mappedProducts = products.map((product) => ({
      _id: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
      // Include all fields to check for missing data
      description: product.description,
      slug: product.slug,
      categories: product.categories,
      brand: product.brand,
    })) as Product[];

    console.log("Mapped products:", mappedProducts);

    return mappedProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  // Add client-side debug info
  console.log("Products in page component:", products);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">Products Management</h2>
            <div className="text-sm text-gray-500 mt-1">
              Showing: <strong>{products.length}</strong> products | Database:{" "}
              <code>test</code>
            </div>
          </div>
          <Link
            href="/admin/products/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add New Product
          </Link>
        </div>

        {/* Debug info */}
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-bold">Debug Info:</h3>
          <p>Total products: {products.length}</p>
          <p>First product: {products[0]?.name || "None"}</p>
          <p>Last product: {products[products.length - 1]?.name || "None"}</p>
        </div>

        <ProductsTable products={products} />
      </div>
    </div>
  );
}
