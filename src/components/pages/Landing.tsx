import { Button } from "../ui/Button";

export default function Landing() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--bg-light)] text-[var(--text-dark)]">
      <h1 className="text-5xl font-bold text-[var(--primary)]">Yamto Eats</h1>
      <p className="mt-4 text-lg text-gray-700">
        Fast, Reliable Food Delivery
      </p>
      <div className="mt-6 flex gap-4">
        <Button>Get Started</Button>
        <Button variant="outline">Learn More</Button>
      </div>
    </div>
  );
}
