export const Sidebar = () => {
  return (
    <aside className="w-64 h-screen bg-[var(--bg-dark)] text-white p-6 space-y-6">
      <h2 className="text-xl font-bold">Dashboard</h2>

      <ul className="space-y-4">
        <li className="hover:text-[var(--primary)] cursor-pointer">
          Orders
        </li>
        <li className="hover:text-[var(--primary)] cursor-pointer">
          Riders
        </li>
        <li className="hover:text-[var(--primary)] cursor-pointer">
          Restaurants
        </li>
      </ul>
    </aside>
  );
};
