import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/context/AuthContext';

const PrivateRoute = () => {
    const { isAuthenticated } = useAuthStore();

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
