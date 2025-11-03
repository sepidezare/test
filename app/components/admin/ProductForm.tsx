"use client";

import Link from "next/link";
import Image from "next/image";
import { Product } from "@/types/product";
import { useState, useRef, useEffect } from "react";

interface ProductFormProps {
  product?: Product;
}

const SAMPLE_BRANDS = ["Nike", "Adidas", "Other"];
const SAMPLE_CATEGORIES = ["T-Shirt", "Shirt", "Trousers", "Shoes"];
const SAMPLE_COLORS = ["Red", "Blue", "Green", "Black", "White"];
const SAMPLE_SIZES = ["S", "M", "L", "XL", "XXL"];

export default function ProductForm({ product }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    discountPrice: 0,
    image: "",
    categories: [] as string[],
    brand: "",
    colors: [] as string[],
    sizes: [] as string[],
  });

  const [mainImageFile, setMainImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [colorDropdownOpen, setColorDropdownOpen] = useState(false);
  const [sizeDropdownOpen, setSizeDropdownOpen] = useState(false);

  const mainImageInputRef = useRef<HTMLInputElement>(null);
  const categoryDropdownRef = useRef<HTMLDivElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const sizeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        description: product.description || "",
        price: product.price || 0,
        discountPrice: product.discountPrice || 0,
        image: product.image || "",
        categories: product.categories || [],
        brand: product.brand || "",
        colors: product.colors || [],
        sizes: product.sizes || [],
      });
    }
  }, [product]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        categoryDropdownRef.current &&
        !categoryDropdownRef.current.contains(event.target as Node)
      ) {
        setCategoryDropdownOpen(false);
      }
      if (
        colorDropdownRef.current &&
        !colorDropdownRef.current.contains(event.target as Node)
      ) {
        setColorDropdownOpen(false);
      }
      if (
        sizeDropdownRef.current &&
        !sizeDropdownRef.current.contains(event.target as Node)
      ) {
        setSizeDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const validateImage = (file: File): string => {
    if (!file.type.startsWith("image/")) {
      return "Please select a valid image file (JPEG, PNG, GIF, etc.)";
    }

    if (file.size > 5 * 1024 * 1024) {
      return "Image size should be less than 5MB";
    }

    return "";
  };

  const handleMainImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setErrors((prev) => ({ ...prev, image: "" }));

    if (file) {
      const imageError = validateImage(file);
      if (imageError) {
        setErrors((prev) => ({ ...prev, image: imageError }));
        if (mainImageInputRef.current) {
          mainImageInputRef.current.value = "";
        }
        return;
      }

      setMainImageFile(file);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const validatePrice = (price: number): string => {
    if (price <= 0) {
      return "Price must be greater than 0";
    }
    if (price > 1000000) {
      return "Price cannot exceed $1,000,000";
    }
    return "";
  };

  const handleMultiSelectChange = (
    field: keyof typeof formData,
    value: string,
    checked: boolean
  ) => {
    setFormData((prev) => {
      const currentArray = prev[field] as string[];
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value],
        };
      } else {
        return {
          ...prev,
          [field]: currentArray.filter((item) => item !== value),
        };
      }
    });
  };

  const handleBrandChange = (
    e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>
  ) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, brand: value }));
  };

  const removeMultiSelectItem = (
    field: keyof typeof formData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((item) => item !== value),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) {
      newErrors.name = "Product name is required";
    }

    const priceError = validatePrice(formData.price);
    if (priceError) {
      newErrors.price = priceError;
    }

    if (formData.discountPrice > formData.price) {
      newErrors.discountPrice =
        "Discount price cannot be greater than regular price";
    }

    if (formData.categories.length === 0) {
      newErrors.categories = "Please select at least one category";
    }

    if (!formData.brand.trim()) {
      newErrors.brand = "Brand is required";
    }

    if (!mainImageFile && !formData.image) {
      newErrors.image = "Product image is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    try {
      const formDataToSend = new FormData();

      formDataToSend.append("name", formData.name);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("price", formData.price.toString());
      formDataToSend.append("discountPrice", formData.discountPrice.toString());

      formDataToSend.append("categories", JSON.stringify(formData.categories));
      formDataToSend.append("brand", formData.brand);
      formDataToSend.append("colors", JSON.stringify(formData.colors));
      formDataToSend.append("sizes", JSON.stringify(formData.sizes));

      if (mainImageFile) {
        formDataToSend.append("mainImage", mainImageFile);
      } else if (formData.image) {
        formDataToSend.append("imageUrl", formData.image);
      }

      const url = product
        ? `/api/admin/products/${product._id}`
        : "/api/admin/products";
      const method = product ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        body: formDataToSend,
      });

      const responseData = await response.json();

      if (response.ok) {
        setMessage(
          product
            ? "Product updated successfully!"
            : "Product created successfully!"
        );

        if (!product) {
          setFormData({
            name: "",
            description: "",
            price: 0,
            discountPrice: 0,
            image: "",
            categories: [],
            brand: "",
            colors: [],
            sizes: [],
          });
          setMainImageFile(null);
          setErrors({});
        }
      } else {
        setMessage(
          `Failed to save product: ${responseData.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error saving product:", error);
      setMessage(
        `Error saving product: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (type === "number") {
      const numValue = parseFloat(value) || 0;

      if (name === "price") {
        const priceError = validatePrice(numValue);
        if (priceError) {
          setErrors((prev) => ({ ...prev, price: priceError }));
        }
      }

      if (name === "discountPrice") {
        if (numValue > formData.price) {
          setErrors((prev) => ({
            ...prev,
            discountPrice:
              "Discount price cannot be greater than regular price",
          }));
        }
      }

      setFormData((prev) => ({
        ...prev,
        [name]: numValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const getDropdownButtonText = (field: string[], defaultText: string) => {
    if (field.length === 0) return defaultText;
    if (field.length === 1) return field[0];
    return `${field.length} selected`;
  };

  return (
    <div className="mx-auto">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-6 rounded-lg shadow"
        noValidate
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className={`w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              step="0.01"
              min="0.01"
              max="1000000"
              className={`w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.price ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Discount Price
            </label>
            <input
              type="number"
              name="discountPrice"
              value={formData.discountPrice}
              onChange={handleChange}
              step="0.01"
              min="0"
              max={formData.price}
              className={`w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.discountPrice
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              }`}
            />
            {errors.discountPrice && (
              <p className="mt-1 text-sm text-red-600">
                {errors.discountPrice}
              </p>
            )}
          </div>

          {/* Brand*/}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Brand *
            </label>
            <select
              name="brand"
              value={formData.brand}
              onChange={handleBrandChange}
              required
              className={`w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.brand ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            >
              <option value="">Select a brand</option>
              {SAMPLE_BRANDS.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
            {errors.brand && (
              <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
            )}
          </div>
          {/* Category*/}
          <div className="relative" ref={categoryDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categories *
            </label>
            <button
              type="button"
              onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
              className={`w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-left ${
                errors.categories
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300"
              } ${
                formData.categories.length > 0
                  ? "text-gray-900"
                  : "text-gray-500"
              }`}
            >
              {getDropdownButtonText(formData.categories, "Select categories")}
              <span className="float-right">▼</span>
            </button>

            {categoryDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="p-3">
                  <div className="space-y-2 mb-3">
                    {SAMPLE_CATEGORIES.map((category) => (
                      <label
                        key={category}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="checkbox"
                          checked={formData.categories.includes(category)}
                          onChange={(e) =>
                            handleMultiSelectChange(
                              "categories",
                              category,
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">
                          {category}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {formData.categories.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {formData.categories.map((category) => (
                    <span
                      key={category}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                    >
                      {category}
                      <button
                        type="button"
                        onClick={() =>
                          removeMultiSelectItem("categories", category)
                        }
                        className="ml-2 hover:text-indigo-900 focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {errors.categories && (
              <p className="mt-1 text-sm text-red-600">{errors.categories}</p>
            )}
          </div>
          {/* Color*/}
          <div className="relative" ref={colorDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Colors
            </label>
            <button
              type="button"
              onClick={() => setColorDropdownOpen(!colorDropdownOpen)}
              className={`w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-left ${
                errors.colors ? "border-red-300 bg-red-50" : "border-gray-300"
              } ${
                formData.colors.length > 0 ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {getDropdownButtonText(formData.colors, "Select colors")}
              <span className="float-right">▼</span>
            </button>

            {colorDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="p-3">
                  <div className="space-y-2 mb-3">
                    {SAMPLE_COLORS.map((color) => (
                      <label
                        key={color}
                        className="flex items-center space-x-3"
                      >
                        <input
                          type="checkbox"
                          checked={formData.colors.includes(color)}
                          onChange={(e) =>
                            handleMultiSelectChange(
                              "colors",
                              color,
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {formData.colors.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {formData.colors.map((color) => (
                    <span
                      key={color}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {color}
                      <button
                        type="button"
                        onClick={() => removeMultiSelectItem("colors", color)}
                        className="ml-2 hover:text-blue-900 focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {errors.colors && (
              <p className="mt-1 text-sm text-red-600">{errors.colors}</p>
            )}
          </div>
          <div className="relative" ref={sizeDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sizes
            </label>
            <button
              type="button"
              onClick={() => setSizeDropdownOpen(!sizeDropdownOpen)}
              className={`w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 text-left ${
                errors.sizes ? "border-red-300 bg-red-50" : "border-gray-300"
              } ${
                formData.sizes.length > 0 ? "text-gray-900" : "text-gray-500"
              }`}
            >
              {getDropdownButtonText(formData.sizes, "Select sizes")}
              <span className="float-right">▼</span>
            </button>

            {sizeDropdownOpen && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                <div className="p-3">
                  <div className="space-y-2 mb-3">
                    {SAMPLE_SIZES.map((size) => (
                      <label key={size} className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={formData.sizes.includes(size)}
                          onChange={(e) =>
                            handleMultiSelectChange(
                              "sizes",
                              size,
                              e.target.checked
                            )
                          }
                          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {formData.sizes.length > 0 && (
              <div className="mt-2">
                <div className="flex flex-wrap gap-2">
                  {formData.sizes.map((size) => (
                    <span
                      key={size}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                    >
                      {size}
                      <button
                        type="button"
                        onClick={() => removeMultiSelectItem("sizes", size)}
                        className="ml-2 hover:text-green-900 focus:outline-none"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {errors.sizes && (
              <p className="mt-1 text-sm text-red-600">{errors.sizes}</p>
            )}
          </div>
        </div>

        {/* Main Image*/}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Main Image *
          </label>
          <div className="space-y-4">
            <input
              type="file"
              ref={mainImageInputRef}
              onChange={handleMainImageChange}
              accept="image/*"
              className={`w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.image ? "border-red-300 bg-red-50" : "border-gray-300"
              }`}
            />

            {errors.image && (
              <p className="mt-1 text-sm text-red-600">{errors.image}</p>
            )}

            {mainImageFile && (
              <div className="p-3 bg-blue-50 rounded-md">
                <p className="text-sm text-blue-700 mb-2">
                  <strong>File selected:</strong> {mainImageFile.name}
                </p>
              </div>
            )}

            {(formData.image || mainImageFile) && (
              <div className="mt-2">
                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                <Image
                  src={
                    mainImageFile
                      ? URL.createObjectURL(mainImageFile)
                      : formData.image
                  }
                  alt="Preview"
                  width={128}
                  height={128}
                  className="h-32 w-32 object-cover rounded-md border"
                  onError={(e) => {
                    console.error("Failed to load image preview");
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className={`w-full p-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 ${
              errors.description
                ? "border-red-300 bg-red-50"
                : "border-gray-300"
            }`}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <Link
            href="/admin/products"
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            {loading
              ? product
                ? "Updating..."
                : "Creating..."
              : product
              ? "Update Product"
              : "Create Product"}
          </button>
        </div>

        {message && (
          <div
            className={`p-3 rounded-md ${
              message.includes("success")
                ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-red-50 text-red-700 border border-red-200"
            }`}
          >
            {message}
          </div>
        )}
      </form>
    </div>
  );
}
