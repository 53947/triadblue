import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Download, TrendingUp, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface AnalyticsData {
  overview: {
    totalTasks: number;
    completedTasks: number;
    pendingTasks: number;
    inProgressTasks: number;
    completionRate: number;
    totalConversations: number;
    totalGithubCommits: number;
    totalAgentMessages: number;
  };
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  tasksByStatus: {
    pending: number;
    in_progress: number;
    completed: number;
    cancelled: number;
  };
  tasksByProject: Array<{
    projectId: string;
    projectName: string;
    projectColor: string;
    totalTasks: number;
    completedTasks: number;
    completionRate: number;
  }>;
  tasksBySource: {
    manual: number;
    conversation: number;
    github: number;
    api: number;
  };
  timeSeriesData: Array<{
    date: string;
    tasksCreated: number;
    tasksCompleted: number;
    conversations: number;
    githubCommits: number;
  }>;
}

const COLORS = {
  low: "hsl(var(--chart-1))",
  medium: "hsl(var(--chart-2))",
  high: "hsl(var(--chart-3))",
  urgent: "hsl(var(--chart-4))",
  pending: "hsl(var(--chart-2))",
  in_progress: "hsl(var(--chart-3))",
  completed: "hsl(var(--chart-1))",
  cancelled: "hsl(var(--muted))",
};

