import React, { useContext, useEffect, useState } from "react";
import Route from "./Route";
import Dashboard from "../pages/Dashboard/";
import Tickets from "../pages/Tickets/";
import Connections from "../pages/Connections/";
import OfficialConnections from "../pages/OfficialConnections/";
import Settings from "../pages/Settings/";
import Users from "../pages/Users";
import Contacts from "../pages/Contacts/";
import QuickAnswers from "../pages/QuickAnswers/";
import Queues from "../pages/Queues/";
import Reports from "../pages/Reports";
import ReportsTicket from "../pages/ReportsTicket";
import RegistersReports from "../pages/RegistersReports";
import WhatsConfig from "../pages/WhatsConfig";
import Templates from "../pages/Templates";
import Company from "../pages/Company";
import MenuLink from "../pages/MenuLink";
import TemplatesData from "../pages/TemplatesData";
import Registration from "../pages/Registration";
import Products from "../pages/Products";
import Pricing from "../pages/Pricing";
import Payments from "../pages/Payments";

import { AuthContext } from "../context/Auth/AuthContext";
import toastError from "../errors/toastError";
import api from "../services/api";
import IntegratedImport from "../pages/IntegratedImport";
import FileImport from "../pages/FileImport";
import Category from "../pages/Category";
import DialogFlows from "../pages/DialogFlows";
import Flows from "../pages/Flows";
import CreateFlows from "../pages/CreateFlows";
import ConnectionFiles from "../pages/ConnectionFiles";
import ContactTransfer from "../pages/ContactTransfer";
import ExposedImport from "../pages/ExposedImport";
import ChipsReports from "../pages/ChipsReports";
import NodeReports from "../pages/NodeReports";
import OfficialContacts from "../pages/OfficialContacts";
import OfficialTemplates from "../pages/OfficialTemplates";
import OfficialWhatsappReport from "../pages/OfficialWhatsappReport";
import Profiles from "../pages/Profiles";
import Operations from "../pages/Operations";
import GeneralReports from "../pages/GeneralReports";
import CategoryReport from "../pages/CategoryReport";
import ServiceTimeReports from "../pages/ServiceTimeReports";
import ContactBlacklist from "../pages/ContactBlacklist";
import Supervisor from "../pages/Supervisor";
import SatisfactionSurvey from "../pages/SatisfactionSurvey";
import Packages from "../pages/Packages";

const pages = {
  "Dashboard": Dashboard,
  "Settings": Settings,
  "Official Connections": OfficialConnections,
  "Connections": Connections,
  "Template Data": TemplatesData,
  "Whats Config": WhatsConfig,
  "Tickets": Tickets,
  "Templates": Templates,
  "Contacts": Contacts,
  "Users": Users,
  "Quick Answers": QuickAnswers,
  "Queues": Queues,
  "Reports": Reports,
  "Reports Ticket": ReportsTicket,
  "Registers Reports": RegistersReports,
  "Company": Company,
  "Menu Link": MenuLink,
  "Registration": Registration,
  "Products": Products,
  "Pricing": Pricing,
  "Payments": Payments,
  "File Import": FileImport,
  "Integrated Import": IntegratedImport,
  "Category": Category,
  "DialogFlow": DialogFlows,
  "Flows": Flows,
  "Connection Files": ConnectionFiles,
  "Contact Transfer": ContactTransfer,
  "Exposed Imports": ExposedImport,
  "Chips Reports": ChipsReports,
  "Node Reports": NodeReports,
  "Whats Contacts": OfficialContacts,
  "Official Templates": OfficialTemplates,
  "Official Whatsapp Report": OfficialWhatsappReport,
  "Profiles": Profiles,
  "Operations": Operations,
  "General Report": GeneralReports,
  "Category Report": CategoryReport,
  "Service Time": ServiceTimeReports,
  "Contact Blacklist": ContactBlacklist,
  "Supervisor": Supervisor,
  "Satisfaction Survey": SatisfactionSurvey,
  "Packages": Packages,
};

const RenderRoutes = () => {
  const { isAuth, user } = useContext(AuthContext);
  const [menus, setMenus] = useState([]);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const { data } = await api.get(`/menus/company`);
        setMenus(data);
      } catch (err) {
        toastError(err);
      }
    };

    fetchMenus();
  }, [isAuth]);

  const getComponent = (name) => {
    return pages[name];
  };

  return (
    <>
      {!isAuth && <Route path={`/`} isPrivate />}
      {isAuth &&
        menus &&
        menus.map((menu) => {
          if (menu.name === "Dashboard") {
            return (
              <Route
                key={menu.id}
                exact
                path={`/`}
                component={getComponent(menu.name)}
                isPrivate
              />
            );
          }
          if (menu.name === "Tickets") {
            return (
              <Route
                key={menu.id}
                exact
                path={`/tickets/:ticketId?`}
                component={getComponent(menu.name)}
                isPrivate
              />
            );
          }
          if (menu.name === "Connections") {
            return (
              <Route
                key={menu.id}
                exact
                path={`/connections/:connectionFileName?`}
                component={getComponent(menu.name)}
                isPrivate
              />
            );
          }
          if (menu.name === "Whats Contacts") {
            return (
              <Route
                key={menu.id}
                exact
                path={`/WhatsContacts/:connectionName?`}
                component={getComponent(menu.name)}
                isPrivate
              />
            );
          }
          return (
            <Route
              key={menu.id}
              exact
              path={`/${menu.name.replaceAll(" ", "")}`}
              component={getComponent(menu.name)}
              isPrivate
            />
          );
        })}
      <Route
        exact
        path={"/CreateFlow/:flowId"}
        component={CreateFlows}
        isPrivate
      />
    </>
  );
};

export default RenderRoutes;
