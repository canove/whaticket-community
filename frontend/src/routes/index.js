import React, { useEffect, useState } from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import LoggedInLayout from "../layout";
import Dashboard from "../pages/Dashboard/";
import Tickets from "../pages/Tickets/";
import Signup from "../pages/Signup/";
import Login from "../pages/Login/";
import Connections from "../pages/Connections/";
import OfficialConnections from "../pages/OfficialConnections/";
import Settings from "../pages/Settings/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import QuickAnswers from "../pages/QuickAnswers/";
import Queues from "../pages/Queues/";
import Reports from "../pages/Reports"
import ReportsTicket from "../pages/ReportsTicket"
import RegistersReports from "../pages/RegistersReports"
import Importation from "../pages/Importation"
import WhatsConfig from "../pages/WhatsConfig"
import { AuthProvider } from "../context/Auth/AuthContext";
import { WhatsAppsProvider } from "../context/WhatsApp/WhatsAppsContext";
import Route from "./Route";
import Templates from "../pages/Templates";
import api from "../services/api";
import toastError from "../errors/toastError";
import Company from "../pages/Company";
import Menus from "../pages/Menus";

const Routes = () => {
  const [menus, setMenus] = useState([]);

  const [useDashboard, setUseDashboard] = useState(false);
  const [useOfficialConnections, setUseOfficialConnections] = useState(false);
  const [useConnections, setUseConnections] = useState(false);
  const [useWhatsConfig, setUseWhatsConfig] = useState(false);
  const [useTemplate, setUseTemplate] = useState(false);
  const [useContacts, setUseContacts] = useState(false);
  const [useUsers, setUseUsers] = useState(false);
  const [useQuickAnswers, setUseQuickAnswers] = useState(false);
  const [useImportation, setUseImportation] = useState(false);
  const [useSettings, setUseSettings] = useState(false);
  const [useQueues, setUseQueues] = useState(false);
  const [useReports, setUseReports] = useState(false);
  const [useReportsTicket, setUseReportsTicket] = useState(false);
  const [useRegistersReports, setUseRegistersReports] = useState(false);
  const [useCompany, setUseCompany] = useState(false);
  const [useMenus, setUseMenus] = useState(false);

  const fetchMenus = async () => {
    try {
      const { data } = await api.get('/menus/');
      setMenus(data);
    } catch (err) {
      toastError(err);
    } 
  }

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    if (menus) {
      menus.forEach(menu => {
        if (menu.name === "Dashboard") {
          setUseDashboard(true);
        }
        if (menu.name === "Official Connections") {
          setUseOfficialConnections(true);
        }
        if (menu.name === "Connections") {
          setUseConnections(true);
        }
        if (menu.name === "Whats Config") {
          setUseWhatsConfig(true);
        }
        if (menu.name === "Templates") {
          setUseTemplate(true);
        }
        if (menu.name === "Contacts") {
          setUseContacts(true);
        }
        if (menu.name === "Users") {
          setUseUsers(true);
        }
        if (menu.name === "Quick Answers") {
          setUseQuickAnswers(true);
        }
        if (menu.name === "Importation") {
          setUseImportation(true);
        }
        if (menu.name === "Settings") {
          setUseSettings(true);
        }
        if (menu.name === "Queues") {
          setUseQueues(true);
        }
        if (menu.name === "Reports") {
          setUseReports(true);
        }
        if (menu.name === "Reports Ticket") {
          setUseReportsTicket(true);
        }
        if (menu.name === "Registers Reports") {
          setUseRegistersReports(true);
        }
        if (menu.name === "Company") {
          setUseCompany(true);
        }
        if (menu.name === "Menus") {
          setUseMenus(true);
        }
      });
    }
  }, [menus])

  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/signup" component={Signup} />
          <WhatsAppsProvider>
            <LoggedInLayout>
              {useDashboard && <Route exact path="/" component={Dashboard} isPrivate />}
              {useOfficialConnections && 
              <Route
                exact
                path="/officialConnections"
                component={OfficialConnections}
                isPrivate
              />
              }
              {useConnections && 
              <Route
                exact
                path="/connections"
                component={Connections}
                isPrivate
              />
              }
              {useWhatsConfig && <Route exact path="/whatsConfig" component={WhatsConfig} isPrivate />}
              <Route
                exact
                path="/tickets/:ticketId?"
                component={Tickets}
                isPrivate
              />
              {useTemplate && <Route exact path="/templates" component={Templates} isPrivate />}
              {useContacts && <Route exact path="/contacts" component={Contacts} isPrivate />}
              {useUsers && <Route exact path="/users" component={Users} isPrivate />}
              {useQuickAnswers &&
              <Route
                exact
                path="/quickAnswers"
                component={QuickAnswers}
                isPrivate
              />
              }
              {useImportation && <Route exact path="/Importation" component={Importation} isPrivate />}
              {useSettings && <Route exact path="/Settings" component={Settings} isPrivate />}
              {useQueues && <Route exact path="/Queues" component={Queues} isPrivate />}
              {useReports && <Route exact path="/Reports" component={Reports} isPrivate />}
              {useReportsTicket && <Route exact path="/ReportsTicket" component={ReportsTicket} isPrivate />}
              {useRegistersReports && <Route exact path="/RegistersReports" component={RegistersReports} isPrivate />}
              {useCompany && <Route exact path="/Company" component={Company} isPrivate />}
              {useMenus && <Route exact path="/Menus" component={Menus} isPrivate />}
            </LoggedInLayout>
          </WhatsAppsProvider>
        </Switch>
        <ToastContainer autoClose={3000} />
      </AuthProvider>
    </BrowserRouter>
  );
};

export default Routes;
