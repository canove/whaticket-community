import React from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import { AuthProvider } from "../context/Auth/AuthContext";
import { SearchMessageProvider } from "../context/SearchMessage/SearchMessageContext";
import { UsersPresenceProvider } from "../context/UsersPresenceContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import LoggedInLayout from "../layout";
import Categories from "../pages/Categories/";
import Connections from "../pages/Connections/";
import Contacts from "../pages/Contacts/";
import Dashboard from "../pages/Dashboard/";
import Login from "../pages/Login/";
import Messages from "../pages/Messages/";
import Queues from "../pages/Queues/";
import QuickAnswers from "../pages/QuickAnswers/";
import Reports from "../pages/Reports";
import Settings from "../pages/Settings/";
import Signup from "../pages/Signup/";
import Tickets from "../pages/Tickets/";
import Users from "../pages/Users";
import Route from "./Route";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Signup} />
          <WhatsAppsProvider>
            <UsersPresenceProvider>
              <SearchMessageProvider>
                <LoggedInLayout>
                  <Route exact path="/" component={Dashboard} isPrivate />
                  <Route exact path="/reports" component={Reports} isPrivate />
                  <Route
                    exact
                    path="/tickets/:ticketId?"
                    component={Tickets}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/connections"
                    component={Connections}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/contacts"
                    component={Contacts}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/messages"
                    component={Messages}
                    isPrivate
                  />
                  <Route exact path="/users" component={Users} isPrivate />
                  <Route
                    exact
                    path="/quickAnswers"
                    component={QuickAnswers}
                    isPrivate
                  />
                  <Route
                    exact
                    path="/Settings"
                    component={Settings}
                    isPrivate
                  />
                  <Route exact path="/Queues" component={Queues} isPrivate />
                  <Route
                    exact
                    path="/categories"
                    component={Categories}
                    isPrivate
                  />
                </LoggedInLayout>
              </SearchMessageProvider>
            </UsersPresenceProvider>
          </WhatsAppsProvider>
        </Switch>
        <ToastContainer autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
