"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authClient, useSession } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Home, 
  ShoppingCart, 
  CreditCard, 
  MapPin, 
  Clock, 
  Calendar,
  Building2,
  Shield,
  Award,
  Truck,
  Heart,
  CheckCircle,
  Loader2,
  Phone,
  Mail,
  User,
  MapPinIcon,
  CalendarDays,
  Timer
} from 'lucide-react';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  product: {
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
    isSafe: boolean;
    imageUrl: string | null;
  };
}

interface CartSummary {
  totalItems: number;
  totalAmount: number;
}

interface CheckoutForm {
  customerName: string;
  customerPhone: string;
  collectionType: 'home_collection' | 'lab_visit';
  collectionDate: string;
  collectionTimeSlot: string;
  customerAddress: string;
  customerCity: string;
  customerPincode: string;
  paymentMethod: string;
  notes: string;
  labLocation: string;
}

const timeSlots = [
  '06:00-09:00',
  '09:00-12:00',
  '12:00-15:00',
  '15:00-18:00',
  '18:00-21:00'
];

const businessHoursSlots = [
  '09:00-12:00',
  '12:00-15:00',
  '15:00-18:00'
];

const labLocations = [
  'Apollo Diagnostics - Banjara Hills',
  'Apollo Diagnostics - Jubilee Hills',
  'Apollo Diagnostics - HITEC City',
  'Apollo Diagnostics - Secunderabad',
  'Apollo Diagnostics - Kukatpally',
  'Apollo Diagnostics - Gachibowli'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSummary, setCartSummary] = useState<CartSummary>({ totalItems: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const [form, setForm] = useState<CheckoutForm>({
    customerName: '',
    customerPhone: '',
    collectionType: 'home_collection',
    collectionDate: '',
    collectionTimeSlot: '',
    customerAddress: '',
    customerCity: '',
    customerPincode: '',
    paymentMethod: 'online_payment',
    notes: '',
    labLocation: ''
  });

  // Authentication check
  useEffect(() => {
    if (!isPending && !session?.user) {
      toast.error('Please login to continue with checkout');
      router.push('/login?redirect=/checkout');
    }
  }, [session, isPending, router]);

  // Pre-fill user data
  useEffect(() => {
    if (session?.user) {
      setForm(prev => ({
        ...prev,
        customerName: session.user.name || '',
      }));
    }
  }, [session]);

  // Fetch cart items
  useEffect(() => {
    const fetchCart = async () => {
      if (!session?.user) return;

      try {
        const token = localStorage.getItem('bearer_token');
        if (!token) {
          toast.error('Authentication required');
          router.push('/login');
          return;
        }

        const response = await fetch('/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.status === 401) {
          toast.error('Please login again');
          router.push('/login');
          return;
        }

        if (!response.ok) {
          throw new Error('Failed to fetch cart');
        }

        const data = await response.json();
        
        if (data.items.length === 0) {
          toast.error('Your cart is empty');
          router.push('/cart');
          return;
        }

        setCartItems(data.items);
        setCartSummary(data.summary);
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error('Failed to load cart items');
        router.push('/cart');
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [session, router]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!form.customerName.trim() || form.customerName.trim().length < 2) {
      newErrors.customerName = 'Name must be at least 2 characters';
    }

    if (!form.customerPhone.trim() || !/^[+]?[\d\s\-\(\)]{10,15}$/.test(form.customerPhone)) {
      newErrors.customerPhone = 'Please enter a valid phone number';
    }

    if (!form.collectionDate) {
      newErrors.collectionDate = 'Please select a collection date';
    } else {
      const selectedDate = new Date(form.collectionDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (selectedDate <= today) {
        newErrors.collectionDate = 'Collection date must be in the future';
      }
    }

    if (!form.collectionTimeSlot) {
      newErrors.collectionTimeSlot = 'Please select a time slot';
    }

    if (form.collectionType === 'home_collection') {
      if (!form.customerAddress.trim()) {
        newErrors.customerAddress = 'Address is required for home collection';
      }
      if (!form.customerCity.trim()) {
        newErrors.customerCity = 'City is required for home collection';
      }
      if (!form.customerPincode.trim() || !/^\d{6}$/.test(form.customerPincode)) {
        newErrors.customerPincode = 'Please enter a valid 6-digit pincode';
      }
    }

    if (form.collectionType === 'lab_visit' && !form.labLocation) {
      newErrors.labLocation = 'Please select a lab location';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix the errors in the form');
      return;
    }

    setSubmitting(true);

    try {
      const token = localStorage.getItem('bearer_token');
      if (!token) {
        toast.error('Authentication required');
        router.push('/login');
        return;
      }

      // Create order
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          customerName: form.customerName.trim(),
          customerPhone: form.customerPhone.trim(),
          collectionType: form.collectionType,
          collectionDate: form.collectionDate,
          collectionTimeSlot: form.collectionTimeSlot,
          customerAddress: form.collectionType === 'home_collection' ? form.customerAddress.trim() : null,
          customerCity: form.collectionType === 'home_collection' ? form.customerCity.trim() : null,
          customerPincode: form.collectionType === 'home_collection' ? form.customerPincode.trim() : null,
          paymentMethod: form.paymentMethod,
          notes: form.notes.trim() || null
        })
      });

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json();
        throw new Error(errorData.error || 'Failed to create order');
      }

      const order = await orderResponse.json();

      // Create appointment
      const appointmentResponse = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          orderId: order.id,
          appointmentType: form.collectionType,
          appointmentDate: form.collectionDate,
          appointmentTime: form.collectionTimeSlot,
          labLocation: form.collectionType === 'lab_visit' ? form.labLocation : null,
          customerNotes: form.notes.trim() || null
        })
      });

      if (!appointmentResponse.ok) {
        const errorData = await appointmentResponse.json();
        console.warn('Appointment creation failed:', errorData);
        // Continue even if appointment fails
      }

      toast.success('Order placed successfully!');
      router.push(`/orders/${order.id}`);

    } catch (error) {
      console.error('Order submission error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span className="text-lg">Loading checkout...</span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container py-4">
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Home className="h-4 w-4" />
            <span>Home</span>
            <span>/</span>
            <ShoppingCart className="h-4 w-4" />
            <span>Cart</span>
            <span>/</span>
            <CreditCard className="h-4 w-4" />
            <span className="text-foreground font-medium">Checkout</span>
          </div>
        </div>
      </div>

      <div className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Customer Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Full Name *</Label>
                      <Input
                        id="customerName"
                        value={form.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        placeholder="Enter your full name"
                        className={errors.customerName ? 'border-destructive' : ''}
                      />
                      {errors.customerName && (
                        <p className="text-sm text-destructive">{errors.customerName}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">Phone Number *</Label>
                      <Input
                        id="customerPhone"
                        value={form.customerPhone}
                        onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                        placeholder="Enter your phone number"
                        className={errors.customerPhone ? 'border-destructive' : ''}
                      />
                      {errors.customerPhone && (
                        <p className="text-sm text-destructive">{errors.customerPhone}</p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={session.user.email}
                      readOnly
                      className="bg-muted"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Collection Type */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <MapPin className="h-5 w-5" />
                    <span>Collection Type</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={form.collectionType}
                    onValueChange={(value) => handleInputChange('collectionType', value)}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="home_collection" id="home_collection" />
                      <Label htmlFor="home_collection" className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <Truck className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">Home Collection</div>
                            <div className="text-sm text-muted-foreground">Free sample collection at your doorstep</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="lab_visit" id="lab_visit" />
                      <Label htmlFor="lab_visit" className="flex-1 cursor-pointer">
                        <div className="flex items-center space-x-3">
                          <Building2 className="h-5 w-5 text-primary" />
                          <div>
                            <div className="font-medium">Lab Visit</div>
                            <div className="text-sm text-muted-foreground">Visit our lab for sample collection</div>
                          </div>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Collection Details */}
              {form.collectionType === 'home_collection' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MapPinIcon className="h-5 w-5" />
                      <span>Home Collection Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerAddress">Address *</Label>
                      <Textarea
                        id="customerAddress"
                        value={form.customerAddress}
                        onChange={(e) => handleInputChange('customerAddress', e.target.value)}
                        placeholder="Enter your complete address"
                        className={errors.customerAddress ? 'border-destructive' : ''}
                      />
                      {errors.customerAddress && (
                        <p className="text-sm text-destructive">{errors.customerAddress}</p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="customerCity">City *</Label>
                        <Input
                          id="customerCity"
                          value={form.customerCity}
                          onChange={(e) => handleInputChange('customerCity', e.target.value)}
                          placeholder="Enter your city"
                          className={errors.customerCity ? 'border-destructive' : ''}
                        />
                        {errors.customerCity && (
                          <p className="text-sm text-destructive">{errors.customerCity}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="customerPincode">Pincode *</Label>
                        <Input
                          id="customerPincode"
                          value={form.customerPincode}
                          onChange={(e) => handleInputChange('customerPincode', e.target.value)}
                          placeholder="Enter 6-digit pincode"
                          className={errors.customerPincode ? 'border-destructive' : ''}
                        />
                        {errors.customerPincode && (
                          <p className="text-sm text-destructive">{errors.customerPincode}</p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Lab Visit Details */}
              {form.collectionType === 'lab_visit' && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Building2 className="h-5 w-5" />
                      <span>Lab Visit Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="labLocation">Select Lab Location *</Label>
                      <Select
                        value={form.labLocation}
                        onValueChange={(value) => handleInputChange('labLocation', value)}
                      >
                        <SelectTrigger className={errors.labLocation ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Choose a lab location" />
                        </SelectTrigger>
                        <SelectContent>
                          {labLocations.map((location) => (
                            <SelectItem key={location} value={location}>
                              {location}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.labLocation && (
                        <p className="text-sm text-destructive">{errors.labLocation}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Date and Time Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CalendarDays className="h-5 w-5" />
                    <span>Schedule Appointment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="collectionDate">Date *</Label>
                      <Input
                        id="collectionDate"
                        type="date"
                        value={form.collectionDate}
                        onChange={(e) => handleInputChange('collectionDate', e.target.value)}
                        min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
                        className={errors.collectionDate ? 'border-destructive' : ''}
                      />
                      {errors.collectionDate && (
                        <p className="text-sm text-destructive">{errors.collectionDate}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="collectionTimeSlot">Time Slot *</Label>
                      <Select
                        value={form.collectionTimeSlot}
                        onValueChange={(value) => handleInputChange('collectionTimeSlot', value)}
                      >
                        <SelectTrigger className={errors.collectionTimeSlot ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select time slot" />
                        </SelectTrigger>
                        <SelectContent>
                          {(form.collectionType === 'lab_visit' ? businessHoursSlots : timeSlots).map((slot) => (
                            <SelectItem key={slot} value={slot}>
                              {slot}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.collectionTimeSlot && (
                        <p className="text-sm text-destructive">{errors.collectionTimeSlot}</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5" />
                    <span>Payment Method</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={form.paymentMethod}
                    onValueChange={(value) => handleInputChange('paymentMethod', value)}
                    className="space-y-4"
                  >
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="online_payment" id="online_payment" />
                      <Label htmlFor="online_payment" className="flex-1 cursor-pointer">
                        <div className="font-medium">Online Payment</div>
                        <div className="text-sm text-muted-foreground">Pay securely online with card/UPI</div>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-4 border rounded-lg">
                      <RadioGroupItem value="cash_on_collection" id="cash_on_collection" />
                      <Label htmlFor="cash_on_collection" className="flex-1 cursor-pointer">
                        <div className="font-medium">Cash on Collection</div>
                        <div className="text-sm text-muted-foreground">Pay when technician arrives</div>
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>

              {/* Special Instructions */}
              <Card>
                <CardHeader>
                  <CardTitle>Special Instructions</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={form.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any special instructions or requirements (optional)"
                  />
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Right Column - Order Summary */}
          <div className="space-y-6">
            {/* Order Summary */}
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items */}
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Heart className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{item.product.name}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className="text-xs">
                            {item.product.testsIncluded} test{item.product.testsIncluded > 1 ? 's' : ''}
                          </Badge>
                          {item.product.isSafe && (
                            <Badge variant="outline" className="text-xs text-green-600">
                              <Shield className="h-3 w-3 mr-1" />
                              SAFE
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-sm text-muted-foreground">Qty: {item.quantity}</span>
                          <div className="text-right">
                            <div className="font-semibold">₹{(item.product.price * item.quantity).toFixed(2)}</div>
                            {item.product.originalPrice > item.product.price && (
                              <div className="text-xs text-muted-foreground line-through">
                                ₹{(item.product.originalPrice * item.quantity).toFixed(2)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Collection Info */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-sm">
                    <Truck className="h-4 w-4 text-green-600" />
                    <span className="text-green-600 font-medium">Free Home Collection</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Timer className="h-4 w-4 text-blue-600" />
                    <span>Reports in 24-48 hours</span>
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal ({cartSummary.totalItems} items)</span>
                    <span>₹{cartSummary.totalAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Home Collection</span>
                    <span>FREE</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Total Amount</span>
                    <span>₹{cartSummary.totalAmount.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="w-full"
                  size="lg"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Apollo Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Apollo Diagnostics Benefits</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <span className="text-sm">NABL Accredited Labs</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Award className="h-5 w-5 text-blue-600" />
                  <span className="text-sm">ISO Certified Quality</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Truck className="h-5 w-5 text-green-600" />
                  <span className="text-sm">Free Home Collection</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span className="text-sm">Accurate & Timely Reports</span>
                </div>
                <div className="flex items-center space-x-3">
                  <Phone className="h-5 w-5 text-purple-600" />
                  <span className="text-sm">24/7 Customer Support</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}