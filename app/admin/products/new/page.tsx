import ProductForm from "@/app/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="mb-6">
          <h2 className="text-2xl font-bold">Add New Product</h2>
          <p className="text-gray-600 mt-1">
            Create a new product for your store
          </p>
        </div>

        <ProductForm />
      </div>
    </div>
  );
}
