import React from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoggedInLayout from "../layout";
import Dashboard from "../pages/Dashboard/";
import Tickets from "../pages/Tickets/";
import Signup from "../pages/Signup/";
import Login from "../pages/Login/";
import Connections from "../pages/Connections/";
import Settings from "../pages/Settings/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import QuickAnswers from "../pages/QuickAnswers/";
import Queues from "../pages/Queues/";
import Tags from "../pages/Tags/";
import FlowList from "../pages/Flows/FlowList";
import FlowEditor from "../pages/Flows/FlowEditor";
import AISettings from "../pages/AISettings/";
import Analytics from "../pages/Analytics/";
import DeveloperPortal from "../pages/DeveloperPortal/";
import { AuthProvider } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import { ThemeProvider } from "../context/DarkMode";
import { StyledEngineProvider } from "@mui/material/styles";
import Route from "./Route";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StyledEngineProvider injectFirst>
          <ThemeProvider>
            <Switch>
              <Route exact path="/login" component={Login} />
              <Route exact path="/signup" component={Signup} />
              <WhatsAppsProvider>
                <LoggedInLayout>
                  <Route exact path="/" component={Dashboard} isPrivate />
                  <Route exact path="/tickets/:ticketId?" component={Tickets} isPrivate />
                  <Route exact path="/connections" component={Connections} isPrivate />
                  <Route exact path="/contacts" component={Contacts} isPrivate />
                  <Route exact path="/users" component={Users} isPrivate />
                  <Route exact path="/quickAnswers" component={QuickAnswers} isPrivate />
                  <Route exact path="/Settings" component={Settings} isPrivate />
                  <Route exact path="/ai-settings" component={AISettings} isPrivate />
                  <Route exact path="/analytics" component={Analytics} isPrivate />
                  <Route exact path="/developer-portal" component={DeveloperPortal} isPrivate />
                  <Route exact path="/Queues" component={Queues} isPrivate />
                  <Route exact path="/Tags" component={Tags} isPrivate />
                  <Route exact path="/flows" component={FlowList} isPrivate />
                  <Route exact path="/flows/:flowId" component={FlowEditor} isPrivate />
                  <Route exact path="/flows/:flowId/edit" component={FlowEditor} isPrivate />
                </LoggedInLayout>
              </WhatsAppsProvider>
            </Switch>
            <ToastContainer autoClose={3000} />
          </ThemeProvider>
        </StyledEngineProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
