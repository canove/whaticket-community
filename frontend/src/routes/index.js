import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoggedInLayout from "../layout";
import { AuthProvider } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import { ThemeProvider } from "../context/DarkMode";
import { StyledEngineProvider } from "@mui/material/styles";
import PrivateRoute from "./Route";

const Dashboard = lazy(() => import("../pages/Dashboard/"));
const Tickets = lazy(() => import("../pages/Tickets/"));
const CRM = lazy(() => import("../pages/CRM/"));
const Signup = lazy(() => import("../pages/Signup/"));
const Login = lazy(() => import("../pages/Login/"));
const Connections = lazy(() => import("../pages/Connections/"));
const Settings = lazy(() => import("../pages/Settings/"));
const Users = lazy(() => import("../pages/Users"));
const Contacts = lazy(() => import("../pages/Contacts/"));
const QuickAnswers = lazy(() => import("../pages/QuickAnswers/"));
const Queues = lazy(() => import("../pages/Queues/"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StyledEngineProvider injectFirst>
          <ThemeProvider>
            <Suspense fallback={<div />}>
              <Routes>
                <Route path="/login" element={<PrivateRoute component={Login} />} />
                <Route path="/signup" element={<PrivateRoute component={Signup} />} />
                <Route
                  path="/*"
                  element={
                    <WhatsAppsProvider>
                      <LoggedInLayout>
                        <Routes>
                          <Route path="/" element={<PrivateRoute component={Dashboard} isPrivate />} />
                          <Route path="/tickets/:ticketId?" element={<PrivateRoute component={Tickets} isPrivate />} />
                          <Route path="/crm" element={<PrivateRoute component={CRM} isPrivate />} />
                          <Route path="/connections" element={<PrivateRoute component={Connections} isPrivate />} />
                          <Route path="/contacts" element={<PrivateRoute component={Contacts} isPrivate />} />
                          <Route path="/users" element={<PrivateRoute component={Users} isPrivate />} />
                          <Route path="/quickAnswers" element={<PrivateRoute component={QuickAnswers} isPrivate />} />
                          <Route path="/Settings" element={<PrivateRoute component={Settings} isPrivate />} />
                          <Route path="/Queues" element={<PrivateRoute component={Queues} isPrivate />} />
                        </Routes>
                      </LoggedInLayout>
                    </WhatsAppsProvider>
                  }
                />
              </Routes>
            </Suspense>
            <ToastContainer autoClose={3000} />
          </ThemeProvider>
        </StyledEngineProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;
