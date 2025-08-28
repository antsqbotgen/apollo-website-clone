"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  MapPin,
  Clock,
  User,
  Phone,
  Route,
  Activity,
  Package,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Thermometer,
  Battery,
  Truck,
  Star,
  PlayCircle,
  RefreshCw,
  PhoneCall,
  Calendar,
  TestTube,
  Home,
  FileText,
  Timer,
  Users,
  TrendingUp,
  Heart,
  Award,
  Zap,
} from "lucide-react";

interface Collection {
  id: string;
  patientName: string;
  address: string;
  timeSlot: string;
  testTypes: string[];
  status: "scheduled" | "in-progress" | "completed" | "cancelled";
  priority: "routine" | "urgent" | "stat";
  contactNumber: string;
  instructions?: string;
}

interface EquipmentItem {
  name: string;
  current: number;
  minimum: number;
  unit: string;
}

interface Activity {
  id: string;
  type: "collection" | "status" | "route" | "equipment";
  message: string;
  timestamp: string;
  location?: string;
}

const mockCollections: Collection[] = [
  {
    id: "COL-001",
    patientName: "Sarah Johnson",
    address: "123 Main Street, Sector 15, Delhi",
    timeSlot: "09:00 - 10:00 AM",
    testTypes: ["Complete Blood Count", "Lipid Profile"],
    status: "scheduled",
    priority: "routine",
    contactNumber: "+91 9876543210",
    instructions: "Second floor, Ring the bell twice"
  },
  {
    id: "COL-002", 
    patientName: "Raj Patel",
    address: "456 Park Avenue, Gurgaon",
    timeSlot: "10:30 - 11:30 AM",
    testTypes: ["HbA1c", "Thyroid Function Test"],
    status: "in-progress",
    priority: "urgent",
    contactNumber: "+91 9876543211"
  },
  {
    id: "COL-003",
    patientName: "Maria Garcia",
    address: "789 Garden Road, Noida",
    timeSlot: "12:00 - 01:00 PM", 
    testTypes: ["Liver Function Test"],
    status: "scheduled",
    priority: "stat",
    contactNumber: "+91 9876543212"
  },
  {
    id: "COL-004",
    patientName: "David Chen",
    address: "321 Tech Hub, Bangalore",
    timeSlot: "02:30 - 03:30 PM",
    testTypes: ["Comprehensive Health Checkup"],
    status: "completed",
    priority: "routine",
    contactNumber: "+91 9876543213"
  }
];

const mockEquipment: EquipmentItem[] = [
  { name: "Blood Collection Tubes", current: 45, minimum: 20, unit: "pieces" },
  { name: "Sample Labels", current: 150, minimum: 50, unit: "pieces" },
  { name: "Transport Bags", current: 8, minimum: 5, unit: "bags" },
  { name: "Thermometer", current: 1, minimum: 1, unit: "device" },
  { name: "Alcohol Swabs", current: 25, minimum: 30, unit: "pieces" }
];

const mockActivities: Activity[] = [
  {
    id: "1",
    type: "collection",
    message: "Completed collection for David Chen",
    timestamp: "2 minutes ago",
    location: "Tech Hub, Bangalore"
  },
  {
    id: "2", 
    type: "status",
    message: "Started collection for Raj Patel",
    timestamp: "15 minutes ago",
    location: "Park Avenue, Gurgaon"
  },
  {
    id: "3",
    type: "route",
    message: "Route optimized for afternoon collections",
    timestamp: "1 hour ago"
  },
  {
    id: "4",
    type: "equipment", 
    message: "Low stock alert: Alcohol Swabs",
    timestamp: "2 hours ago"
  }
];

