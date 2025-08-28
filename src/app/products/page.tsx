"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List, 
  Home, 
  ChevronRight, 
  SortAsc, 
  Star,
  Clock,
  ShoppingCart,
  Eye,
  X,
  Package,
  TestTube,
  MapPin
} from 'lucide-react';
import { authClient, useSession } from '@/lib/auth-client';
import { toast } from 'sonner';

interface Product {
  id: string;
  name: string;
  type: 'test' | 'package';
  description: string;
  price: number;
  originalPrice: number;
  discount: number;
  homeCollection: boolean;
  reportDelivery: string;
  icon: string;
  testsIncluded: number;
  popular?: boolean;
}

export default function ProductsPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  
  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [homeCollectionFilter, setHomeCollectionFilter] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [sortBy, setSortBy] = useState('popularity');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [addingToCart, setAddingToCart] = useState<string | null>(null);

  // Mock products data
  const mockProducts: Product[] = [
    {
      id: '1',
      name: 'Complete Blood Count (CBC)',
      type: 'test',
      description: 'A comprehensive blood test that evaluates overall health and detects various disorders',
      price: 350,
      originalPrice: 500,
      discount: 30,
      homeCollection: true,
      reportDelivery: '6 hours',
      icon: '/images/test-icon.png',
      testsIncluded: 1,
      popular: true
    },
    {
      id: '2',
      name: 'Xpert Health Comprehensive',
      type: 'package',
      description: 'Complete health checkup package for comprehensive wellness assessment',
      price: 2499,
      originalPrice: 3999,
      discount: 38,
      homeCollection: true,
      reportDelivery: '24 hours',
      icon: '/images/package-icon.png',
      testsIncluded: 85,
      popular: true
    },
    {
      id: '3',
      name: 'Lipid Profile',
      type: 'test',
      description: 'Measures cholesterol levels and assesses cardiovascular risk',
      price: 450,
      originalPrice: 650,
      discount: 31,
      homeCollection: true,
      reportDelivery: '12 hours',
      icon: '/images/test-icon.png',
      testsIncluded: 1
    },
    {
      id: '4',
      name: 'Diabetes Screening Package',
      type: 'package',
      description: 'Comprehensive diabetes monitoring and risk assessment package',
      price: 1299,
      originalPrice: 1899,
      discount: 32,
      homeCollection: true,
      reportDelivery: '24 hours',
      icon: '/images/package-icon.png',
      testsIncluded: 12
    },
    {
      id: '5',
      name: 'Thyroid Function Test (TSH)',
      type: 'test',
      description: 'Evaluates thyroid gland function and hormone levels',
      price: 299,
      originalPrice: 450,
      discount: 34,
      homeCollection: false,
      reportDelivery: '8 hours',
      icon: '/images/test-icon.png',
      testsIncluded: 1
    },
    {
      id: '6',
      name: 'Heart Health Package',
      type: 'package',
      description: 'Complete cardiovascular health assessment with multiple tests',
      price: 1899,
      originalPrice: 2999,
      discount: 37,
      homeCollection: true,
      reportDelivery: '24 hours',
      icon: '/images/package-icon.png',
      testsIncluded: 25
    }
  ];

  // Fetch products on component mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
          setProducts(mockProducts);
          setFilteredProducts(mockProducts);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Debounced search
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      applyFilters();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, typeFilter, homeCollectionFilter, priceRange, sortBy]);

  // Apply filters and sorting
  const applyFilters = useCallback(() => {
    let filtered = products.filter(product => {
      // Search filter
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type filter
      const matchesType = typeFilter === 'all' || product.type === typeFilter;
      
      // Home collection filter
      const matchesHomeCollection = homeCollectionFilter === 'all' || 
                                   (homeCollectionFilter === 'yes' && product.homeCollection) ||
                                   (homeCollectionFilter === 'no' && !product.homeCollection);
      
      // Price range filter
      const matchesPriceRange = (!priceRange.min || product.price >= parseInt(priceRange.min)) &&
                               (!priceRange.max || product.price <= parseInt(priceRange.max));
      
      return matchesSearch && matchesType && matchesHomeCollection && matchesPriceRange;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-low':
          return a.price - b.price;
        case 'price-high':
          return b.price - a.price;
        case 'name':
          return a.name.localeCompare(b.name);
        case 'popularity':
        default:
          return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      }
    });

    setFilteredProducts(filtered);
    setCurrentPage(1);
  }, [products, searchQuery, typeFilter, homeCollectionFilter, priceRange, sortBy]);

  // Add to cart functionality
  const handleAddToCart = async (productId: string) => {
    if (!session?.user) {
      toast.error('Please login to add items to cart');
      router.push('/login');
      return;
    }

    try {
      setAddingToCart(productId);
      const token = localStorage.getItem('bearer_token');
      
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId, quantity: 1 })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      toast.success('Product added to cart successfully!');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add product to cart');
    } finally {
      setAddingToCart(null);
    }
  };

  // View product details
  const handleViewDetails = (productId: string) => {
    router.push(`/products/${productId}`);
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery('');
    setTypeFilter('all');
    setHomeCollectionFilter('all');
    setPriceRange({ min: '', max: '' });
    setSortBy('popularity');
  };

  // Pagination
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProducts = filteredProducts.slice(startIndex, endIndex);

  // Loading skeleton
  const ProductSkeleton = () => (
    <Card className="h-full">
      <CardContent className="p-4">
        <Skeleton className="h-16 w-16 rounded-lg mb-4" />
        <Skeleton className="h-4 w-3/4 mb-2" />
        <Skeleton className="h-3 w-1/2 mb-4" />
        <div className="flex justify-between items-center mb-4">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </CardContent>
    </Card>
  );

  // Product card component
  const ProductCard = ({ product }: { product: Product }) => (
    <Card className={`h-full transition-all duration-300 hover:shadow-lg hover:scale-105 ${viewMode === 'list' ? 'flex flex-row' : ''}`}>
      <CardContent className={`p-4 ${viewMode === 'list' ? 'flex items-center gap-4 w-full' : ''}`}>
        <div className={`${viewMode === 'list' ? 'flex-shrink-0' : 'mb-4'}`}>
          <div className="w-16 h-16 bg-blue-50 rounded-lg flex items-center justify-center">
            {product.type === 'package' ? (
              <Package className="w-8 h-8 text-blue-600" />
            ) : (
              <TestTube className="w-8 h-8 text-blue-600" />
            )}
          </div>
        </div>
        
        <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-semibold text-gray-900 line-clamp-2">{product.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={product.type === 'package' ? 'default' : 'secondary'} className="text-xs">
                  {product.type === 'package' ? 'Package' : 'Test'}
                </Badge>
                {product.popular && (
                  <Badge variant="outline" className="text-xs text-orange-600 border-orange-200">
                    <Star className="w-3 h-3 mr-1" />
                    Popular
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{product.description}</p>
          
          <div className="flex items-center gap-4 mb-3 text-sm text-gray-500">
            {product.homeCollection && (
              <div className="flex items-center gap-1">
                <Home className="w-4 h-4" />
                <span>Home Collection</span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{product.reportDelivery}</span>
            </div>
            {product.type === 'package' && (
              <div className="flex items-center gap-1">
                <TestTube className="w-4 h-4" />
                <span>{product.testsIncluded} tests</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold text-red-600">₹{product.price}</span>
              <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
              <Badge variant="destructive" className="text-xs">
                {product.discount}% OFF
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => handleViewDetails(product.id)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View Details
            </Button>
            <Button
              size="sm"
              className="flex-1"
              onClick={() => handleAddToCart(product.id)}
              disabled={addingToCart === product.id}
            >
              <ShoppingCart className="w-4 h-4 mr-1" />
              {addingToCart === product.id ? 'Adding...' : 'Add to Cart'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
            <Home className="w-4 h-4" />
            <span>Home</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">Tests & Health Packages</span>
          </div>
          
          {/* Page Title */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Tests & Health Packages</h1>
              <p className="text-gray-600">
                {loading ? 'Loading...' : `${filteredProducts.length} products available`}
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="relative lg:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Search tests and packages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 flex-1">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="test">Tests</SelectItem>
                  <SelectItem value="package">Packages</SelectItem>
                </SelectContent>
              </Select>

              <Select value={homeCollectionFilter} onValueChange={setHomeCollectionFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Home Collection" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Products</SelectItem>
                  <SelectItem value="yes">Home Collection Available</SelectItem>
                  <SelectItem value="no">Visit Lab Required</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Input
                  placeholder="Min Price"
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                  className="w-24"
                />
                <span className="text-gray-500">-</span>
                <Input
                  placeholder="Max Price"
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                  className="w-24"
                />
              </div>

              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="w-4 h-4 mr-1" />
                Clear Filters
              </Button>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-4">
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SortAsc className="w-4 h-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Popular</SelectItem>
                  <SelectItem value="price-low">Price: Low to High</SelectItem>
                  <SelectItem value="price-high">Price: High to Low</SelectItem>
                  <SelectItem value="name">Name: A-Z</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center border rounded-lg">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="rounded-r-none"
                >
                  <Grid3X3 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="rounded-l-none"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
            {Array.from({ length: 8 }, (_, i) => (
              <ProductSkeleton key={i} />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600 mb-4">
              Try adjusting your search criteria or clear filters to see more results.
            </p>
            <Button onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <>
            <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' : 'grid-cols-1'}`}>
              {currentProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? 'default' : 'outline'}
                    onClick={() => setCurrentPage(page)}
                    className="w-10"
                  >
                    {page}
                  </Button>
                ))}
                
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}