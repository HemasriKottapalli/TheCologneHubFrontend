import { useNavigate, useLocation } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  Slack
} from 'lucide-react';

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin/products',
      name: 'Product Management',
      icon: Package,
      description: 'Manage inventory & listings',
    },
    {
      path: '/admin/orders',
      name: 'Order Management',
      icon: ShoppingCart,
      description: 'Process & track orders',
    },
    {
      path: '/admin/users',
      name: 'User Management',
      icon: Users,
      description: 'Manage customer accounts',
    },
    {
      path: '/admin/brands',
      name: 'Brand Management',
      icon: Slack,
      description: 'Manage customer accounts',
    },
    {
      path: '/admin/inventory',
      name: 'Inventory Management',
      icon: Warehouse,
      description: 'Manage customer accounts',
    }
  ];

  const isActive = (path) => location.pathname === path;

  const handleItemClick = (path) => {
    navigate(path);
  };

  return (
    <div className="fixed inset-0 w-[250px] pt-20 bg-white border-r border-gray-200 h-screen flex flex-col shadow-sm">
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-bold text-gray-900">Admin Portal</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <li key={item.path}>
                <button
                  onClick={() => handleItemClick(item.path)}
                  className={`
                    w-full flex items-start px-3 py-3 rounded-lg transition-all duration-300 group text-left
                    ${active
                      ? 'bg-[#8B5A7C] text-white shadow-sm'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  `}
                >
                  <Icon
                    size={20}
                    className={`mr-3 mt-1 ${active ? 'text-white' : 'text-gray-400 group-hover:text-[#8B5A7C]'}`}
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className={`text-xs mt-0.5 ${active ? 'text-white/60' : 'text-gray-500 group-hover:text-gray-600'}`}>
                      {item.description}
                    </div>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

    </div>
  );
};

export default AdminSidebar;
