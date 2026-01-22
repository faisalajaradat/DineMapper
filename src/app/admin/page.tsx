import AdminSeedRestaurants from '@/components/AdminSeedRestaurants';

export default function AdminPage() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <AdminSeedRestaurants />
    </div>
  );
}