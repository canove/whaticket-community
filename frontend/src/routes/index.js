import React from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import Route from "./Route";
import RenderRoutes from "./RenderRoutes";

import LoggedInLayout from "../layout";
import Signup from "../pages/Signup/";
import Login from "../pages/Login/";

import { AuthProvider } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Signup} />
            <WhatsAppsProvider>
              <LoggedInLayout>
                <RenderRoutes />
              </LoggedInLayout>
            </WhatsAppsProvider>

        </Switch>
        <ToastContainer autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
