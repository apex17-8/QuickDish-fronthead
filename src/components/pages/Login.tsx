import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg-light)]">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">
        <h2 className="text-2xl font-bold text-center text-[var(--primary)]">
          Login
        </h2>
        <form className="mt-6 space-y-4">
          <Input placeholder="Email" type="email" />
          <Input placeholder="Password" type="password" />
          <Button type="submit" className="w-full">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}
