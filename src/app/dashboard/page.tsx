"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { authClient, useSession } from '@/lib/auth-client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  User, 
  TestTube, 
  Calendar, 
  FileText, 
  Package, 
  Phone, 
  Clock, 
  Heart, 
  Activity, 
  TrendingUp,
  MapPin,
  Shield,
  CheckCircle,
  AlertCircle,
  Home
} from 'lucide-react';

interface TestResult {
  id: string;
  testName: string;
  date: string;
  status: 'completed' | 'pending' | 'in-progress';
  result?: string;
}

interface Appointment {
  id: string;
  type: string;
  date: string;
  time: string;
  location: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

interface HealthPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice: number;
  tests: number;
  popular?: boolean;
}

export default function PatientDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    recentTests: [] as TestResult[],
    upcomingAppointments: [] as Appointment[],
    recommendedPackages: [] as HealthPackage[]
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/login');
      return;
    }

    if (session?.user) {
      // Check if user has patient role
      if (session.user.role && session.user.role !== 'patient') {
        router.push('/unauthorized');
        return;
      }
      
      // Simulate loading dashboard data
      setTimeout(() => {
        setDashboardData({
          recentTests: [
            {
              id: '1',
              testName: 'Complete Blood Count (CBC)',
              date: '2024-01-15',
              status: 'completed',
              result: 'Normal'
            },
            {
              id: '2',
              testName: 'Lipid Profile',
              date: '2024-01-10',
              status: 'completed',
              result: 'Slightly Elevated'
            },
            {
              id: '3',
              testName: 'HbA1c Test',
              date: '2024-01-08',
              status: 'in-progress'
            }
          ],
          upcomingAppointments: [
            {
              id: '1',
              type: 'Home Collection',
              date: '2024-01-25',
              time: '10:00 AM',
              location: 'Home Collection Service',
              status: 'scheduled'
            },
            {
              id: '2',
              type: 'Lab Visit',
              date: '2024-02-01',
              time: '2:00 PM',
              location: 'Apollo Diagnostics - Banjara Hills',
              status: 'scheduled'
            }
          ],
          recommendedPackages: [
            {
              id: '1',
              name: 'Comprehensive Health Checkup',
              description: 'Complete body checkup with 85+ tests',
              price: 2499,
              originalPrice: 4999,
              tests: 85,
              popular: true
            },
            {
              id: '2',
              name: 'Diabetes Prevention Package',
              description: 'Early detection and monitoring',
              price: 1299,
              originalPrice: 2199,
              tests: 12
            },
            {
              id: '3',
              name: 'Heart Health Package',
              description: 'Cardiovascular risk assessment',
              price: 1799,
              originalPrice: 2999,
              tests: 25
            }
          ]
        });
        setIsLoading(false);
      }, 1000);
    }
  }, [session, isPending, router]);

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb Skeleton */}
          <div className="flex items-center space-x-2 mb-6">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-20" />
          </div>

          {/* Header Skeleton */}
          <div className="mb-8">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Cards Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {Array.from({ length: 4 }).map((_, i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                  <Skeleton className="h-4 w-24 mb-2" />
                  <Skeleton className="h-6 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Content Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Array.from({ length: 2 }).map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Completed</Badge>;
      case 'in-progress':
        return <Badge className="bg-blue-100 text-blue-800"><Clock className="w-3 h-3 mr-1" />In Progress</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'scheduled':
        return <Badge className="bg-purple-100 text-purple-800"><Calendar className="w-3 h-3 mr-1" />Scheduled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6" aria-label="Breadcrumb">
          <Home className="w-4 h-4" />
          <span>/</span>
          <span className="font-medium text-gray-900">Dashboard</span>
        </nav>

        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {session.user.name}!
          </h1>
          <p className="text-gray-600">
            Stay on top of your health with Apollo Diagnostics comprehensive dashboard.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/book-test')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <TestTube className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Book Test</p>
                  <p className="text-lg font-semibold text-gray-900">Schedule Now</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/reports')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <FileText className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">View Reports</p>
                  <p className="text-lg font-semibold text-gray-900">3 Available</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/appointments')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Appointments</p>
                  <p className="text-lg font-semibold text-gray-900">2 Upcoming</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push('/support')}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <Phone className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Support</p>
                  <p className="text-lg font-semibold text-gray-900">Get Help</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Recent Test Results */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5 text-blue-600" />
                <span>Recent Test Results</span>
              </CardTitle>
              <CardDescription>Your latest diagnostic test results</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.recentTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{test.testName}</h4>
                      <p className="text-sm text-gray-600">Date: {new Date(test.date).toLocaleDateString()}</p>
                      {test.result && (
                        <p className="text-sm font-medium text-gray-800">Result: {test.result}</p>
                      )}
                    </div>
                    <div className="ml-4">
                      {getStatusBadge(test.status)}
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => router.push('/reports')}>
                  View All Results
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Appointments */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span>Upcoming Appointments</span>
              </CardTitle>
              <CardDescription>Your scheduled appointments and collections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.upcomingAppointments.map((appointment) => (
                  <div key={appointment.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{appointment.type}</h4>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(appointment.date).toLocaleDateString()} at {appointment.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{appointment.location}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full" onClick={() => router.push('/appointments')}>
                  Manage Appointments
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Health Package Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-teal-600" />
              <span>Recommended Health Packages</span>
            </CardTitle>
            <CardDescription>Personalized health checkup packages based on your profile</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {dashboardData.recommendedPackages.map((pkg) => (
                <div key={pkg.id} className="border rounded-lg p-6 hover:shadow-lg transition-shadow relative">
                  {pkg.popular && (
                    <Badge className="absolute -top-2 -right-2 bg-red-500 text-white">
                      Popular
                    </Badge>
                  )}
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Heart className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                      <p className="text-sm text-gray-600">{pkg.tests} tests included</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{pkg.description}</p>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl font-bold text-red-600">₹{pkg.price}</span>
                    <span className="text-sm text-gray-500 line-through">₹{pkg.originalPrice}</span>
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(((pkg.originalPrice - pkg.price) / pkg.originalPrice) * 100)}% OFF
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button className="flex-1" onClick={() => router.push(`/packages/${pkg.id}`)}>
                      View Details
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/book-test')}>
                      Book Now
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Health Insights & Contact Support */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Health Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Health Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Shield className="w-4 h-4" />
                <AlertDescription>
                  Your recent tests show good overall health markers. Keep up the healthy lifestyle!
                </AlertDescription>
              </Alert>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Blood Sugar Level</span>
                  <Badge className="bg-green-100 text-green-800">Normal</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <span className="text-sm font-medium">Cholesterol</span>
                  <Badge className="bg-yellow-100 text-yellow-800">Monitor</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium">Blood Pressure</span>
                  <Badge className="bg-green-100 text-green-800">Normal</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Phone className="w-5 h-5 text-blue-600" />
                <span>Need Help?</span>
              </CardTitle>
              <CardDescription>Get support from our healthcare team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Customer Support</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Available 24/7 for all your queries and assistance
                  </p>
                  <Button className="w-full" onClick={() => window.open('tel:+911234567890')}>
                    <Phone className="w-4 h-4 mr-2" />
                    Call Now
                  </Button>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Home Collection</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Schedule a convenient home sample collection
                  </p>
                  <Button variant="outline" className="w-full" onClick={() => router.push('/book-collection')}>
                    <MapPin className="w-4 h-4 mr-2" />
                    Book Collection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}