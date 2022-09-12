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
import Reports from "../pages/Reports"
import ReportsTicket from "../pages/ReportsTicket"
import RegistersReports from "../pages/RegistersReports"
import Importation from "../pages/Importation"
import WhatsConfig from "../pages/WhatsConfig"
import Templates from "../pages/Templates";
import Company from "../pages/Company";
import Menus from "../pages/Menus";
import TemplatesData from "../pages/TemplatesData";

import { AuthContext } from "../context/Auth/AuthContext";
import toastError from "../errors/toastError";
import api from "../services/api";


const RenderRoutes = () => {
    const { isAuth, user } = useContext(AuthContext);

    const [menus, setMenus] = useState([]);

    const fetchMenus = async () => {
        try {
            const { data } = await api.get(`/menus/company/${user.companyId}`);
            setMenus(data);
        } catch (err) {
            toastError(err);
        }
    }

    useEffect(() => {
        fetchMenus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAuth]);

    const getComponent = (name) => {
        if (name === "Dashboard") {
            return  Dashboard
        }
        if (name === "Official Connections") {
            return OfficialConnections
        }
        if (name === "Connections") {
            return Connections
        }
        if (name === "Template Data") {
            return TemplatesData
        }
        if (name === "Whats Config") {
            return WhatsConfig
        }
        if (name === "Tickets") {
            return Tickets
        }
        if (name === "Templates") {
            return Templates
        }
        if (name === "Contacts") {
            return Contacts
        }
        if (name === "Users") {
            return Users
        }
        if (name === "Quick Answers") {
            return QuickAnswers
        }
        if (name === "Importation") {
            return Importation
        }
        if (name === "Settings") {
            return Settings
        }
        if (name === "Queues") {
            return Queues
        }
        if (name === "Reports") {
            return Reports
        }
        if (name === "Reports Ticket") {
            return ReportsTicket
        }
        if (name === "Registers Reports") {
            return RegistersReports
        }
        if (name === "Company") {
            return Company
        }
        if (name === "Menus") {
            return Menus
        }
    }

    return (
        <>
            {menus && menus.map(menu => {
                if (menu.name === "Dashboard") {
                    return (
                        <Route
                            key={menu.id}
                            exact
                            path={`/`}
                            component={getComponent(menu.name)}
                            isPrivate
                        />
                    )
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
                    )
                }
                return (
                    <Route
                        key={menu.id}
                        exact
                        path={`/${menu.name.replaceAll(" ", "")}`}
                        component={getComponent(menu.name)}
                        isPrivate
                    />
                )
            })}
        </>
    )
};

export default RenderRoutes;
