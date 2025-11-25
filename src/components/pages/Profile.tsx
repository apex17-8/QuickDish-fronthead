import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

export default function Profile() {
  return (
    <div className="p-6 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-[var(--primary)] mb-4">Profile</h2>
      <form className="space-y-4">
        <Input placeholder="Name" />
        <Input placeholder="Email" type="email" />
        <Input placeholder="Phone" />
        <Button type="submit">Update Profile</Button>
      </form>
    </div>
  );
}
