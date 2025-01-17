import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoggedInLayout from "../layout";
import Dashboard from "../pages/Dashboard";
import Tickets from "../pages/Tickets";
import Signup from "../pages/Signup";
import Login from "../pages/Login";
import Connections from "../pages/Connections";
import Settings from "../pages/Settings";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts";
import QuickAnswers from "../pages/QuickAnswers";
import Queues from "../pages/Queues";
import { AuthProvider } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import { ThemeProvider } from "../context/DarkMode";
// import Route from "./Route";
import PrivateRoute from "./PrivateRouter";

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <Dashboard />
                // <PrivateRoute>
                //   <WhatsAppsProvider>
                //     <LoggedInLayout>
                //     </LoggedInLayout>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/tickets/:ticketId?"
              element={
                <Tickets />
                // <PrivateRoute>
                //   <WhatsAppsProvider>
                //     <LoggedInLayout>
                //     </LoggedInLayout>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/connections"
              element={
                <Connections />
                // <PrivateRoute>
                //   <WhatsAppsProvider>
                //     <LoggedInLayout>
                //     </LoggedInLayout>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <Contacts />
                // <PrivateRoute>
                //   <WhatsAppsProvider>
                //     <LoggedInLayout>
                //     </LoggedInLayout>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <Users />
                // <PrivateRoute>
                //   <WhatsAppsProvider>
                //     <LoggedInLayout>
                //     </LoggedInLayout>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/quickAnswers"
              element={
                <QuickAnswers />
                // <PrivateRoute>
                //   <WhatsAppsProvider>
                //     <LoggedInLayout>
                //     </LoggedInLayout>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/Settings"
              element={
                <Settings />
                // <PrivateRoute>
                //   <WhatsAppsProvider>
                //     <LoggedInLayout>
                //     </LoggedInLayout>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/Queues"
              element={
                <Queues />
                // <PrivateRoute>
                //   <WhatsAppsProvider>
                //     <LoggedInLayout>
                //     </LoggedInLayout>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
          </Routes>
          <ToastContainer autoClose={3000} />
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
