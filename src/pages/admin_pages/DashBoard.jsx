import { useEffect, useState } from "react";
import { Users, ShoppingCart, PackageX, Truck } from "lucide-react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

const StatCard = ({ title, value, icon: Icon, color, Url }) => {
  const navigate = useNavigate();

  return(
  <div
    className={`p-4 sm:p-6 rounded-2xl shadow-md text-white flex items-center sm:items-start sm:flex-row flex-col gap-3 sm:gap-4 transform transition hover:scale-105 min-h-[140px] sm:min-h-[160px] w-full`}
    style={{ background: color }}
    onClick={()=>{navigate(Url)}}

  >
    <Icon size={32} className="mb-2 sm:mb-0" />
    <div className="text-center sm:text-left">
      <h3 className="text-base sm:text-lg font-medium">{title}</h3>
      <p className="text-xl sm:text-2xl font-bold break-words">{value}</p>
    </div>
  </div>
)};

const LoadingCard = () => (
  <div className="p-4 sm:p-6 rounded-2xl shadow-md bg-gray-200 flex items-center sm:items-start sm:flex-row flex-col gap-3 sm:gap-4 min-h-[140px] sm:min-h-[160px] w-full animate-pulse">
    <div className="w-8 h-8 bg-gray-300 rounded mb-2 sm:mb-0"></div>
    <div className="text-center sm:text-left w-full">
      <div className="h-4 sm:h-5 bg-gray-300 rounded mb-2 w-24"></div>
      <div className="h-6 sm:h-8 bg-gray-300 rounded w-16"></div>
    </div>
  </div>
);

const DashBoard = () => {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    API.get("/api/stats").then((res) => setStats(res.data));
  }, []);

  return (
    <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-gray-800 text-center sm:text-left">
        Admin Dashboard
      </h1>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {stats ? (
          <>
            <StatCard
              title="Total Users"
              value={stats.totalUsers}
              icon={Users}
              Url="/admin/users"
              color="linear-gradient(135deg, #8B5A7C, #A06C92)"
            />
            <StatCard
              title="Total Orders"
              value={stats.totalOrders}
              icon={ShoppingCart}
              Url="/admin/orders"
              color="linear-gradient(135deg, #8B5A7C, #96628F)"
            />
            <StatCard
              title="Users w/o Orders"
              value={stats.nonOrderUsers}
              icon={PackageX}
              Url="/admin/users"
              color="linear-gradient(135deg, #8B5A7C, #AF7BA9)"
            />
            <StatCard
              title="Non-Delivered Orders"
              value={stats.nonDeliveredOrders}
              icon={Truck}
              Url="/admin/orders"
              color="linear-gradient(135deg, #8B5A7C, #C07DB4)"
            />
            <StatCard
              title="Total Revenue"
              value={`₹${stats.totalRevenue.toFixed(2)}`}
              icon={ShoppingCart}
              Url="/admin/orders"
              color="linear-gradient(135deg, #8B5A7C, #9E6D99)"
            />
            <StatCard
              title="Products Sold"
              value={stats.totalProducts}
              icon={PackageX}
              Url="/admin/inventory"
              color="linear-gradient(135deg, #8B5A7C, #B181AE)"
            />
          </>
        ) : (
          <>
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
            <LoadingCard />
          </>
        )}
      </div>
    </div>
  );
};

export default DashBoard;