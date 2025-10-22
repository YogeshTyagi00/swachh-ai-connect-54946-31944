import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const reportsByCategory = [
  { name: "Overflowing Bins", value: 145 },
  { name: "Illegal Dumping", value: 98 },
  { name: "Littering", value: 76 },
  { name: "Others", value: 167 },
];

const monthlyData = [
  { month: "Jan", reports: 65, resolved: 52 },
  { month: "Feb", reports: 78, resolved: 61 },
  { month: "Mar", reports: 92, resolved: 73 },
  { month: "Apr", reports: 88, resolved: 69 },
  { month: "May", reports: 105, resolved: 84 },
  { month: "Jun", reports: 112, resolved: 89 },
];

const COLORS = ["#10b981", "#f59e0b", "#ef4444", "#6366f1"];

export default function OverviewCharts() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Reports by Category</CardTitle>
          <CardDescription>Distribution of waste management issues</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={reportsByCategory}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {reportsByCategory.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Performance</CardTitle>
          <CardDescription>Reports submitted vs resolved</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="reports" fill="#6366f1" name="Submitted" />
              <Bar dataKey="resolved" fill="#10b981" name="Resolved" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
