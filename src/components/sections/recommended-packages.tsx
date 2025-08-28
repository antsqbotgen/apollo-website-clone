"use client";

import { useState, useEffect } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronLeft, ChevronRight, ShoppingCart, Eye, Loader2 } from "lucide-react";

interface Product {
  id: number;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  price: number;
  originalPrice: number;
  discountPercentage: number;
  homeCollectionAvailable: boolean;
  reportDeliveryHours: number;
  testsIncluded: number;
  isPopular: boolean;
  isSafe: boolean;
  imageUrl: string | null;
}

export default function RecommendedPackages() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const { data: session, isPending } = useSession();
  const router = useRouter();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      // Fetch popular packages without authentication for viewing
      const response = await fetch('/api/products?category=package&is_popular=true&limit=8');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else if (response.status === 401) {
        // If auth required, show empty state or redirect
        console.log('Authentication required for product data');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: number) => {
    if (!session?.user) {
      toast.error("Please login to add items to cart");
      router.push(`/login?redirect=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setAddingToCart(productId);
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId,
          quantity: 1
        })
      });

      if (response.ok) {
        toast.success("Item added to cart successfully!");
      } else if (response.status === 401) {
        toast.error("Please login to add items to cart");
        router.push('/login');
      } else {
        const error = await response.json();
        toast.error(error.error || "Failed to add item to cart");
      }
    } catch (error) {
      toast.error("Failed to add item to cart");
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(null);
    }
  };

  const handleViewDetails = (productId: number) => {
    router.push(`/products/${productId}`);
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recommended Packages</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Comprehensive health packages tailored for your wellness needs
            </p>
          </div>
          
          <div className="flex items-center justify-center min-h-[300px]">
            <div className="flex items-center space-x-2">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
              <span className="text-gray-600">Loading packages...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Recommended Packages</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Comprehensive health packages tailored for your wellness needs
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {products.map((product) => (
            <Card key={product.id} className="hover:shadow-lg transition-shadow duration-300 border border-gray-200">
              <CardContent className="p-6">
                {/* Package Icon */}
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                    <img 
                      src={product.imageUrl || "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/defaultPackageIcon-8.png"}
                      alt={product.name}
                      className="w-10 h-10"
                    />
                  </div>
                </div>

                {/* Package Info */}
                <div className="text-center mb-6">
                  <h3 className="font-semibold text-gray-900 mb-2 min-h-[48px] flex items-center justify-center">
                    {product.name}
                  </h3>
                  
                  {/* Collection & Tests Info */}
                  <div className="space-y-1 mb-4">
                    {product.homeCollectionAvailable && (
                      <p className="text-sm text-green-600 flex items-center justify-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                        Home Collection Available
                      </p>
                    )}
                    <p className="text-sm text-gray-600">
                      {product.testsIncluded} test{product.testsIncluded > 1 ? 's' : ''} included
                    </p>
                    <p className="text-sm text-gray-600">
                      Report in {product.reportDeliveryHours}h
                    </p>
                  </div>

                  {/* Pricing */}
                  <div className="mb-4">
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-2xl font-bold text-red-600">₹{product.price}</span>
                      <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
                    </div>
                    <Badge variant="secondary" className="bg-red-100 text-red-800">
                      {product.discountPercentage}% OFF
                    </Badge>
                  </div>

                  {/* Badges */}
                  <div className="flex justify-center space-x-2 mb-4">
                    {product.isSafe && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        SAFE
                      </Badge>
                    )}
                    {product.isPopular && (
                      <Badge className="bg-orange-100 text-orange-800 text-xs">
                        POPULAR
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Button 
                    onClick={() => handleViewDetails(product.id)}
                    variant="outline" 
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </Button>
                  <Button 
                    onClick={() => handleAddToCart(product.id)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    disabled={addingToCart === product.id}
                  >
                    {addingToCart === product.id ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <Button 
            onClick={() => router.push('/packages')}
            variant="outline" 
            className="px-8 py-3 border-blue-200 text-blue-600 hover:bg-blue-50"
          >
            View All Packages
          </Button>
        </div>
      </div>
    </section>
  );
}