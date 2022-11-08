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
import WhatsConfig from "../pages/WhatsConfig"
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

const RenderRoutes = () => {
    const { isAuth } = useContext(AuthContext);
    const [menus, setMenus] = useState([]);

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const { data } = await api.get(`/menus/company`);
                setMenus(data);
            } catch (err) {
                toastError(err);
            }
        }
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
        if (name === "Menu Link") {
            return MenuLink
        }
        if (name === "Registration") {
            return Registration
        }
        if (name === "Products") {
            return Products
        }
        if (name === "Pricing") {
            return Pricing
        }
        if (name === "Payments") {
            return Payments
        }
        if (name === "File Import") {
            return FileImport
        }
        if (name === "Integrated Import") {
            return IntegratedImport
        }
        if (name === "Category") {
            return Category
        }
        if (name === "DialogFlow") {
            return DialogFlows
        }
        if (name === "Flows") {
            return Flows
        }
        if (name === "Connection Files") {
            return ConnectionFiles
        }
        if (name === "Contact Transfer") {
            return ContactTransfer
        }
        if (name === "Exposed Imports") {
            return ExposedImport
        }
        if (name === "Chips Reports") {
            return ChipsReports
        }
    }

    return (
        <>
            {!isAuth &&
                <Route
                    path={`/`}
                    isPrivate
                />
            }
            {isAuth &&
                menus && menus.map(menu => {
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
                    if (menu.name === "Connections") {
                        return (
                            <Route
                                key={menu.id}
                                exact
                                path={`/connections/:connectionFileName?`}
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
                })
            }
            <Route 
                exact
                path={'/CreateFlow/:flowId'}
                component={CreateFlows}
                isPrivate
            />
        </>
    )
};

export default RenderRoutes;
