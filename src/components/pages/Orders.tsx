import { Card } from "../ui/Card"; 
import { Badge } from "../ui/Badge"; 

const mockOrders = [
  { id: 1, customer: "Alice", status: "pending", total: 25 },
  { id: 2, customer: "Bob", status: "delivering", total: 45 },
  { id: 3, customer: "Charlie", status: "completed", total: 32 },
];

export default function Orders() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mockOrders.map((order) => (
        <Card key={order.id}>
          <h3 className="font-semibold text-lg">{order.customer}</h3>
          <p>Total: ${order.total}</p>
          <Badge status={order.status} />
        </Card>
      ))}
    </div>
  );
}
