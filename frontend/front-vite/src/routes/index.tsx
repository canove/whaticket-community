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
                <LoggedInLayout>
                  <Dashboard />
                </LoggedInLayout>
                // <PrivateRoute>
                //   <WhatsAppsProvider>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/tickets/:ticketId?"
              element={
                <LoggedInLayout>
                  <Tickets />
                </LoggedInLayout>
                // <PrivateRoute>
                //   <WhatsAppsProvider>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/connections"
              element={
                <LoggedInLayout>
                  <Connections />
                </LoggedInLayout>
                //   <WhatsAppsProvider>
                // <PrivateRoute>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/contacts"
              element={
                <LoggedInLayout>
                  <Contacts />
                </LoggedInLayout>
                // <PrivateRoute>
                //   <WhatsAppsProvider>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/users"
              element={
                <LoggedInLayout>
                  <Users />
                </LoggedInLayout>
                // <PrivateRoute>
                //   <WhatsAppsProvider>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/quickAnswers"
              element={
                <LoggedInLayout>
                  <QuickAnswers />
                </LoggedInLayout>
                //<PrivateRoute>
                //   <WhatsAppsProvider>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/Settings"
              element={
                <LoggedInLayout>
                  <Settings />
                </LoggedInLayout>
                // <PrivateRoute>
                //   <WhatsAppsProvider>
                //   </WhatsAppsProvider>
                // </PrivateRoute>
              }
            />
            <Route
              path="/Queues"
              element={
                <LoggedInLayout>
                  <Queues />
                </LoggedInLayout>
                // <PrivateRoute>
                //   <WhatsAppsProvider>
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
