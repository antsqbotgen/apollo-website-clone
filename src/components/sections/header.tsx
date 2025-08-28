"use client";

import { useState, useEffect } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  MapPin, 
  Phone, 
  ChevronDown, 
  User, 
  ShoppingCart,
  LogOut,
  Package,
  FileText,
  Settings
} from "lucide-react";
import Link from "next/link";

interface CartSummary {
  totalItems: number;
  totalAmount: number;
}

export default function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("Hyderabad");
  const [cartSummary, setCartSummary] = useState<CartSummary>({ totalItems: 0, totalAmount: 0 });
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();

  // Fetch cart summary when user is authenticated
  useEffect(() => {
    if (session?.user) {
      fetchCartSummary();
    } else {
      setCartSummary({ totalItems: 0, totalAmount: 0 });
    }
  }, [session]);

  const fetchCartSummary = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch('/api/cart', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setCartSummary(data.summary);
      }
    } catch (error) {
      console.error('Error fetching cart summary:', error);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await authClient.signOut();
      if (error?.code) {
        toast.error(error.code);
      } else {
        localStorage.removeItem("bearer_token");
        refetch(); // Update session state
        setCartSummary({ totalItems: 0, totalAmount: 0 }); // Clear cart
        toast.success("Signed out successfully");
        router.push("/");
      }
    } catch (error) {
      toast.error("Error signing out");
    }
  };

  const navigateToCart = () => {
    if (!session?.user) {
      toast.error("Please login to view cart");
      router.push('/login');
      return;
    }
    router.push('/cart');
  };

  const cities = ["Hyderabad", "Bangalore", "Chennai", "Delhi", "Mumbai", "Pune", "Kolkata"];

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      {/* Top Bar */}
      <div className="bg-blue-50 py-2">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-gray-600">
                <Phone className="w-4 h-4 mr-2 text-blue-600" />
                <span>1860-500-9999 (Toll Free)</span>
              </div>
              <div className="flex items-center text-gray-600">
                <img 
                  src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/icons/homeCollectionImage-1.png"
                  alt="Home Collection"
                  className="w-4 h-4 mr-2"
                />
                <span>Free Home Collection</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              {!isPending && !session?.user && (
                <>
                  <Link href="/login" className="text-blue-600 hover:text-blue-800">
                    Login
                  </Link>
                  <span className="text-gray-400">|</span>
                  <Link href="/register" className="text-blue-600 hover:text-blue-800">
                    Register
                  </Link>
                </>
              )}
              
              {session?.user && (
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 text-blue-600 hover:text-blue-800">
                    <User className="w-4 h-4" />
                    <span>Welcome, {session.user.name}</span>
                    <ChevronDown className="w-4 h-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {session.user.role === 'patient' && (
                      <>
                        <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                          <User className="w-4 h-4 mr-2" />
                          Dashboard
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/orders')}>
                          <Package className="w-4 h-4 mr-2" />
                          My Orders
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/appointments')}>
                          <FileText className="w-4 h-4 mr-2" />
                          Appointments
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => router.push('/profile')}>
                          <Settings className="w-4 h-4 mr-2" />
                          Profile Settings
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    {session.user.role === 'lab_technician' && (
                      <DropdownMenuItem onClick={() => router.push('/lab/dashboard')}>
                        <User className="w-4 h-4 mr-2" />
                        Lab Dashboard
                      </DropdownMenuItem>
                    )}
                    
                    {session.user.role === 'sample_collection_technician' && (
                      <DropdownMenuItem onClick={() => router.push('/collection/dashboard')}>
                        <User className="w-4 h-4 mr-2" />
                        Collection Dashboard
                      </DropdownMenuItem>
                    )}
                    
                    {session.user.role === 'admin' && (
                      <DropdownMenuItem onClick={() => router.push('/admin/dashboard')}>
                        <User className="w-4 h-4 mr-2" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <img 
                src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/00ecda9d-b9cd-4db4-9d6a-c82553f50496-apollodiagnostics-in/assets/images/logo-1.png"
                alt="Apollo Diagnostics"
                className="h-12"
              />
            </Link>

            {/* Search Bar */}
            <div className="flex-1 max-w-2xl mx-8">
              <form onSubmit={handleSearch} className="flex">
                {/* City Selector */}
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center space-x-2 px-4 py-3 bg-white border border-r-0 border-gray-300 rounded-l-lg hover:bg-gray-50 min-w-[140px]">
                    <MapPin className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-700">{selectedCity}</span>
                    <ChevronDown className="w-4 h-4 text-gray-500" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {cities.map((city) => (
                      <DropdownMenuItem 
                        key={city}
                        onClick={() => setSelectedCity(city)}
                      >
                        {city}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Search Input */}
                <div className="flex flex-1">
                  <Input
                    type="text"
                    placeholder="Search for tests, packages, health conditions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="border-l-0 border-r-0 rounded-none focus:z-10"
                  />
                  <Button 
                    type="submit"
                    className="rounded-l-none bg-blue-600 hover:bg-blue-700 px-6"
                  >
                    <Search className="w-4 h-4" />
                  </Button>
                </div>
              </form>
            </div>

            {/* Cart */}
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={navigateToCart}
                className="relative flex items-center space-x-2 px-4 py-2 border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="hidden md:inline">Cart</span>
                {cartSummary.totalItems > 0 && (
                  <Badge className="absolute -top-2 -right-2 bg-red-500 text-white text-xs min-w-[20px] h-5 flex items-center justify-center p-0">
                    {cartSummary.totalItems}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="bg-gray-50 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <nav className="flex items-center space-x-8 py-3">
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-sm text-gray-700 hover:text-blue-600">
                <span>Health Risks</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => router.push('/health-risks/diabetes')}>
                  Diabetes
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/health-risks/heart-disease')}>
                  Heart Disease
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/health-risks/hypertension')}>
                  Hypertension
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center space-x-1 text-sm text-gray-700 hover:text-blue-600">
                <span>Health Conditions</span>
                <ChevronDown className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => router.push('/conditions/cardiovascular')}>
                  Cardiovascular
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/conditions/endocrine')}>
                  Endocrine
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/conditions/metabolic')}>
                  Metabolic
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/packages" className="text-sm text-gray-700 hover:text-blue-600">
              Health Check Packages
            </Link>

            <Link href="/tests" className="text-sm text-gray-700 hover:text-blue-600">
              Book A Test
            </Link>

            <Link href="/centers" className="text-sm text-gray-700 hover:text-blue-600">
              Find Nearest Centre
            </Link>

            <Link href="/franchise" className="text-sm text-gray-700 hover:text-blue-600">
              Franchise
            </Link>

            <Link href="/reports" className="text-sm text-gray-700 hover:text-blue-600">
              Download Report
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}