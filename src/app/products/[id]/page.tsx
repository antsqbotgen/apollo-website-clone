"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { 
  Heart, 
  Share2, 
  ShoppingCart, 
  Calendar,
  Clock,
  Home,
  CheckCircle,
  Info,
  ChevronLeft,
  Star,
  Users,
  Droplets,
  Timer,
  AlertCircle,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

interface Product {
  id: string;
  name: string;
  type: "test" | "package";
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  homeCollection: boolean;
  reportDelivery: string;
  sampleType: string;
  fastingRequired: boolean;
  ageGroup: string;
  preparationInstructions: string[];
  testsIncluded?: number;
  testsList?: string[];
  icon: string;
}

interface RelatedProduct {
  id: string;
  name: string;
  type: "test" | "package";
  price: number;
  originalPrice: number;
  discount: number;
  homeCollection: boolean;
  icon: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProductDetails();
  }, [params.id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${params.id}`);
      
      if (!response.ok) {
        throw new Error("Product not found");
      }
      
      const data = await response.json();
      setProduct(data.product);
      setRelatedProducts(data.relatedProducts || []);
    } catch (error) {
      setError("Failed to load product details");
      console.error("Error fetching product:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!session?.user) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }

    try {
      setAddingToCart(true);
      const token = localStorage.getItem("bearer_token");
      
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: product?.id,
          quantity: 1
        })
      });

      if (!response.ok) {
        throw new Error("Failed to add to cart");
      }

      toast.success("Product added to cart successfully!");
    } catch (error) {
      toast.error("Failed to add product to cart");
      console.error("Error adding to cart:", error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBookNow = () => {
    if (!session?.user) {
      toast.error("Please login to book an appointment");
      router.push("/login");
      return;
    }
    
    router.push(`/book-appointment?productId=${product?.id}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description,
          url: window.location.href
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center gap-2 mb-6">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-1" />
            <Skeleton className="h-4 w-32" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            {/* Product Image Skeleton */}
            <div>
              <Skeleton className="w-full h-96 rounded-lg" />
            </div>

            {/* Product Details Skeleton */}
            <div className="space-y-6">
              <div>
                <Skeleton className="h-8 w-3/4 mb-2" />
                <Skeleton className="h-6 w-20 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-5/6" />
              </div>

              <div className="flex gap-4">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-24" />
              </div>

              <div className="space-y-4">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          </div>

          {/* Related Products Skeleton */}
          <div>
            <Skeleton className="h-8 w-48 mb-6" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full rounded-lg" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full mx-4">
          <CardContent className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-600 mb-6">
              The product you're looking for doesn't exist or has been removed.
            </p>
            <Button onClick={() => router.push("/products")} className="bg-primary hover:bg-primary/90">
              Browse Products
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-primary">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href="/products" className="hover:text-primary">Products</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-gray-900 font-medium">{product.name}</span>
        </nav>

        {/* Back Button */}
        <Button
          variant="ghost" 
          onClick={() => router.back()}
          className="mb-6 p-0 h-auto font-normal text-gray-600 hover:text-primary"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to Products
        </Button>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="bg-white rounded-lg p-8 shadow-sm border">
            <div className="aspect-square bg-gray-50 rounded-lg flex items-center justify-center">
              <img 
                src={product.icon} 
                alt={product.name}
                className="w-48 h-48 object-contain"
              />
            </div>
          </div>

          {/* Product Information */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                <Badge variant={product.type === "package" ? "default" : "secondary"}>
                  {product.type === "package" ? "Package" : "Test"}
                </Badge>
              </div>
              
              {product.homeCollection && (
                <div className="flex items-center gap-2 mb-4">
                  <Home className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-green-600 font-medium">Home Collection Available</span>
                </div>
              )}

              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            {/* Pricing */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-bold text-red-600">₹{product.price}</span>
                <span className="text-lg text-gray-500 line-through">₹{product.originalPrice}</span>
              </div>
              <Badge variant="destructive" className="bg-red-100 text-red-700">
                {product.discount}% OFF
              </Badge>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex-1 bg-primary hover:bg-primary/90 text-white py-3"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                {addingToCart ? "Adding..." : "Add to Cart"}
              </Button>
              
              <Button 
                onClick={handleBookNow}
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary hover:text-white py-3"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Book Now
              </Button>
              
              <Button 
                onClick={handleShare}
                variant="outline"
                size="icon"
                className="py-3 px-3"
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>

            {/* Key Information Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">Report Delivery</p>
                      <p className="text-sm text-gray-600">{product.reportDelivery}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Droplets className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">Sample Type</p>
                      <p className="text-sm text-gray-600">{product.sampleType}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {product.testsIncluded && (
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium text-gray-900">Tests Included</p>
                        <p className="text-sm text-gray-600">{product.testsIncluded} tests</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium text-gray-900">Age Group</p>
                      <p className="text-sm text-gray-600">{product.ageGroup}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Detailed Information */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Test Details */}
          <div className="lg:col-span-2 space-y-6">
            {product.testsList && product.testsList.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5 text-primary" />
                    Tests Included
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {product.testsList.map((test, index) => (
                      <div key={index} className="flex items-center gap-2 py-1">
                        <div className="w-2 h-2 bg-primary rounded-full" />
                        <span className="text-sm text-gray-700">{test}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Preparation Instructions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="h-5 w-5 text-primary" />
                  Preparation Instructions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {product.fastingRequired && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <Timer className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <p className="font-medium text-yellow-800">Fasting Required</p>
                        <p className="text-sm text-yellow-700">Please fast for 8-12 hours before sample collection</p>
                      </div>
                    </div>
                  )}
                  
                  {product.preparationInstructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                        {index + 1}
                      </div>
                      <p className="text-gray-700">{instruction}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">How is the sample collected?</h4>
                  <p className="text-sm text-gray-600">Our trained phlebotomist will visit your home at your preferred time for safe sample collection.</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">When will I get my report?</h4>
                  <p className="text-sm text-gray-600">You'll receive your report within {product.reportDelivery} via email and SMS.</p>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Is the test safe?</h4>
                  <p className="text-sm text-gray-600">Yes, all our tests follow strict safety protocols and are conducted by certified professionals.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Card key={relatedProduct.id} className="group hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="aspect-square bg-gray-50 rounded-lg mb-4 flex items-center justify-center">
                      <img 
                        src={relatedProduct.icon} 
                        alt={relatedProduct.name}
                        className="w-16 h-16 object-contain"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={relatedProduct.type === "package" ? "default" : "secondary"} className="text-xs">
                          {relatedProduct.type === "package" ? "Package" : "Test"}
                        </Badge>
                        {relatedProduct.homeCollection && (
                          <Home className="h-3 w-3 text-green-600" />
                        )}
                      </div>
                      
                      <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedProduct.name}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-red-600">₹{relatedProduct.price}</span>
                        <span className="text-sm text-gray-500 line-through">₹{relatedProduct.originalPrice}</span>
                        <Badge variant="destructive" className="text-xs bg-red-100 text-red-700">
                          {relatedProduct.discount}% OFF
                        </Badge>
                      </div>
                      
                      <Button 
                        onClick={() => router.push(`/products/${relatedProduct.id}`)}
                        className="w-full mt-3 bg-primary hover:bg-primary/90"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}