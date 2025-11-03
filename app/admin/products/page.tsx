//admin/products/page.tsx
import { Product } from "@/types/product";
import ProductsTable from "@/app/components/admin/ProductsTable";
import clientPromise from "@/lib/mongoDb";
import Link from "next/link";

// admin/products/page.tsx
// admin/products/page.tsx
async function getProducts(): Promise<Product[]> {
  try {
    const client = await clientPromise;
    const db = client.db();

    const products = await db
      .collection("products")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    console.log("=== DATABASE PRODUCTS ===");
    console.log("Total products from DB:", products.length);
    products.forEach((p, i) => {
      console.log(`Product ${i}:`, {
        _id: p._id.toString(),
        name: p.name,
        price: p.price,
        image: p.image,
      });
    });

    const mappedProducts = products.map((product) => ({
      _id: product._id.toString(),
      name: product.name,
      price: product.price,
      image: product.image,
    })) as Product[];

    console.log("=== MAPPED PRODUCTS ===");
    console.log("Mapped products count:", mappedProducts.length);

    return mappedProducts;
  } catch (error) {
    console.error("Error fetching products:", error);
    return [];
  }
}

export default async function ProductsPage() {
  const products = await getProducts();

  // This will log in the server console
  console.log("=== PAGE COMPONENT ===");
  console.log("Products received in page:", products.length);
  console.log("Products array:", products);

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            Products Management ({products.length} products)
          </h2>
          <Link
            href="/admin/products/new"
            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
          >
            Add New Product
          </Link>
        </div>

        <ProductsTable products={products} />
      </div>
    </div>
  );
}
