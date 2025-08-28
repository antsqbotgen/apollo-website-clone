"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  TestTube, 
  Activity, 
  Settings, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Users, 
  BarChart3,
  Microscope,
  Stethoscope,
  Timer,
  Star,
  Bell,
  Calendar,
  Filter,
  Search,
  Home
} from "lucide-react";

interface TestResult {
  id: string;
  patientName: string;
  testType: string;
  status: "pending" | "in_progress" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  assignedDate: string;
  completedDate?: string;
}

interface Equipment {
  id: string;
  name: string;
  status: "operational" | "maintenance" | "offline";
  lastMaintenance: string;
  nextMaintenance: string;
}

interface DailyStats {
  testsCompleted: number;
  testsPending: number;
  avgProcessingTime: string;
  qualityScore: number;
}

interface Activity {
  id: string;
  type: "test_completed" | "test_started" | "equipment_maintenance" | "quality_alert";
  description: string;
  timestamp: string;
}

const mockTestResults: TestResult[] = [
  {
    id: "T001",
    patientName: "John Smith",
    testType: "Complete Blood Count (CBC)",
    status: "pending",
    priority: "high",
    assignedDate: "2024-01-15T09:00:00Z"
  },
  {
    id: "T002",
    patientName: "Sarah Johnson",
    testType: "Lipid Profile",
    status: "in_progress",
    priority: "medium",
    assignedDate: "2024-01-15T08:30:00Z"
  },
  {
    id: "T003",
    patientName: "Mike Wilson",
    testType: "HbA1c",
    status: "completed",
    priority: "low",
    assignedDate: "2024-01-14T14:00:00Z",
    completedDate: "2024-01-15T10:30:00Z"
  },
  {
    id: "T004",
    patientName: "Emily Davis",
    testType: "Thyroid Function Test",
    status: "pending",
    priority: "urgent",
    assignedDate: "2024-01-15T10:00:00Z"
  },
  {
    id: "T005",
    patientName: "Robert Brown",
    testType: "Liver Function Test",
    status: "in_progress",
    priority: "medium",
    assignedDate: "2024-01-15T07:45:00Z"
  }
];

const mockEquipment: Equipment[] = [
  {
    id: "E001",
    name: "Hematology Analyzer XN-1000",
    status: "operational",
    lastMaintenance: "2024-01-10",
    nextMaintenance: "2024-02-10"
  },
  {
    id: "E002",
    name: "Chemistry Analyzer AU5800",
    status: "maintenance",
    lastMaintenance: "2024-01-14",
    nextMaintenance: "2024-02-14"
  },
  {
    id: "E003",
    name: "Microscope Olympus BX53",
    status: "operational",
    lastMaintenance: "2024-01-08",
    nextMaintenance: "2024-02-08"
  },
  {
    id: "E004",
    name: "Centrifuge Eppendorf 5810R",
    status: "offline",
    lastMaintenance: "2024-01-12",
    nextMaintenance: "2024-02-12"
  }
];

const mockDailyStats: DailyStats = {
  testsCompleted: 28,
  testsPending: 15,
  avgProcessingTime: "2h 45m",
  qualityScore: 98.5
};

const mockActivities: Activity[] = [
  {
    id: "A001",
    type: "test_completed",
    description: "HbA1c test completed for Mike Wilson",
    timestamp: "2024-01-15T10:30:00Z"
  },
  {
    id: "A002",
    type: "test_started",
    description: "Started Lipid Profile for Sarah Johnson",
    timestamp: "2024-01-15T09:15:00Z"
  },
  {
    id: "A003",
    type: "equipment_maintenance",
    description: "Chemistry Analyzer AU5800 scheduled for maintenance",
    timestamp: "2024-01-15T08:00:00Z"
  },
  {
    id: "A004",
    type: "quality_alert",
    description: "Quality control check passed for CBC batch #125",
    timestamp: "2024-01-15T07:30:00Z"
  }
];

