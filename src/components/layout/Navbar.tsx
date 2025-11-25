import { Button } from "../ui/Button";

export const Navbar = () => {
  return (
    <nav className="w-full flex items-center justify-between px-6 py-4 bg-[var(--bg-light)] shadow">
      <h1 className="text-2xl font-bold text-[var(--primary)]">Yamto Eats</h1>

      <div className="flex gap-3">
        <Button variant="ghost">Home</Button>
        <Button variant="ghost">Orders</Button>
        <Button variant="primary">Login</Button>
      </div>
    </nav>
  );
};
