import { Routes, Route, Navigate } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import Dashboard from '@/pages/Dashboard';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Contacts from '@/pages/Contacts';
import Connections from '@/pages/Connections';
import Tickets from '@/pages/Tickets';
import Users from '@/pages/Users';
import Queues from '@/pages/Queues';
import Tags from '@/pages/Tags';
import Kanban from '@/pages/Kanban';
import Schedules from '@/pages/Schedules';
import Campaigns from '@/pages/Campaigns';
import InternalChat from '@/pages/InternalChat';
import Webhooks from '@/pages/Webhooks';
import Prompts from '@/pages/Prompts';
import PrivateRoute from '@/routes/PrivateRoute';
import MainLayout from '@/layout/MainLayout';
import { useAuthStore } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

const App = () => {
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        useAuthStore.persist.rehydrate();
        setIsHydrated(true);
    }, []);

    if (!isHydrated) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <CircularProgress />
            </Box>
        )
    }

    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route element={<PrivateRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/tickets" element={<Tickets />} />
                    <Route path="/contacts" element={<Contacts />} />
                    <Route path="/connections" element={<Connections />} />
                    <Route path="/queues" element={<Queues />} />
                    <Route path="/tags" element={<Tags />} />
                    <Route path="/kanban" element={<Kanban />} />
                    <Route path="/schedules" element={<Schedules />} />
                    <Route path="/campaigns" element={<Campaigns />} />
                    <Route path="/internal-chat" element={<InternalChat />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/webhooks" element={<Webhooks />} />
                    <Route path="/prompts" element={<Prompts />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};

export default App;
