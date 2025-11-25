import { Navbar } from "../layout/Navbar";
import { Sidebar } from "../layout/Sidebar";
import { Card } from "../ui/Card";

export default function Dashboard() {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1">
        <Navbar />
        <div className="p-6 grid grid-cols-3 gap-6">
          <Card className="h-40">Orders Summary</Card>
          <Card className="h-40">Active Riders</Card>
          <Card className="h-40">Top Restaurants</Card>
        </div>
      </div>
    </div>
  );
}
