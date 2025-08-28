"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Minus, Trash2, ShoppingCart, Home, ArrowLeft, Loader2, Package, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { authClient, useSession } from "@/lib/auth-client";

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

interface CartItem {
  id: number;
  userId: string;
  productId: number;
  quantity: number;
  createdAt: string;
  updatedAt: string;
  product: Product;
}

interface CartSummary {
  totalItems: number;
  totalAmount: number;
}

interface CartData {
  items: CartItem[];
  summary: CartSummary;
}

export default function CartPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [cartData, setCartData] = useState<CartData | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

  // Redirect if not authenticated
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  // Fetch cart data
  const fetchCart = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/cart", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();
      setCartData(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast.error("Failed to load cart");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user) {
      fetchCart();
    }
  }, [session]);

  // Update item quantity
  const updateQuantity = async (itemId: number, productId: number, newQuantity: number) => {
    if (newQuantity < 1 || newQuantity > 10) return;

    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      const token = localStorage.getItem("bearer_token");

      if (newQuantity === 0) {
        // Remove item
        const response = await fetch(`/api/cart/items?id=${itemId}`, {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (!response.ok) throw new Error("Failed to remove item");
        
        toast.success("Item removed from cart");
      } else {
        // Update quantity by adding difference
        const currentItem = cartData?.items.find(item => item.id === itemId);
        const quantityDiff = newQuantity - (currentItem?.quantity || 0);

        const response = await fetch("/api/cart", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({
            productId: productId,
            quantity: quantityDiff
          })
        });

        if (!response.ok) throw new Error("Failed to update quantity");
        
        toast.success("Quantity updated");
      }

      // Refresh cart
      await fetchCart();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update cart");
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Remove item from cart
  const removeItem = async (itemId: number) => {
    setUpdatingItems(prev => new Set(prev).add(itemId));

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch(`/api/cart/items?id=${itemId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to remove item");
      
      toast.success("Item removed from cart");
      await fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    } finally {
      setUpdatingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  // Clear entire cart
  const clearCart = async () => {
    if (!cartData?.items.length) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/cart", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Failed to clear cart");
      
      toast.success("Cart cleared successfully");
      await fetchCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
      toast.error("Failed to clear cart");
    }
  };

  // Proceed to checkout
  const proceedToCheckout = () => {
    if (!cartData?.items.length) {
      toast.error("Your cart is empty");
      return;
    }
    router.push("/checkout");
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading your cart...</p>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null; // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-primary">
              <Home className="h-4 w-4" />
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium text-foreground">Shopping Cart</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={() => router.back()}
                className="p-2"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Shopping Cart</h1>
                <p className="text-muted-foreground mt-1">
                  {cartData?.summary.totalItems || 0} item(s) in your cart
                </p>
              </div>
            </div>
            {cartData?.items.length ? (
              <Button
                variant="outline"
                onClick={clearCart}
                className="text-destructive border-destructive hover:bg-destructive hover:text-white"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Cart
              </Button>
            ) : null}
          </div>
        </div>

        {!cartData?.items.length ? (
          <div className="text-center py-16">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <ShoppingCart className="h-12 w-12 text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Looks like you haven't added any tests or health packages to your cart yet.
            </p>
            <Button onClick={() => router.push("/")} className="bg-primary hover:bg-primary/90">
              <Package className="h-4 w-4 mr-2" />
              Browse Health Packages
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartData.items.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center">
                        {item.product.imageUrl ? (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-gray-400" />
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground line-clamp-2">
                              {item.product.name}
                            </h3>
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {item.product.description}
                            </p>

                            {/* Badges */}
                            <div className="flex flex-wrap gap-2 mt-3">
                              {item.product.isSafe && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
                                  SAFE
                                </Badge>
                              )}
                              {item.product.homeCollectionAvailable && (
                                <Badge variant="outline" className="text-xs">
                                  Home Collection
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {item.product.reportDeliveryHours}hrs
                              </Badge>
                              {item.product.testsIncluded > 1 && (
                                <Badge variant="outline" className="text-xs">
                                  {item.product.testsIncluded} Tests
                                </Badge>
                              )}
                            </div>
                          </div>

                          {/* Remove Button */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            disabled={updatingItems.has(item.id)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            {updatingItems.has(item.id) ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between mt-4">
                          <div className="flex items-center space-x-2">
                            <span className="text-xl font-bold text-red-600">
                              ₹{item.product.price.toLocaleString()}
                            </span>
                            {item.product.originalPrice > item.product.price && (
                              <>
                                <span className="text-sm text-muted-foreground line-through">
                                  ₹{item.product.originalPrice.toLocaleString()}
                                </span>
                                <Badge variant="destructive" className="text-xs">
                                  {item.product.discountPercentage}% OFF
                                </Badge>
                              </>
                            )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.productId, item.quantity - 1)}
                              disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <Input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => {
                                const newQuantity = parseInt(e.target.value);
                                if (newQuantity >= 1 && newQuantity <= 10) {
                                  updateQuantity(item.id, item.productId, newQuantity);
                                }
                              }}
                              className="w-16 h-8 text-center"
                              min={1}
                              max={10}
                              disabled={updatingItems.has(item.id)}
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateQuantity(item.id, item.productId, item.quantity + 1)}
                              disabled={item.quantity >= 10 || updatingItems.has(item.id)}
                              className="h-8 w-8 p-0"
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Item Total */}
                        <div className="mt-3 text-right">
                          <span className="text-sm text-muted-foreground">Item Total: </span>
                          <span className="font-semibold text-foreground">
                            ₹{(item.product.price * item.quantity).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Items ({cartData.summary.totalItems})</span>
                    <span className="font-medium">₹{cartData.summary.totalAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Home Collection</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>

                  <Separator />

                  <div className="flex justify-between text-lg font-semibold">
                    <span>Total Amount</span>
                    <span className="text-primary">₹{cartData.summary.totalAmount.toLocaleString()}</span>
                  </div>

                  <div className="space-y-2 pt-4">
                    <Button 
                      onClick={proceedToCheckout}
                      className="w-full bg-primary hover:bg-primary/90"
                      size="lg"
                    >
                      Proceed to Checkout
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => router.push("/")}
                    >
                      Continue Shopping
                    </Button>
                  </div>

                  {/* Features */}
                  <div className="pt-4 space-y-3">
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Free home sample collection</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Digital reports within 24-48 hours</span>
                    </div>
                    <div className="flex items-center space-x-3 text-sm text-muted-foreground">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>NABL accredited labs</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}