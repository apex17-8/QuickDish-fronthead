import { Card } from "../ui/Card"; 
import { Badge } from "../ui/Badge"; 
import { Button } from "../ui/Button"; 

const mockRiders = [
  { name: "John", online: true, rating: 4.5 },
  { name: "Emma", online: false, rating: 4.2 },
];

export default function Riders() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
      {mockRiders.map((rider, i) => (
        <Card key={i}>
          <h3 className="text-lg font-bold">{rider.name}</h3>
          <p>Rating: {rider.rating}</p>
          <Badge status={rider.online ? "delivering" : "pending"} />
          <Button className="mt-2" variant="ghost">
            Message
          </Button>
        </Card>
      ))}
    </div>
  );
}