export default function Analytics() {
  const [dateRange, setDateRange] = useState<{ start?: string; end?: string }>({});
  const [tempStartDate, setTempStartDate] = useState<string>("");
  const [tempEndDate, setTempEndDate] = useState<string>("");

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics", dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (dateRange.start) params.append("startDate", dateRange.start);
      if (dateRange.end) params.append("endDate", dateRange.end);
      const url = `/api/analytics${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return res.json();
    },
  });

  const applyDateRange = (start?: string, end?: string) => {
    setDateRange({ start, end });
    setTempStartDate(start || "");
    setTempEndDate(end || "");
  };

  const applyPreset = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    applyDateRange(start.toISOString().split("T")[0], end.toISOString().split("T")[0]);
  };

  const clearFilters = () => {
    applyDateRange(undefined, undefined);
  };

  const applyCustomRange = () => {
    if (tempStartDate && tempEndDate) {
      applyDateRange(tempStartDate, tempEndDate);
    }
  };

  const handleExport = async (format: "json" | "csv") => {
    const params = new URLSearchParams({ format });
    if (dateRange.start) params.append("startDate", dateRange.start);
    if (dateRange.end) params.append("endDate", dateRange.end);
    
    const url = `/api/analytics/export?${params}`;
    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-export.${format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-muted-foreground">No analytics data available</div>
      </div>
    );
  }

  const priorityData = [
    { name: "Low", value: analytics.tasksByPriority.low, fill: COLORS.low },
    { name: "Medium", value: analytics.tasksByPriority.medium, fill: COLORS.medium },
    { name: "High", value: analytics.tasksByPriority.high, fill: COLORS.high },
    { name: "Urgent", value: analytics.tasksByPriority.urgent, fill: COLORS.urgent },
  ];

  const statusData = [
    { name: "Pending", value: analytics.tasksByStatus.pending, fill: COLORS.pending },
    { name: "In Progress", value: analytics.tasksByStatus.in_progress, fill: COLORS.in_progress },
    { name: "Completed", value: analytics.tasksByStatus.completed, fill: COLORS.completed },
    { name: "Cancelled", value: analytics.tasksByStatus.cancelled, fill: COLORS.cancelled },
  ];

  const sourceData = [
    { name: "Manual", value: analytics.tasksBySource.manual },
    { name: "Conversation", value: analytics.tasksBySource.conversation },
    { name: "GitHub", value: analytics.tasksBySource.github },
    { name: "API", value: analytics.tasksBySource.api },
  ];

  return (
    <div className="flex flex-col h-full overflow-auto">
      <div className="flex flex-col gap-4 p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold" data-testid="heading-analytics">Analytics Dashboard</h1>
            <p className="text-sm text-muted-foreground">Workload insights and activity trends</p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport("csv")}
              data-testid="button-export-csv"
            >
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleExport("json")}
              data-testid="button-export-json"
            >
              <Download className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          <div className="flex gap-2">
            <Button 
              variant={!dateRange.start ? "default" : "outline"} 
              size="sm" 
              onClick={clearFilters}
              data-testid="button-filter-all"
            >
              All Time
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => applyPreset(7)}
              data-testid="button-filter-7days"
            >
              Last 7 Days
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => applyPreset(30)}
              data-testid="button-filter-30days"
            >
              Last 30 Days
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => applyPreset(90)}
              data-testid="button-filter-90days"
            >
              Last 90 Days
            </Button>
          </div>
          
          <div className="flex gap-2 items-end border-l pl-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">Start Date</label>
              <input
                type="date"
                className="h-8 px-3 border rounded-md text-sm"
                value={tempStartDate}
                onChange={(e) => setTempStartDate(e.target.value)}
                data-testid="input-start-date"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-muted-foreground">End Date</label>
              <input
                type="date"
                className="h-8 px-3 border rounded-md text-sm"
                value={tempEndDate}
                onChange={(e) => setTempEndDate(e.target.value)}
                data-testid="input-end-date"
              />
            </div>
            <Button 
              size="sm" 
              onClick={applyCustomRange}
              disabled={!tempStartDate || !tempEndDate}
              data-testid="button-apply-custom-range"
            >
              Apply
            </Button>
          </div>

          {dateRange.start && (
            <div className="text-sm text-muted-foreground">
              Filtered: {dateRange.start} to {dateRange.end}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card data-testid="card-total-tasks">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalTasks}</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.completedTasks} completed
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-completion-rate">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.completionRate}%</div>
              <p className="text-xs text-muted-foreground">
                {analytics.overview.pendingTasks} pending
              </p>
            </CardContent>
          </Card>

          <Card data-testid="card-conversations">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalConversations}</div>
              <p className="text-xs text-muted-foreground">Logged conversations</p>
            </CardContent>
          </Card>

          <Card data-testid="card-github-commits">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">GitHub Commits</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{analytics.overview.totalGithubCommits}</div>
              <p className="text-xs text-muted-foreground">Tracked commits</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card data-testid="chart-task-priority">
            <CardHeader>
              <CardTitle>Tasks by Priority</CardTitle>
              <CardDescription>Distribution of task priorities</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={priorityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card data-testid="chart-task-status">
            <CardHeader>
              <CardTitle>Tasks by Status</CardTitle>
              <CardDescription>Current task status distribution</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card data-testid="chart-task-source">
          <CardHeader>
            <CardTitle>Tasks by Source</CardTitle>
            <CardDescription>Where tasks are coming from</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sourceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="hsl(var(--primary))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="chart-project-breakdown">
          <CardHeader>
            <CardTitle>Tasks by Project</CardTitle>
            <CardDescription>Project-level completion rates</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.tasksByProject}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="projectName" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="totalTasks" name="Total Tasks" fill="hsl(var(--chart-2))" />
                <Bar dataKey="completedTasks" name="Completed" fill="hsl(var(--chart-1))" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card data-testid="chart-time-series">
          <CardHeader>
            <CardTitle>Activity Timeline (Last 30 Days)</CardTitle>
            <CardDescription>Daily task and activity trends</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analytics.timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="tasksCreated" stroke="hsl(var(--chart-2))" name="Tasks Created" />
                <Line type="monotone" dataKey="tasksCompleted" stroke="hsl(var(--chart-1))" name="Tasks Completed" />
                <Line type="monotone" dataKey="conversations" stroke="hsl(var(--chart-3))" name="Conversations" />
                <Line type="monotone" dataKey="githubCommits" stroke="hsl(var(--chart-4))" name="GitHub Commits" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
