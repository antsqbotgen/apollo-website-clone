"use client";

import React, { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import {
  Users,
  TestTube,
  DollarSign,
  Activity,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Database,
  Server,
  Shield,
  UserPlus,
  FileText,
  Settings,
  Bell,
  HardDrive,
  BarChart3,
  Zap,
  Heart,
  Building,
  Truck,
  Plus,
  Eye,
  Search,
  Filter,
  ArrowUp,
  ArrowDown,
  ChevronRight,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Mock data for the admin dashboard
const mockDashboardData = {
  users: {
    total: 15847,
    patients: 14523,
    labTechs: 156,
    collectionTechs: 89,
    admins: 12,
    newToday: 23,
    activeUsers: 12456,
  },
  tests: {
    dailyVolume: 892,
    weeklyVolume: 5847,
    monthlyVolume: 23456,
    pendingResults: 145,
    completedToday: 734,
    qualityScore: 98.5,
  },
  revenue: {
    today: 45678,
    thisWeek: 287543,
    thisMonth: 1234567,
    growth: 12.5,
    packagesRevenue: 567890,
    individualTestsRevenue: 666677,
  },
  system: {
    serverHealth: 99.2,
    dbPerformance: 95.8,
    apiResponseTime: 124,
    errorRate: 0.3,
    uptime: 99.95,
  },
  labs: {
    total: 142,
    active: 138,
    maintenance: 4,
    equipmentStatus: 96.2,
    avgProcessingTime: 4.2,
  },
  collection: {
    scheduledToday: 234,
    completedToday: 198,
    efficiency: 84.6,
    activeRoutes: 45,
    techniciansOnDuty: 67,
  },
};

const mockRecentActivities = [
  { id: 1, type: "user", message: "New patient registration: Dr. Sarah Smith", time: "2 mins ago", status: "info" },
  { id: 2, type: "test", message: "Lab results ready for Patient ID: 12345", time: "5 mins ago", status: "success" },
  { id: 3, type: "system", message: "Database backup completed successfully", time: "15 mins ago", status: "success" },
  { id: 4, type: "alert", message: "Equipment maintenance required at Lab-A12", time: "32 mins ago", status: "warning" },
  { id: 5, type: "payment", message: "Payment received: ₹2,450 (Order #78901)", time: "1 hour ago", status: "success" },
  { id: 6, type: "user", message: "Lab technician clockout: John Doe", time: "1.5 hours ago", status: "info" },
];

const mockAlerts = [
  { id: 1, type: "critical", message: "Server CPU usage at 89%", priority: "high" },
  { id: 2, type: "warning", message: "Low inventory: Blood collection tubes", priority: "medium" },
  { id: 3, type: "info", message: "Scheduled maintenance tonight at 2 AM", priority: "low" },
];

export default function AdminDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [selectedTimeframe, setSelectedTimeframe] = useState("today");

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Authentication and authorization check
  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    } else if (!isPending && session?.user && session.user.role !== "admin") {
      router.push("/unauthorized");
    }
  }, [session, isPending, router]);

  // Loading skeleton while checking authentication
  if (isPending) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-96" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Don't render if not authenticated or not admin
  if (!session?.user || session.user.role !== "admin") {
    return null;
  }

  const handleQuickAction = (action: string) => {
    toast.success(`${action} action initiated`);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Welcome back, {session.user.name}!
              </h1>
              <p className="text-gray-600 mt-1">{formatDateTime(currentDateTime)}</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="px-3 py-1">
                <Shield className="h-4 w-4 mr-1" />
                Admin Dashboard
              </Badge>
              <Badge variant="outline" className="px-3 py-1">
                System Active
              </Badge>
            </div>
          </div>
        </div>

        {/* Key Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDashboardData.users.total.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +{mockDashboardData.users.newToday} new today
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>Patients</span>
                  <span>{mockDashboardData.users.patients.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Lab Techs</span>
                  <span>{mockDashboardData.users.labTechs}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>Collection Techs</span>
                  <span>{mockDashboardData.users.collectionTechs}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Daily Test Volume */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Tests</CardTitle>
              <TestTube className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDashboardData.tests.dailyVolume}</div>
              <p className="text-xs text-muted-foreground">
                {mockDashboardData.tests.completedToday} completed
              </p>
              <div className="mt-2">
                <Progress 
                  value={(mockDashboardData.tests.completedToday / mockDashboardData.tests.dailyVolume) * 100} 
                  className="h-2"
                />
              </div>
              <div className="mt-2 flex justify-between text-xs">
                <span>Pending: {mockDashboardData.tests.pendingResults}</span>
                <span>QS: {mockDashboardData.tests.qualityScore}%</span>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Today */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(mockDashboardData.revenue.today)}</div>
              <p className="text-xs text-green-600 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                +{mockDashboardData.revenue.growth}% vs yesterday
              </p>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>This Week</span>
                  <span>{formatCurrency(mockDashboardData.revenue.thisWeek)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>This Month</span>
                  <span>{formatCurrency(mockDashboardData.revenue.thisMonth)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* System Health */}
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">System Health</CardTitle>
              <Activity className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDashboardData.system.serverHealth}%</div>
              <p className="text-xs text-green-600">
                Uptime: {mockDashboardData.system.uptime}%
              </p>
              <div className="mt-2">
                <Progress value={mockDashboardData.system.serverHealth} className="h-2" />
              </div>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs">
                  <span>DB Performance</span>
                  <span>{mockDashboardData.system.dbPerformance}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>API Response</span>
                  <span>{mockDashboardData.system.apiResponseTime}ms</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Operations Dashboard */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Operations Overview
              </CardTitle>
              <CardDescription>Real-time lab and collection operations</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Lab Performance */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Lab Performance</h4>
                  <Badge variant="outline">{mockDashboardData.labs.active}/{mockDashboardData.labs.total} Active</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Equipment Status</span>
                      <span className="font-medium">{mockDashboardData.labs.equipmentStatus}%</span>
                    </div>
                    <Progress value={mockDashboardData.labs.equipmentStatus} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Avg Processing Time</span>
                      <span className="font-medium">{mockDashboardData.labs.avgProcessingTime}h</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Collection Operations */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Collection Operations</h4>
                  <Badge variant="outline">{mockDashboardData.collection.activeRoutes} Active Routes</Badge>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Collection Efficiency</span>
                      <span className="font-medium">{mockDashboardData.collection.efficiency}%</span>
                    </div>
                    <Progress value={mockDashboardData.collection.efficiency} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Technicians On Duty</span>
                      <span className="font-medium">{mockDashboardData.collection.techniciansOnDuty}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {mockDashboardData.collection.completedToday}/{mockDashboardData.collection.scheduledToday} collections today
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Metrics */}
              <div className="space-y-3">
                <h4 className="font-medium">Financial Breakdown</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-blue-700">Health Packages</span>
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="text-lg font-bold text-blue-900">
                      {formatCurrency(mockDashboardData.revenue.packagesRevenue)}
                    </div>
                    <div className="text-xs text-blue-600">67% of total revenue</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-700">Individual Tests</span>
                      <TestTube className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="text-lg font-bold text-green-900">
                      {formatCurrency(mockDashboardData.revenue.individualTestsRevenue)}
                    </div>
                    <div className="text-xs text-green-600">33% of total revenue</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions & System Monitoring */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction("Add New User")}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Add New User
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction("Generate Report")}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction("System Maintenance")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  System Maintenance
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction("Send Notification")}
                >
                  <Bell className="h-4 w-4 mr-2" />
                  Broadcast Alert
                </Button>
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => handleQuickAction("Backup Database")}
                >
                  <HardDrive className="h-4 w-4 mr-2" />
                  Backup Database
                </Button>
              </CardContent>
            </Card>

            {/* System Alerts */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5" />
                  System Alerts
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {mockAlerts.map((alert) => (
                  <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border">
                    <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                      alert.priority === "high" ? "bg-red-500" :
                      alert.priority === "medium" ? "bg-yellow-500" : "bg-blue-500"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{alert.message}</p>
                      <Badge 
                        variant="outline" 
                        className={`mt-1 text-xs ${
                          alert.priority === "high" ? "border-red-200 text-red-700" :
                          alert.priority === "medium" ? "border-yellow-200 text-yellow-700" : 
                          "border-blue-200 text-blue-700"
                        }`}
                      >
                        {alert.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activities Feed */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Recent Activities
                </CardTitle>
                <CardDescription>Latest system events and user activities</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  View All
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockRecentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                    activity.status === "success" ? "bg-green-500" :
                    activity.status === "warning" ? "bg-yellow-500" :
                    activity.status === "info" ? "bg-blue-500" : "bg-gray-500"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{activity.message}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Additional Metrics Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
              <Server className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDashboardData.users.activeUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {Math.round((mockDashboardData.users.activeUsers / mockDashboardData.users.total) * 100)}% of total users
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Tests</CardTitle>
              <BarChart3 className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDashboardData.tests.weeklyVolume.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                Avg: {Math.round(mockDashboardData.tests.weeklyVolume / 7)} per day
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Collection Routes</CardTitle>
              <Truck className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDashboardData.collection.activeRoutes}</div>
              <p className="text-xs text-muted-foreground">
                {mockDashboardData.collection.techniciansOnDuty} technicians active
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockDashboardData.system.errorRate}%</div>
              <p className="text-xs text-green-600">
                <ArrowDown className="h-3 w-3 inline mr-1" />
                Improved from last week
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}