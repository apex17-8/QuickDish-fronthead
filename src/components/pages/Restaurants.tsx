import { Card } from "../ui/Card";
import { Button } from "../ui/Button";

const restaurants = [
  { name: "Pizza Palace", address: "Nairobi", logo: "" },
  { name: "Burger House", address: "Kisumu", logo: "" },
];

export default function Restaurants() {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {restaurants.map((r, i) => (
        <Card key={i}>
          <h3 className="font-bold text-lg">{r.name}</h3>
          <p>{r.address}</p>
          <Button className="mt-2">View Menu</Button>
        </Card>
      ))}
    </div>
  );
}
