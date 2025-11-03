"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Product } from "@/types/product";

interface ProductCardProps {
  product: Product;
  onLike: (productId: string) => void;
  onDelete: (productId: string) => void;
  onLayoutChange?: (productId: string, layout: CardLayout) => void;
  isLiked: boolean;
  showLayoutEdit?: boolean;
}

type CardLayout = {
  imageSize: "small" | "medium" | "large";
  textAlignment: "left" | "center" | "right";
  showDescription: boolean;
  showPrice: boolean;
  borderStyle: "none" | "rounded" | "shadowed" | "outlined";
};

const defaultLayout: CardLayout = {
  imageSize: "medium",
  textAlignment: "left",
  showDescription: true,
  showPrice: true,
  borderStyle: "outlined",
};

export default function ProductCard({
  product,
  onLike,
  onDelete,
  onLayoutChange,
  isLiked,
  showLayoutEdit = false,
}: ProductCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isEditingLayout, setIsEditingLayout] = useState(false);

  const [cardLayout, setCardLayout] = useState<CardLayout>(
    product.layout || defaultLayout
  );
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(product._id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(product._id);
  };

  const handleLayoutEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingLayout(!isEditingLayout);
    setHasUnsavedChanges(false);
  };

  const handleLayoutChange = (newLayout: Partial<CardLayout>) => {
    const updatedLayout = { ...cardLayout, ...newLayout };
    setCardLayout(updatedLayout);
    setHasUnsavedChanges(true);
  };

  const handleSaveLayout = async (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!hasUnsavedChanges) {
      setIsEditingLayout(false);
      return;
    }

    setIsSaving(true);

    try {
      const response = await fetch(`/api/products/layout/${product._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ layout: cardLayout }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to save layout");
      }

      if (onLayoutChange) {
        onLayoutChange(product._id, cardLayout);
      }
      setHasUnsavedChanges(false);
      setIsEditingLayout(false);

      console.log("Layout saved successfully:", result.message);
    } catch (err) {
      console.error("Error saving layout:", err);
      alert("Failed to save layout. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };
  const handleCancelEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCardLayout(product.layout || defaultLayout);
    setHasUnsavedChanges(false);
    setIsEditingLayout(false);
  };

  const handleCardClick = () => {
    if (!isEditingLayout) {
      router.push(`/products/${product._id}`);
    }
  };

  const handleViewDetails = (e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/products/${product._id}`);
  };

  const getImageHeight = () => {
    switch (cardLayout.imageSize) {
      case "small":
        return "h-32";
      case "large":
        return "h-64";
      default:
        return "h-48";
    }
  };

  const getTextAlignment = () => {
    switch (cardLayout.textAlignment) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const getBorderStyle = () => {
    switch (cardLayout.borderStyle) {
      case "none":
        return "border-none";
      case "rounded":
        return "border border-gray-200 rounded-2xl";
      case "shadowed":
        return "border border-gray-200 shadow-lg";
      case "outlined":
      default:
        return "border border-gray-300";
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group ${getBorderStyle()}`}
    >
      <div className={`relative ${getImageHeight()} w-full`}>
        {product.image && !imageError ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-contain group-hover:scale-105 transition-transform duration-300"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <span className="text-gray-400">No Image</span>
          </div>
        )}
        <div className="absolute top-2 right-2 flex flex-col space-y-2 z-10">
          <button
            onClick={handleLike}
            className="cursor-pointer w-8 h-8 bg-white rounded-full shadow-md hover:bg-gray-50 flex items-center justify-center transition-colors"
          >
            <svg
              className={`w-4 h-4 ${
                isLiked
                  ? "text-red-500 fill-current"
                  : "text-gray-500 hover:text-red-400"
              }`}
              fill={isLiked ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </button>
          {showLayoutEdit && (
            <button
              onClick={handleLayoutEdit}
              className={`cursor-pointer w-8 h-8 flex items-center justify-center p-1 rounded-full shadow-xl transition-all backdrop-blur-sm ${
                isEditingLayout
                  ? "bg-indigo-500 text-white"
                  : "bg-white text-gray-500 hover:bg-indigo-50 hover:text-indigo-600"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                />
              </svg>
            </button>
          )}
        </div>
        <button
          onClick={handleDelete}
          className="absolute top-2 left-2 p-2 bg-white rounded-full shadow-xl hover:bg-red-50 transition-colors backdrop-blur-sm z-10"
        >
          <svg
            className="w-4 h-4 text-gray-500 hover:text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
            />
          </svg>
        </button>
      </div>
      <div className={`p-4 ${getTextAlignment()}`}>
        {isEditingLayout && (
          <div
            className="mb-4 p-3 bg-gray-50 rounded-lg space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-wrap gap-2">
              {["none", "rounded", "shadowed", "outlined"].map((style) => (
                <button
                  key={style}
                  onClick={() =>
                    handleLayoutChange({
                      borderStyle: style as CardLayout["borderStyle"],
                    })
                  }
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    cardLayout.borderStyle === style
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {style.charAt(0).toUpperCase() + style.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {["small", "medium", "large"].map((size) => (
                <button
                  key={size}
                  onClick={() =>
                    handleLayoutChange({
                      imageSize: size as CardLayout["imageSize"],
                    })
                  }
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    cardLayout.imageSize === size
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {size.charAt(0).toUpperCase() + size.slice(1)} Img
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {["left", "center", "right"].map((alignment) => (
                <button
                  key={alignment}
                  onClick={() =>
                    handleLayoutChange({
                      textAlignment: alignment as CardLayout["textAlignment"],
                    })
                  }
                  className={`px-2 py-1 text-xs rounded transition-colors ${
                    cardLayout.textAlignment === alignment
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {alignment.charAt(0).toUpperCase() + alignment.slice(1)}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={() =>
                  handleLayoutChange({
                    showDescription: !cardLayout.showDescription,
                  })
                }
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  cardLayout.showDescription
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Desc: {cardLayout.showDescription ? "On" : "Off"}
              </button>
              <button
                onClick={() =>
                  handleLayoutChange({ showPrice: !cardLayout.showPrice })
                }
                className={`px-2 py-1 text-xs rounded transition-colors ${
                  cardLayout.showPrice
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Price: {cardLayout.showPrice ? "On" : "Off"}
              </button>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span
                className={`text-xs ${
                  hasUnsavedChanges
                    ? "text-orange-500 font-medium"
                    : "text-gray-500"
                }`}
              >
                {hasUnsavedChanges ? "Unsaved changes" : "No changes"}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="px-3 py-1 text-xs border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>

                <button
                  onClick={handleSaveLayout}
                  disabled={isSaving || !hasUnsavedChanges}
                  className="px-3 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    "Save Layout"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {product.name}
        </h3>

        {cardLayout.showDescription && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}
        <div
          className={`flex items-center justify-between ${
            cardLayout.textAlignment === "center" ? "flex-col space-y-2" : ""
          }`}
        >
          {cardLayout.showPrice && (
            <div className="flex items-center space-x-2">
              {product.discountPrice && product.discountPrice > 0 ? (
                <>
                  <span className="text-lg font-bold text-gray-900">
                    ${product.discountPrice}
                  </span>
                  <span className="text-sm text-gray-500 line-through">
                    ${product.price}
                  </span>
                </>
              ) : (
                <span className="text-lg font-bold text-gray-900">
                  ${product.price}
                </span>
              )}
            </div>
          )}

          <button
            onClick={handleViewDetails}
            className="text-indigo-600 hover:text-indigo-800 text-sm font-medium transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
}