export default function LabTechnicianDashboard() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending) {
      if (!session?.user) {
        router.push("/login");
        return;
      }
      
      if (session.user.role !== "lab_technician") {
        router.push("/unauthorized");
        return;
      }
      
      setIsLoading(false);
    }
  }, [session, isPending, router]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "in_progress":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case "completed":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Completed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="destructive">Urgent</Badge>;
      case "high":
        return <Badge variant="secondary" className="bg-red-100 text-red-800">High</Badge>;
      case "medium":
        return <Badge variant="secondary" className="bg-orange-100 text-orange-800">Medium</Badge>;
      case "low":
        return <Badge variant="secondary" className="bg-gray-100 text-gray-800">Low</Badge>;
      default:
        return <Badge variant="secondary">{priority}</Badge>;
    }
  };

  const getEquipmentStatusBadge = (status: string) => {
    switch (status) {
      case "operational":
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Operational</Badge>;
      case "maintenance":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Maintenance</Badge>;
      case "offline":
        return <Badge variant="destructive">Offline</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "test_completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "test_started":
        return <Activity className="h-4 w-4 text-blue-600" />;
      case "equipment_maintenance":
        return <Settings className="h-4 w-4 text-yellow-600" />;
      case "quality_alert":
        return <Star className="h-4 w-4 text-purple-600" />;
      default:
        return <Bell className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb Navigation */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center space-x-2 text-sm text-gray-600">
          <Home className="h-4 w-4" />
          <span>/</span>
          <span className="text-primary font-medium">Lab Technician Dashboard</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-primary to-accent text-white rounded-lg p-6">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {session?.user?.name || "Lab Technician"}!
          </h1>
          <p className="text-blue-100 text-lg">
            Ready to process tests and maintain quality standards at Apollo Diagnostics
          </p>
        </div>

        {/* Quick Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <TestTube className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Process Tests</h3>
              <p className="text-sm text-gray-600">Start processing assigned tests</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/20 transition-colors">
                <Clock className="h-6 w-6 text-accent" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">View Queue</h3>
              <p className="text-sm text-gray-600">Check pending test queue</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <Settings className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Equipment Status</h3>
              <p className="text-sm text-gray-600">Monitor equipment health</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Generate Reports</h3>
              <p className="text-sm text-gray-600">Create test result reports</p>
            </CardContent>
          </Card>
        </div>

        {/* Daily Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Tests Completed Today</p>
                  <p className="text-3xl font-bold text-green-600">{mockDailyStats.testsCompleted}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Tests Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{mockDailyStats.testsPending}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Avg Processing Time</p>
                  <p className="text-3xl font-bold text-blue-600">{mockDailyStats.avgProcessingTime}</p>
                </div>
                <Timer className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Quality Score</p>
                  <p className="text-3xl font-bold text-purple-600">{mockDailyStats.qualityScore}%</p>
                </div>
                <Star className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Test Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5 text-primary" />
                  Recent Test Results
                </CardTitle>
                <Button variant="outline" size="sm">
                  View All
                </Button>
              </div>
              <CardDescription>Latest test assignments and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTestResults.slice(0, 5).map((test) => (
                    <TableRow key={test.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium">{test.id}</TableCell>
                      <TableCell>{test.patientName}</TableCell>
                      <TableCell className="text-sm">{test.testType}</TableCell>
                      <TableCell>{getStatusBadge(test.status)}</TableCell>
                      <TableCell>{getPriorityBadge(test.priority)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Equipment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Microscope className="h-5 w-5 text-accent" />
                Equipment Status
              </CardTitle>
              <CardDescription>Real-time monitoring of laboratory equipment</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {mockEquipment.map((equipment) => (
                <div
                  key={equipment.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{equipment.name}</h4>
                    <p className="text-sm text-gray-600">
                      Next maintenance: {new Date(equipment.nextMaintenance).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {getEquipmentStatusBadge(equipment.status)}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Test Queue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                My Test Queue
              </CardTitle>
              <CardDescription>Tests assigned to you for processing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockTestResults
                  .filter(test => test.status === "pending" || test.status === "in_progress")
                  .map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium text-gray-900">{test.testType}</h4>
                          {getPriorityBadge(test.priority)}
                        </div>
                        <p className="text-sm text-gray-600">Patient: {test.patientName}</p>
                        <p className="text-xs text-gray-500">
                          Assigned: {formatDate(test.assignedDate)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(test.status)}
                        <Button size="sm" variant="outline">
                          {test.status === "pending" ? "Start" : "Continue"}
                        </Button>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity Feed */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-orange-600" />
                Recent Activity
              </CardTitle>
              <CardDescription>Latest updates and notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{activity.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quality Control Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              Quality Control Alerts
            </CardTitle>
            <CardDescription>Important quality control notifications and alerts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Quality Check Passed:</strong> CBC batch #125 has passed all quality control parameters. Ready for reporting.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Calibration Due:</strong> Hematology Analyzer XN-1000 requires calibration check within the next 24 hours.
                </AlertDescription>
              </Alert>
              
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Maintenance Complete:</strong> Chemistry Analyzer AU5800 maintenance has been completed and is ready for use.
                </AlertDescription>
              </Alert>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}