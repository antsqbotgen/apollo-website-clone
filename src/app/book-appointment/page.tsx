"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authClient, useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Phone, 
  User, 
  Mail, 
  Home,
  ChevronRight,
  ChevronLeft,
  Search,
  CheckCircle,
  AlertCircle,
  Loader2,
  ShoppingCart,
  Heart,
  Building2,
  CreditCard
} from "lucide-react";
import { format } from "date-fns";

interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  description: string;
  category: string;
  fastingRequired?: boolean;
  reportTime: string;
  icon?: string;
}

interface FormData {
  selectedProducts: Product[];
  personalInfo: {
    name: string;
    phone: string;
    email: string;
    age: string;
    gender: string;
    notes: string;
  };
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
  };
  collectionType: "home" | "lab";
  selectedLab?: {
    id: string;
    name: string;
    address: string;
  };
  appointmentDate?: Date;
  appointmentTime: string;
  termsAccepted: boolean;
}

interface Lab {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const timeSlots = [
  { value: "06:00-08:00", label: "6:00 AM - 8:00 AM", period: "Morning" },
  { value: "08:00-10:00", label: "8:00 AM - 10:00 AM", period: "Morning" },
  { value: "10:00-12:00", label: "10:00 AM - 12:00 PM", period: "Morning" },
  { value: "12:00-14:00", label: "12:00 PM - 2:00 PM", period: "Afternoon" },
  { value: "14:00-16:00", label: "2:00 PM - 4:00 PM", period: "Afternoon" },
  { value: "16:00-18:00", label: "4:00 PM - 6:00 PM", period: "Evening" },
  { value: "18:00-20:00", label: "6:00 PM - 8:00 PM", period: "Evening" },
];

const mockProducts: Product[] = [
  {
    id: "1",
    name: "Complete Blood Count (CBC)",
    price: 299,
    originalPrice: 500,
    description: "Comprehensive blood test to check overall health",
    category: "Blood Tests",
    reportTime: "Same day",
    fastingRequired: false,
  },
  {
    id: "2", 
    name: "Lipid Profile",
    price: 450,
    originalPrice: 750,
    description: "Cholesterol and triglyceride levels",
    category: "Blood Tests",
    reportTime: "Next day",
    fastingRequired: true,
  },
  {
    id: "3",
    name: "HbA1c (Diabetes)",
    price: 350,
    originalPrice: 600,
    description: "3-month average blood sugar levels",
    category: "Diabetes",
    reportTime: "Same day",
    fastingRequired: false,
  },
  {
    id: "4",
    name: "Thyroid Profile (T3, T4, TSH)",
    price: 650,
    originalPrice: 1000,
    description: "Complete thyroid function assessment",
    category: "Thyroid",
    reportTime: "Next day",
    fastingRequired: false,
  },
];

const mockLabs: Lab[] = [
  {
    id: "1",
    name: "Apollo Diagnostics - Central Lab",
    address: "123 Medical Center, MG Road",
    city: "Bangalore",
    state: "Karnataka", 
    pincode: "560001",
  },
  {
    id: "2",
    name: "Apollo Diagnostics - Koramangala",
    address: "456 Health Plaza, Koramangala 5th Block",
    city: "Bangalore",
    state: "Karnataka",
    pincode: "560095",
  },
  {
    id: "3",
    name: "Apollo Diagnostics - Whitefield",
    address: "789 Wellness Complex, ITPL Main Road",
    city: "Bangalore", 
    state: "Karnataka",
    pincode: "560066",
  },
];

export default function BookAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending } = useSession();
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(mockProducts);
  
  const [formData, setFormData] = useState<FormData>({
    selectedProducts: [],
    personalInfo: {
      name: "",
      phone: "",
      email: "",
      age: "",
      gender: "",
      notes: "",
    },
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },
    collectionType: "home",
    appointmentTime: "",
    termsAccepted: false,
  });

  // Check authentication and redirect
  useEffect(() => {
    if (!isPending && !session?.user) {
      toast.error("Please login to book an appointment");
      router.push("/login?redirect=/book-appointment");
    }
  }, [session, isPending, router]);

  // Pre-fill user data from session
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        personalInfo: {
          ...prev.personalInfo,
          name: session.user.name || "",
          email: session.user.email || "",
        },
      }));
    }
  }, [session]);

  // Handle product selection from URL
  useEffect(() => {
    const productId = searchParams.get("productId");
    if (productId) {
      const product = mockProducts.find(p => p.id === productId);
      if (product) {
        setFormData(prev => ({
          ...prev,
          selectedProducts: [product],
        }));
      }
    }
  }, [searchParams]);

  // Filter products based on search
  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = mockProducts.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(mockProducts);
    }
  }, [searchQuery]);

  const handleProductToggle = useCallback((product: Product) => {
    setFormData(prev => ({
      ...prev,
      selectedProducts: prev.selectedProducts.find(p => p.id === product.id)
        ? prev.selectedProducts.filter(p => p.id !== product.id)
        : [...prev.selectedProducts, product],
    }));
  }, []);

  const handlePersonalInfoChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      personalInfo: {
        ...prev.personalInfo,
        [field]: value,
      },
    }));
  }, []);

  const handleAddressChange = useCallback((field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }));
  }, []);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (formData.selectedProducts.length === 0) {
          toast.error("Please select at least one test or package");
          return false;
        }
        return true;
      case 2:
        const { name, phone, email, age, gender } = formData.personalInfo;
        if (!name.trim()) {
          toast.error("Please enter your name");
          return false;
        }
        if (!phone.trim() || !/^\d{10}$/.test(phone)) {
          toast.error("Please enter a valid 10-digit phone number");
          return false;
        }
        if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          toast.error("Please enter a valid email address");
          return false;
        }
        if (!age.trim() || parseInt(age) < 1 || parseInt(age) > 120) {
          toast.error("Please enter a valid age");
          return false;
        }
        if (!gender) {
          toast.error("Please select your gender");
          return false;
        }
        return true;
      case 3:
        if (formData.collectionType === "home") {
          const { street, city, state, pincode } = formData.address;
          if (!street.trim()) {
            toast.error("Please enter your street address");
            return false;
          }
          if (!city.trim()) {
            toast.error("Please enter your city");
            return false;
          }
          if (!state.trim()) {
            toast.error("Please enter your state");
            return false;
          }
          if (!pincode.trim() || !/^\d{6}$/.test(pincode)) {
            toast.error("Please enter a valid 6-digit pincode");
            return false;
          }
        } else if (!formData.selectedLab) {
          toast.error("Please select a lab for your visit");
          return false;
        }
        return true;
      case 4:
        if (!formData.appointmentDate) {
          toast.error("Please select an appointment date");
          return false;
        }
        if (!formData.appointmentTime) {
          toast.error("Please select an appointment time");
          return false;
        }
        return true;
      case 5:
        if (!formData.termsAccepted) {
          toast.error("Please accept the terms and conditions");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const calculateTotal = () => {
    return formData.selectedProducts.reduce((sum, product) => sum + product.price, 0);
  };

  const calculateSavings = () => {
    return formData.selectedProducts.reduce((sum, product) => {
      return sum + (product.originalPrice ? product.originalPrice - product.price : 0);
    }, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(5)) return;

    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("bearer_token");
      if (!token) {
        toast.error("Authentication required. Please login again.");
        router.push("/login");
        return;
      }

      const appointmentData = {
        products: formData.selectedProducts.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
        })),
        personalInfo: formData.personalInfo,
        address: formData.collectionType === "home" ? formData.address : null,
        labInfo: formData.collectionType === "lab" ? formData.selectedLab : null,
        collectionType: formData.collectionType,
        appointmentDate: formData.appointmentDate?.toISOString(),
        appointmentTime: formData.appointmentTime,
        totalAmount: calculateTotal(),
        notes: formData.personalInfo.notes,
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(appointmentData),
      });

      if (!response.ok) {
        throw new Error("Failed to create appointment");
      }

      const result = await response.json();
      
      toast.success("Appointment booked successfully!");
      router.push(`/appointments/${result.id}?success=true`);
    } catch (error) {
      console.error("Appointment booking error:", error);
      toast.error("Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const stepTitles = [
    "Select Services",
    "Personal Information", 
    "Collection Details",
    "Date & Time",
    "Review & Confirm"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="hover:text-primary cursor-pointer">Home</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-primary font-medium">Book Appointment</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Book Your Appointment</h1>
            <p className="text-gray-600">Schedule your diagnostic tests with Apollo Diagnostics</p>
          </div>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {stepTitles.map((title, index) => {
                const stepNumber = index + 1;
                const isActive = stepNumber === currentStep;
                const isCompleted = stepNumber < currentStep;
                
                return (
                  <div key={stepNumber} className="flex items-center">
                    <div className={`
                      flex items-center justify-center w-10 h-10 rounded-full border-2 font-medium
                      ${isActive ? 'bg-primary border-primary text-white' : 
                        isCompleted ? 'bg-green-500 border-green-500 text-white' : 
                        'bg-white border-gray-300 text-gray-500'}
                    `}>
                      {isCompleted ? <CheckCircle className="h-5 w-5" /> : stepNumber}
                    </div>
                    <div className="ml-3 hidden sm:block">
                      <p className={`text-sm font-medium ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        Step {stepNumber}
                      </p>
                      <p className={`text-xs ${isActive ? 'text-primary' : isCompleted ? 'text-green-600' : 'text-gray-500'}`}>
                        {title}
                      </p>
                    </div>
                    {index < stepTitles.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-green-500' : 'bg-gray-300'}`} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <Card className="mb-6">
            <CardContent className="p-6">
              {/* Step 1: Service Selection */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Select Tests & Packages</h2>
                    <p className="text-gray-600 mb-4">Choose the diagnostic tests or health packages you need</p>
                    
                    {/* Search Bar */}
                    <div className="relative mb-6">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search for tests, packages, or conditions..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>

                    {/* Selected Products Summary */}
                    {formData.selectedProducts.length > 0 && (
                      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                        <h3 className="font-medium text-blue-900 mb-2">Selected Items ({formData.selectedProducts.length})</h3>
                        <div className="flex flex-wrap gap-2">
                          {formData.selectedProducts.map((product) => (
                            <Badge key={product.id} variant="secondary" className="bg-blue-100 text-blue-800">
                              {product.name} - ₹{product.price}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-sm text-blue-700 mt-2">Total: ₹{calculateTotal()}</p>
                      </div>
                    )}

                    {/* Products Grid */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {filteredProducts.map((product) => {
                        const isSelected = formData.selectedProducts.find(p => p.id === product.id);
                        return (
                          <Card key={product.id} className={`cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary bg-blue-50' : 'hover:shadow-md'}`} 
                                onClick={() => handleProductToggle(product)}>
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2 mb-2">
                                    <h3 className="font-medium text-gray-900">{product.name}</h3>
                                    {isSelected && <CheckCircle className="h-4 w-4 text-primary" />}
                                  </div>
                                  <p className="text-sm text-gray-600 mb-2">{product.description}</p>
                                  <div className="flex items-center space-x-2 mb-2">
                                    <Badge variant="outline" className="text-xs">{product.category}</Badge>
                                    <Badge variant="outline" className="text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      {product.reportTime}
                                    </Badge>
                                    {product.fastingRequired && (
                                      <Badge variant="outline" className="text-xs text-orange-600">
                                        <AlertCircle className="h-3 w-3 mr-1" />
                                        Fasting Required
                                      </Badge>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <span className="text-lg font-bold text-red-600">₹{product.price}</span>
                                    {product.originalPrice && (
                                      <>
                                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                                        <Badge variant="destructive" className="text-xs">
                                          {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
                                        </Badge>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>

                    {filteredProducts.length === 0 && (
                      <div className="text-center py-8">
                        <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500">No tests found matching your search.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 2: Personal Information */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Personal Information</h2>
                    <p className="text-gray-600 mb-4">Please provide your details for the appointment</p>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.personalInfo.name}
                        onChange={(e) => handlePersonalInfoChange("name", e.target.value)}
                        placeholder="Enter your full name"
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.personalInfo.phone}
                        onChange={(e) => handlePersonalInfoChange("phone", e.target.value)}
                        placeholder="Enter 10-digit phone number"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.personalInfo.email}
                        onChange={(e) => handlePersonalInfoChange("email", e.target.value)}
                        placeholder="Enter your email"
                      />
                    </div>

                    <div>
                      <Label htmlFor="age">Age *</Label>
                      <Input
                        id="age"
                        type="number"
                        value={formData.personalInfo.age}
                        onChange={(e) => handlePersonalInfoChange("age", e.target.value)}
                        placeholder="Enter your age"
                        min="1"
                        max="120"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <Label>Gender *</Label>
                      <RadioGroup
                        value={formData.personalInfo.gender}
                        onValueChange={(value) => handlePersonalInfoChange("gender", value)}
                        className="flex space-x-6 mt-2"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="male" id="male" />
                          <Label htmlFor="male">Male</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="female" id="female" />
                          <Label htmlFor="female">Female</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="other" id="other" />
                          <Label htmlFor="other">Other</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div className="md:col-span-2">
                      <Label htmlFor="notes">Special Instructions / Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.personalInfo.notes}
                        onChange={(e) => handlePersonalInfoChange("notes", e.target.value)}
                        placeholder="Any special instructions or medical conditions we should know about..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Address & Collection Details */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Collection Details</h2>
                    <p className="text-gray-600 mb-4">Choose your preferred sample collection method</p>
                  </div>

                  {/* Collection Type Selection */}
                  <div>
                    <Label>Collection Type *</Label>
                    <RadioGroup
                      value={formData.collectionType}
                      onValueChange={(value: "home" | "lab") => setFormData(prev => ({ ...prev, collectionType: value }))}
                      className="flex space-x-6 mt-2"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="home" id="home" />
                        <Label htmlFor="home" className="flex items-center space-x-2">
                          <Home className="h-4 w-4" />
                          <span>Home Collection</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="lab" id="lab" />
                        <Label htmlFor="lab" className="flex items-center space-x-2">
                          <Building2 className="h-4 w-4" />
                          <span>Lab Visit</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Home Collection Address */}
                  {formData.collectionType === "home" && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Home Address</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="md:col-span-2">
                          <Label htmlFor="street">Street Address *</Label>
                          <Input
                            id="street"
                            value={formData.address.street}
                            onChange={(e) => handleAddressChange("street", e.target.value)}
                            placeholder="Enter your complete street address"
                          />
                        </div>

                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={formData.address.city}
                            onChange={(e) => handleAddressChange("city", e.target.value)}
                            placeholder="Enter your city"
                          />
                        </div>

                        <div>
                          <Label htmlFor="state">State *</Label>
                          <Input
                            id="state"
                            value={formData.address.state}
                            onChange={(e) => handleAddressChange("state", e.target.value)}
                            placeholder="Enter your state"
                          />
                        </div>

                        <div>
                          <Label htmlFor="pincode">Pincode *</Label>
                          <Input
                            id="pincode"
                            value={formData.address.pincode}
                            onChange={(e) => handleAddressChange("pincode", e.target.value)}
                            placeholder="Enter 6-digit pincode"
                            maxLength={6}
                          />
                        </div>

                        <div>
                          <Label htmlFor="landmark">Landmark</Label>
                          <Input
                            id="landmark"
                            value={formData.address.landmark}
                            onChange={(e) => handleAddressChange("landmark", e.target.value)}
                            placeholder="Nearby landmark for easy location"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Lab Selection */}
                  {formData.collectionType === "lab" && (
                    <div className="space-y-4">
                      <h3 className="font-medium">Select Nearby Lab</h3>
                      <div className="grid gap-4">
                        {mockLabs.map((lab) => (
                          <Card 
                            key={lab.id} 
                            className={`cursor-pointer transition-all ${formData.selectedLab?.id === lab.id ? 'ring-2 ring-primary bg-blue-50' : 'hover:shadow-md'}`}
                            onClick={() => setFormData(prev => ({ ...prev, selectedLab: lab }))}
                          >
                            <CardContent className="p-4">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h4 className="font-medium text-gray-900">{lab.name}</h4>
                                  <p className="text-sm text-gray-600 mt-1 flex items-center">
                                    <MapPin className="h-4 w-4 mr-1" />
                                    {lab.address}, {lab.city}, {lab.state} - {lab.pincode}
                                  </p>
                                </div>
                                {formData.selectedLab?.id === lab.id && (
                                  <CheckCircle className="h-5 w-5 text-primary" />
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Step 4: Date & Time Selection */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Select Date & Time</h2>
                    <p className="text-gray-600 mb-4">Choose your preferred appointment date and time slot</p>
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    {/* Calendar */}
                    <div>
                      <Label>Select Date *</Label>
                      <Card className="mt-2">
                        <CardContent className="p-4">
                          <Calendar
                            mode="single"
                            selected={formData.appointmentDate}
                            onSelect={(date) => setFormData(prev => ({ ...prev, appointmentDate: date }))}
                            disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                            className="rounded-md"
                          />
                        </CardContent>
                      </Card>
                    </div>

                    {/* Time Slots */}
                    <div>
                      <Label>Select Time Slot *</Label>
                      <div className="mt-2 space-y-4">
                        {["Morning", "Afternoon", "Evening"].map((period) => (
                          <div key={period}>
                            <h4 className="font-medium text-sm text-gray-700 mb-2">{period}</h4>
                            <div className="grid grid-cols-1 gap-2">
                              {timeSlots
                                .filter(slot => slot.period === period)
                                .map((slot) => (
                                  <Button
                                    key={slot.value}
                                    variant={formData.appointmentTime === slot.value ? "default" : "outline"}
                                    className="justify-start h-auto p-3"
                                    onClick={() => setFormData(prev => ({ ...prev, appointmentTime: slot.value }))}
                                  >
                                    <Clock className="h-4 w-4 mr-2" />
                                    {slot.label}
                                  </Button>
                                ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Fasting Requirements */}
                  {formData.selectedProducts.some(p => p.fastingRequired) && (
                    <Card className="bg-orange-50 border-orange-200">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                          <div>
                            <h4 className="font-medium text-orange-900">Fasting Required</h4>
                            <p className="text-sm text-orange-700 mt-1">
                              Some of your selected tests require 8-12 hours of fasting. Please ensure you don't eat or drink anything (except water) before your appointment.
                            </p>
                            <p className="text-sm text-orange-700 mt-2">
                              Fasting required for: {formData.selectedProducts.filter(p => p.fastingRequired).map(p => p.name).join(", ")}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Step 5: Review & Confirmation */}
              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">Review & Confirm</h2>
                    <p className="text-gray-600 mb-4">Please review your appointment details before confirming</p>
                  </div>

                  {/* Selected Services */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <ShoppingCart className="h-5 w-5" />
                        <span>Selected Services</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {formData.selectedProducts.map((product) => (
                          <div key={product.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-gray-600">{product.category}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">₹{product.price}</p>
                              {product.originalPrice && (
                                <p className="text-sm text-gray-500 line-through">₹{product.originalPrice}</p>
                              )}
                            </div>
                          </div>
                        ))}
                        <Separator />
                        <div className="flex justify-between items-center pt-2">
                          <div>
                            <p className="font-medium">Total Amount</p>
                            {calculateSavings() > 0 && (
                              <p className="text-sm text-green-600">You save ₹{calculateSavings()}</p>
                            )}
                          </div>
                          <p className="text-xl font-bold text-primary">₹{calculateTotal()}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Personal Information */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <User className="h-5 w-5" />
                        <span>Personal Information</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-medium">{formData.personalInfo.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-medium">{formData.personalInfo.phone}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{formData.personalInfo.email}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Age & Gender</p>
                          <p className="font-medium">{formData.personalInfo.age} years, {formData.personalInfo.gender}</p>
                        </div>
                      </div>
                      {formData.personalInfo.notes && (
                        <div className="mt-3">
                          <p className="text-sm text-gray-600">Special Instructions</p>
                          <p className="font-medium">{formData.personalInfo.notes}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Collection Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <MapPin className="h-5 w-5" />
                        <span>Collection Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <p className="text-sm text-gray-600">Collection Type</p>
                          <p className="font-medium capitalize">{formData.collectionType} Collection</p>
                        </div>
                        {formData.collectionType === "home" ? (
                          <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="font-medium">
                              {formData.address.street}, {formData.address.city}, {formData.address.state} - {formData.address.pincode}
                              {formData.address.landmark && ` (Near ${formData.address.landmark})`}
                            </p>
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm text-gray-600">Lab Location</p>
                            <p className="font-medium">{formData.selectedLab?.name}</p>
                            <p className="text-sm text-gray-600">{formData.selectedLab?.address}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Appointment Details */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <CalendarIcon className="h-5 w-5" />
                        <span>Appointment Details</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 md:grid-cols-2">
                        <div>
                          <p className="text-sm text-gray-600">Date</p>
                          <p className="font-medium">
                            {formData.appointmentDate ? format(formData.appointmentDate, "EEEE, MMMM do, yyyy") : "Not selected"}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Time</p>
                          <p className="font-medium">
                            {timeSlots.find(slot => slot.value === formData.appointmentTime)?.label || "Not selected"}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Terms and Conditions */}
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <Checkbox
                          id="terms"
                          checked={formData.termsAccepted}
                          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, termsAccepted: checked as boolean }))}
                        />
                        <div className="text-sm">
                          <Label htmlFor="terms" className="cursor-pointer">
                            I agree to the{" "}
                            <a href="/terms" className="text-primary hover:underline" target="_blank">
                              Terms and Conditions
                            </a>{" "}
                            and{" "}
                            <a href="/privacy" className="text-primary hover:underline" target="_blank">
                              Privacy Policy
                            </a>
                          </Label>
                          <p className="text-gray-600 mt-1">
                            By confirming this appointment, you agree to our service terms and acknowledge that you have provided accurate information.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Navigation Buttons */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="flex items-center space-x-2"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </Button>

            {currentStep < 5 ? (
              <Button onClick={handleNext} className="flex items-center space-x-2">
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="h-4 w-4" />
                )}
                <span>{isSubmitting ? "Booking..." : "Confirm Booking"}</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}