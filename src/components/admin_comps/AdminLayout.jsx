import AdminSidebar from './AdminSidebar';
import { Outlet } from 'react-router-dom';
import Header from '../user_comps/Header';

const AdminLayout = () => {
  return (
    <>
        <Header />
        <div className='grid bg-white'>
            <AdminSidebar />
            <div className='ml-[250px] mt-14'>
                <Outlet />
            </div>
        </div>
    </> 
  );
};

export default AdminLayout;
