// apps/frontend/src/components/products/ProductGrid.tsx
"use client"; // This component manages state, so it's a Client Component

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShopifyProduct, ShopifyMoney } from "@/lib/shopify"; // Ensure ShopifyMoney is exported from your lib
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProductGridProps {
  initialProducts: ShopifyProduct[];
  availableTags: string[];
  availableVendors: string[];
}

// Helper function to format price (can be moved to a utils file)
const formatPrice = (money: ShopifyMoney): string => {
  if (
    !money ||
    typeof money.amount === "undefined" ||
    typeof money.currencyCode === "undefined"
  ) {
    return "Price unavailable";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: money.currencyCode,
  }).format(parseFloat(money.amount));
};

export function ProductGrid({
  initialProducts,
  availableTags,
  availableVendors,
}: ProductGridProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>(""); // Empty string means "All"
  const [selectedVendor, setSelectedVendor] = useState<string>(""); // Empty string means "All"

  const filteredProducts = useMemo(() => {
    let productsToFilter = initialProducts;

    // 1. Apply search term filter
    if (searchTerm.trim() !== "") {
      const lowerSearchTerm = searchTerm.toLowerCase();
      productsToFilter = productsToFilter.filter(
        (product) =>
          product.title.toLowerCase().includes(lowerSearchTerm) ||
          product.tags.some((tag) =>
            tag.toLowerCase().includes(lowerSearchTerm)
          ) ||
          (product.vendor &&
            product.vendor.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // 2. Apply selected tag filter
    if (selectedTag) {
      // If selectedTag is not an empty string (i.e., not "All Tags")
      productsToFilter = productsToFilter.filter((product) =>
        product.tags.includes(selectedTag)
      );
    }

    // 3. Apply selected vendor filter
    if (selectedVendor) {
      // If selectedVendor is not an empty string (i.e., not "All Vendors")
      productsToFilter = productsToFilter.filter(
        (product) => product.vendor === selectedVendor
      );
    }

    return productsToFilter;
  }, [initialProducts, searchTerm, selectedTag, selectedVendor]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedTag("");
    setSelectedVendor("");
  };

  return (
    <div>
      {/* Filter Controls Section */}
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 items-end">
        {/* Search Input */}
        <div className="lg:col-span-1">
          {" "}
          {/* Adjusted for potential 4th column for clear button */}
          <Label
            htmlFor="search-products-grid"
            className="block text-sm font-medium text-muted-foreground mb-1"
          >
            Search Products
          </Label>
          <Input
            id="search-products-grid"
            type="text"
            placeholder="Name, tag, vendor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Tag Filter Dropdown */}
        {availableTags.length > 0 && (
          <div className="lg:col-span-1">
            <Label
              htmlFor="tag-filter"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Filter by Tag
            </Label>
            <Select
              value={selectedTag}
              onValueChange={(value) =>
                setSelectedTag(value === "all" ? "" : value)
              }
            >
              <SelectTrigger id="tag-filter" className="w-full">
                <SelectValue placeholder="All Tags" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {availableTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>
                    {tag}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Vendor Filter Dropdown */}
        {availableVendors.length > 0 && (
          <div className="lg:col-span-1">
            <Label
              htmlFor="vendor-filter"
              className="block text-sm font-medium text-muted-foreground mb-1"
            >
              Filter by Vendor
            </Label>
            <Select
              value={selectedVendor}
              onValueChange={(value) =>
                setSelectedVendor(value === "all" ? "" : value)
              }
            >
              <SelectTrigger id="vendor-filter" className="w-full">
                <SelectValue placeholder="All Vendors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Vendors</SelectItem>
                {availableVendors.map((vendor) => (
                  <SelectItem key={vendor} value={vendor}>
                    {vendor}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Clear Filters Button */}
        <div className="lg:col-span-1 self-end">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </div>
      </div>

      {/* Products Grid Display */}
      {filteredProducts.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">
          No wholesale products found matching your current filters.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <Link
              href={`/products/${product.handle}`}
              key={product.id}
              className="group"
            >
              <Card className="h-full flex flex-col overflow-hidden transition-all group-hover:shadow-xl group-hover:border-primary">
                {product.featuredImage?.url ? (
                  <div className="aspect-square relative w-full bg-muted overflow-hidden">
                    <Image
                      src={product.featuredImage.url}
                      alt={product.featuredImage.altText || product.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ) : (
                  <div className="aspect-square flex items-center justify-center bg-muted text-sm text-muted-foreground">
                    No Image
                  </div>
                )}
                <CardHeader className="pt-4 pb-2">
                  <CardTitle className="text-base line-clamp-2 group-hover:text-primary">
                    {product.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow pt-0">
                  <p className="text-lg font-semibold">
                    {formatPrice(product.priceRange.minVariantPrice)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
