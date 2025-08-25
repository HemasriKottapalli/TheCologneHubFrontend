import { useNavigate, useLocation } from 'react-router-dom';
import {
  Package,
  ShoppingCart,
  Users,
  Warehouse,
  AreaChart,
  Slack,
  X,
  LogOut,
  UserCircle
} from 'lucide-react';

const AdminSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      path: '/admin/DashBoard',
      name: 'Dashboard',
      icon: AreaChart,
      description: 'Manage inventory & listings',
    },
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
      icon: UserCircle,
      description: 'Manage customer accounts',
    },
    {
      path: '/admin/brands',
      name: 'Brand Management',
      icon: Slack,
      description: 'Manage brands & partners',
    },
    {
      path: '/admin/inventory',
      name: 'Inventory Management',
      icon: Warehouse,
      description: 'Manage stock & warehouse',
    },
    {
      path: '/admin/Subscribers',
      name: 'Subscribers Management',
      icon: Users,
      description: 'Manage Subscribers & Download',
    },
  ];

    const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    //for name update on hero section
    window.dispatchEvent(new Event('usernameRemoved'));
    localStorage.removeItem('email');
    
    
    // Trigger logout event
    window.dispatchEvent(new CustomEvent('userLoggedOut'));
    
    // Redirect to home page
    navigate('/');
  };

  const isActive = (path) => location.pathname === path;

  const handleItemClick = (path) => {
    navigate(path);
    onClose?.(); // close sidebar on mobile after navigation
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-black/40 lg:hidden z-40"
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 w-[250px] h-screen flex flex-col shadow-sm z-50 transform transition-transform duration-300
        ${isOpen ? 'translate-x-0 bg-white' : '-translate-x-full'} 
        lg:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center h-20 bg-tranparent">
          {/* <h2 className="text-xl font-bold text-gray-900">Admin Portal</h2> */}
          <button
            className="lg:hidden text-gray-600 hover:text-gray-900"
            onClick={onClose}
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 overflow-y-auto border-r border-gray-200 border-t">
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
                      className={`mr-3 mt-1 ${
                        active
                          ? 'text-white'
                          : 'text-gray-400 group-hover:text-[#8B5A7C]'
                      }`}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div
                        className={`text-xs mt-0.5 ${
                          active
                            ? 'text-white/60'
                            : 'text-gray-500 group-hover:text-gray-600'
                        }`}
                      >
                        {item.description}
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}

            <li>
                  <button
                    onClick={() => handleLogout()}
                    className={`
                      w-full flex items-start px-3 py-3 rounded-lg transition-all duration-300 group text-left
                         'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    `}
                  >
                    <LogOut
                      size={20}
                      className={`mr-3 mt-1 
                          'text-gray-400 group-hover:text-[#8B5A7C]'
                      `}
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">LogOut</div>
                      <div
                        className={`text-xs mt-0.5
                            'text-gray-500 group-hover:text-gray-600'
                        `}
                      >
                        Click here to logout
                      </div>
                    </div>
                  </button>
                </li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default AdminSidebar;