// import AdminSidebar from './AdminSidebar';
// import { Outlet } from 'react-router-dom';
// import Header from '../user_comps/Header';

// const AdminLayout = () => {
//   return (
//     <>
//         <Header />
//         <div className='grid bg-white'>
//             <AdminSidebar />
//             <div className='ml-[250px] mt-14'>
//                 <Outlet />
//             </div>
//         </div>
//     </> 
//   );
// };

// export default AdminLayout;
import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Menu } from 'lucide-react';
import Header from '../user_comps/Header';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <Header />

      {/* Sidebar toggle button for mobile */}
      <div className="lg:hidden fixed top-2 right-2 z-50">
        <button
          className="p-2 rounded-md bg-[#8B5A7C] text-white shadow-md"
          onClick={() => setSidebarOpen(true)}
        >
          <Menu size={22} />
        </button>
      </div>

      <div className="grid bg-white">
        {/* Sidebar */}
        <AdminSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main Content */}
        <div className="lg:ml-[250px] mt-14 p-4">
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default AdminLayout;