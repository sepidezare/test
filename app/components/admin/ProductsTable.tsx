// components/admin/ProductsTable.tsx
"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product";

interface ProductsTableProps {
  products: Product[];
}

export default function ProductsTable({ products }: ProductsTableProps) {
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);

  useEffect(() => {
    console.log("📦 ProductsTable received products:", products);
    console.log("📦 Products count:", products.length);

    // Check for any filtering that might be happening
    const productsWithImages = products.filter((p) => p.image);
    const productsWithoutImages = products.filter((p) => !p.image);

    console.log("📦 Products with images:", productsWithImages.length);
    console.log("📦 Products without images:", productsWithoutImages.length);

    if (productsWithoutImages.length > 0) {
      console.log("📦 Products missing images:", productsWithoutImages);
    }

    setDisplayedProducts(products);
  }, [products]);

  // Simple table without any complex logic
  return (
    <div>
      <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h4 className="font-bold">ProductsTable Debug:</h4>
        <p>Received: {products.length} products</p>
        <p>Displaying: {displayedProducts.length} products</p>
        {displayedProducts.length !== products.length && (
          <p className="text-red-500">
            ⚠️ Some products are not being displayed!
          </p>
        )}
      </div>

      {displayedProducts.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No products to display</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">Image</th>
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Price</th>
                <th className="py-2 px-4 border-b">ID</th>
              </tr>
            </thead>
            <tbody>
              {displayedProducts.map((product, index) => (
                <tr
                  key={product._id}
                  className={index % 2 === 0 ? "bg-gray-50" : ""}
                >
                  <td className="py-2 px-4 border-b">
                    {product.image ? (
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-10 h-10 object-cover rounded"
                        onError={(e) => {
                          console.error("Image failed to load:", product.image);
                          e.currentTarget.src = "/placeholder-image.jpg";
                        }}
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs">
                        No img
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-4 border-b">{product.name}</td>
                  <td className="py-2 px-4 border-b">${product.price}</td>
                  <td className="py-2 px-4 border-b text-xs font-mono">
                    {product._id.substring(0, 8)}...
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