export default function CollectionDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    } else if (!isPending && session?.user && session.user.role !== "sample_collection_technician") {
      router.push("/unauthorized");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen bg-muted/20 p-4">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-8 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Skeleton className="h-96" />
            </div>
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user || session.user.role !== "sample_collection_technician") {
    return null;
  }

  const handleQuickAction = (action: string) => {
    toast.info(`${action} feature coming soon!`);
  };

  const handleStartCollection = (collectionId: string) => {
    toast.success(`Starting collection for ${collectionId}`);
  };

  const handleCompleteCollection = (collectionId: string) => {
    toast.success(`Collection ${collectionId} completed successfully!`);
  };

  const getStatusBadgeColor = (status: Collection["status"]) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "in-progress": 
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityBadgeColor = (priority: Collection["priority"]) => {
    switch (priority) {
      case "routine":
        return "bg-gray-100 text-gray-800";
      case "urgent":
        return "bg-orange-100 text-orange-800";
      case "stat":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const todaysCollections = mockCollections.filter(c => 
    c.status === "scheduled" || c.status === "in-progress"
  );
  const completedToday = mockCollections.filter(c => c.status === "completed").length;
  const scheduledToday = mockCollections.filter(c => c.status === "scheduled").length;

  return (
    <div className="min-h-screen bg-muted/20">
      <div className="max-w-7xl mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col space-y-2">
          <div className="flex items-center text-sm text-muted-foreground">
            <Home className="h-4 w-4 mr-1" />
            <span>Collection Dashboard</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">
                Good Morning, {session.user.name?.split(" ")[0]}! 👋
              </h1>
              <p className="text-muted-foreground mt-1">
                Ready to collect samples for today? You have {todaysCollections.length} collections scheduled.
              </p>
            </div>
            <div className="flex items-center text-sm text-muted-foreground mt-2 sm:mt-0">
              <Clock className="h-4 w-4 mr-2" />
              {currentTime.toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-600 text-sm font-medium">Completed Today</p>
                  <p className="text-3xl font-bold text-blue-800">{completedToday}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-600 text-sm font-medium">Scheduled Today</p>
                  <p className="text-3xl font-bold text-orange-800">{scheduledToday}</p>
                </div>
                <Calendar className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-600 text-sm font-medium">Distance Traveled</p>
                  <p className="text-3xl font-bold text-green-800">42.3 km</p>
                </div>
                <Route className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-600 text-sm font-medium">Satisfaction</p>
                  <p className="text-3xl font-bold text-purple-800">4.8/5</p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-blue-500" 
                onClick={() => handleQuickAction("View Route")}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <Navigation className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">View Today's Route</h3>
                  <p className="text-sm text-muted-foreground">Optimized collection path</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-green-500"
                onClick={() => handleQuickAction("Start Collection")}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <PlayCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Start Collection</h3>
                  <p className="text-sm text-muted-foreground">Begin sample collection</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-orange-500"
                onClick={() => handleQuickAction("Update Status")}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-orange-100 p-3 rounded-lg">
                  <RefreshCw className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Update Status</h3>
                  <p className="text-sm text-muted-foreground">Collection progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-red-500"
                onClick={() => handleQuickAction("Emergency Support")}>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-red-100 p-3 rounded-lg">
                  <PhoneCall className="h-6 w-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Emergency Support</h3>
                  <p className="text-sm text-muted-foreground">24/7 assistance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Today's Collections */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TestTube className="h-5 w-5 text-blue-600" />
                  <span>Today's Collection Schedule</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockCollections.map((collection) => (
                    <div key={collection.id} 
                         className="border rounded-lg p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-foreground">{collection.patientName}</h4>
                            <Badge className={getStatusBadgeColor(collection.status)}>
                              {collection.status.replace("-", " ").toUpperCase()}
                            </Badge>
                            <Badge className={getPriorityBadgeColor(collection.priority)}>
                              {collection.priority.toUpperCase()}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-muted-foreground">
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{collection.address}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="h-4 w-4" />
                              <span>{collection.timeSlot}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{collection.contactNumber}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4" />
                              <span>{collection.testTypes.join(", ")}</span>
                            </div>
                          </div>
                          
                          {collection.instructions && (
                            <div className="mt-2 text-sm text-muted-foreground bg-blue-50 p-2 rounded border-l-4 border-l-blue-400">
                              <strong>Instructions:</strong> {collection.instructions}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex flex-col space-y-2 sm:ml-4">
                          {collection.status === "scheduled" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleStartCollection(collection.id)}
                              className="bg-blue-600 hover:bg-blue-700"
                            >
                              <PlayCircle className="h-4 w-4 mr-2" />
                              Start
                            </Button>
                          )}
                          {collection.status === "in-progress" && (
                            <Button 
                              size="sm" 
                              onClick={() => handleCompleteCollection(collection.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              <CheckCircle2 className="h-4 w-4 mr-2" />
                              Complete
                            </Button>
                          )}
                          <Button variant="outline" size="sm">
                            <MapPin className="h-4 w-4 mr-2" />
                            Navigate
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Route Optimization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Route className="h-5 w-5 text-green-600" />
                  <span>Route Optimization</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-green-50 to-blue-50 p-4 rounded-lg mb-4">
                  <div className="text-center text-muted-foreground">
                    <Navigation className="h-12 w-12 mx-auto mb-2 text-green-600" />
                    <p className="text-sm">Optimized Route Map</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total Distance:</span>
                    <span className="font-medium">45.2 km</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Estimated Time:</span>
                    <span className="font-medium">6h 30m</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stops:</span>
                    <span className="font-medium">{todaysCollections.length} locations</span>
                  </div>
                </div>
                <Button className="w-full mt-4" onClick={() => handleQuickAction("View Full Route")}>
                  <Navigation className="h-4 w-4 mr-2" />
                  View Full Route
                </Button>
              </CardContent>
            </Card>

            {/* Equipment Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-5 w-5 text-purple-600" />
                  <span>Equipment & Supplies</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {mockEquipment.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium">{item.name}</p>
                        <div className="flex items-center space-x-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                item.current <= item.minimum ? "bg-red-500" : "bg-green-500"
                              }`}
                              style={{ width: `${Math.min((item.current / (item.minimum * 2)) * 100, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {item.current} {item.unit}
                          </span>
                        </div>
                      </div>
                      {item.current <= item.minimum && (
                        <AlertTriangle className="h-4 w-4 text-red-500 ml-2" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5 text-orange-600" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      <div className={`p-2 rounded-full ${
                        activity.type === "collection" ? "bg-green-100" :
                        activity.type === "status" ? "bg-blue-100" :
                        activity.type === "route" ? "bg-purple-100" : "bg-red-100"
                      }`}>
                        {activity.type === "collection" && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                        {activity.type === "status" && <RefreshCw className="h-4 w-4 text-blue-600" />}
                        {activity.type === "route" && <Route className="h-4 w-4 text-purple-600" />}
                        {activity.type === "equipment" && <AlertTriangle className="h-4 w-4 text-red-600" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.message}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                        {activity.location && (
                          <p className="text-xs text-muted-foreground flex items-center mt-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            {activity.location}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}