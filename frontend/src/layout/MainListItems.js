import React, { forwardRef, useContext, useEffect, useMemo, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Divider from "@material-ui/core/Divider";
import { Badge } from "@material-ui/core";
import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import QuestionAnswerOutlinedIcon from "@material-ui/icons/QuestionAnswerOutlined";
import AssessmentOutlinedIcon from "@material-ui/icons/AssessmentOutlined";
import ImportExportOutlinedIcon from "@material-ui/icons/ImportExportOutlined";
import DvrIcon from "@material-ui/icons/Dvr";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import EqualizerIcon from "@material-ui/icons/Equalizer";
import ChatIcon from "@material-ui/icons/Chat";
import AccountCircleIcon from "@material-ui/icons/AccountCircle";
import ApartmentIcon from '@material-ui/icons/Apartment';
import ListAltIcon from '@material-ui/icons/ListAlt';

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { useTranslation } from "react-i18next";

import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";
import List from "@material-ui/core/List";
import PropTypes from "prop-types";
import Collapse from "@material-ui/core/Collapse";
import api from "../services/api";
import toastError from "../errors/toastError";
import { AuthContext } from "../context/Auth/AuthContext";

function getIcon(icon) {
  if (icon === "DashboardOutlinedIcon") {
    return <DashboardOutlinedIcon />;
  } else if (icon === "WhatsAppIcon") {
    return <WhatsAppIcon />;
  } else if (icon === "SyncAltIcon") {
    return <SyncAltIcon />;
  } else if (icon === "SettingsOutlinedIcon") {
    return <SettingsOutlinedIcon />;
  } else if (icon === "DvrIcon") {
    return <DvrIcon />;
  } else if (icon === "ChatIcon") {
    return <ChatIcon />;
  } else if (icon === "ContactPhoneOutlinedIcon") {
    return <ContactPhoneOutlinedIcon />;
  } else if (icon === "QuestionAnswerOutlinedIcon") {
    return <QuestionAnswerOutlinedIcon />;
  } else if (icon === "ImportExportOutlinedIcon") {
    return <ImportExportOutlinedIcon />;
  } else if (icon === "AccountCircleIcon") {
    return <AccountCircleIcon />;
  } else if (icon === "PeopleAltOutlinedIcon") {
    return <PeopleAltOutlinedIcon />;
  } else if (icon === "AccountTreeOutlinedIcon") {
    return <AccountTreeOutlinedIcon />;
  } else if (icon === "EqualizerIcon") {
    return <EqualizerIcon />;
  } else if (icon === "AssessmentOutlinedIcon") {
    return <AssessmentOutlinedIcon />
  } else if (icon === "ApartmentIcon") {
    return <ApartmentIcon />;
  } else if (icon === "ListAltIcon") {
    return <ListAltIcon />
  } else {
    return null;
  }
}

function ListParentItemLink(props) {
  const { icon, primary, className, connectionWarning, children } = props;

  const [open, setOpen] = useState(false);
  const renderedIcon = getIcon(icon);

  const handleClick = () => {
    setOpen((prevOpen) => !prevOpen);
  }

  return (
    <List>
      <li>
        <ListItem button open={open} onClick={handleClick} className={className}>
          {renderedIcon ? <ListItemIcon><Badge overlap="rectangular" badgeContent={connectionWarning ? "!" : 0} color="error">{renderedIcon}</Badge></ListItemIcon> : null}
          <ListItemText primary={primary} />
          {open ? <ExpandLess /> : <ExpandMore />}
        </ListItem>
      </li>
      <Collapse component="li" in={open} timeout="auto" unmountOnExit>
        <List disablePadding>
          { children ? children : null }
        </List>
      </Collapse>
    </List>
  )
}

function ListItemLink(props) {
  const { icon, to, primary, className, ...other } = props;

  const renderLink = forwardRef((itemProps, ref) => (<RouterLink to={to} ref={ref} {...itemProps} />))

  const renderedIcon = getIcon(icon);

  return (
    <li>
      <ListItem button component={renderLink} className={className} {...other}>
        {renderedIcon ? <ListItemIcon>{renderedIcon}</ListItemIcon> : null}
        <ListItemText primary={primary} />
      </ListItem>
    </li>
  );
}

const MainListItems = (props) => {
  const { drawerClose } = props;
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);
  
  const { i18n } = useTranslation();
  const [menus, setMenus] = useState([]);
  const [connectionWarning, setConnectionWarning] = useState(false);

  const [useDashboard, setUseDashboard] = useState(false);
  const [useOfficialConnections, setUseOfficialConnections] = useState(false);
  const [useConnections, setUseConnections] = useState(false);
  const [useWhatsConfig, setUseWhatsConfig] = useState(false);
  const [useTemplate, setUseTemplate] = useState(false);
  const [useTickets, setUseTickets] = useState(false);
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
      const { data } = await api.get(`/menus/company/${user.companyId}`);
      setMenus(data);
    } catch (err) {
      toastError(err);
    }
  }

  useEffect(() => {
    fetchMenus();
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          if (whats.official === false) {
            return (
              whats.status === "qrcode" ||
              whats.status === "PAIRING" ||
              whats.status === "DISCONNECTED" ||
              whats.status === "TIMEOUT" ||
              whats.status === "OPENING"
            );
          } return null
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

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
        if (menu.name === "Tickets") {
          setUseTickets(true);
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
    <div onClick={drawerClose}>
      { useDashboard && 
        <ListItemLink
          to="/"
          primary="Dashboard"
          icon="DashboardOutlinedIcon"
        />
      }
      { (useOfficialConnections) && 
        <ListParentItemLink 
          primary="WhatsApp"
          icon="WhatsAppIcon"
        >
          { useOfficialConnections && 
            <ListItemLink
              to="/OfficialConnections"
              primary={i18n.t("mainDrawer.whatsApp.officialConnections")}
              icon="SyncAltIcon"
            />
          }
        </ListParentItemLink>
      }
      { (useConnections || useWhatsConfig) &&
        <ListParentItemLink 
          primary="WhatsApp 2"
          icon="WhatsAppIcon"
          connectionWarning={connectionWarning}
        >
          { useConnections && 
            <ListItemLink
              to="/Connections"
              primary={i18n.t("mainDrawer.whatsApp.connections")}
              icon="SyncAltIcon"
            />
          }
          { useWhatsConfig && 
            <ListItemLink
              to="/WhatsConfig"
              primary={i18n.t("mainDrawer.whatsApp.settings")}
              icon="SettingsOutlinedIcon"
            />
          }
        </ListParentItemLink>
      }
      { useTemplate && 
        <ListItemLink
          to="/Templates"
          primary={i18n.t("mainDrawer.listItems.template")}
          icon="DvrIcon"
        />
      }
      { useTickets && 
        <ListItemLink
          to="/Tickets"
          primary={i18n.t("mainDrawer.listItems.tickets")}
          icon="ChatIcon"
        />
      }
      { useContacts && 
        <ListItemLink
          to="/Contacts"
          primary={i18n.t("mainDrawer.listItems.contacts")}
          icon="ContactPhoneOutlinedIcon"
        />
      }
      { useQuickAnswers && 
        <ListItemLink
          to="/QuickAnswers"
          primary={i18n.t("mainDrawer.listItems.quickAnswers")}
          icon="QuestionAnswerOutlinedIcon"
        />
      }
      { useImportation && 
        <ListItemLink
          to="/Importation"
          primary={i18n.t("mainDrawer.listItems.importation")}
          icon="ImportExportOutlinedIcon"
        />
      }
      { (useUsers || useCompany || useQueues || useSettings || useReports || useReportsTicket || useRegistersReports) &&
        <>
          <Divider />
          <ListParentItemLink 
            primary={i18n.t("mainDrawer.listItems.administration")}
            icon="AccountCircleIcon"
          >
            { useUsers && 
              <ListItemLink
                to="/Users"
                primary={i18n.t("mainDrawer.listItems.users")}
                icon="PeopleAltOutlinedIcon"
              />
            }
            { useCompany && 
              <ListItemLink
                to="/Company"
                primary={i18n.t("Empresa")}
                icon="ApartmentIcon"
              />
            }
            { useQueues && 
              <ListItemLink
                to="/Queues"
                primary={i18n.t("mainDrawer.listItems.queues")}
                icon="AccountTreeOutlinedIcon"
              />
            }
            { useMenus && 
              <ListItemLink
                to="/Menus"
                primary="Menus"
                icon="ListAltIcon"
              />
            }
            { useSettings && 
              <ListItemLink
                to="/Settings"
                primary={i18n.t("mainDrawer.listItems.settings")}
                icon="SettingsOutlinedIcon"
              />
            }
            { (useReports || useReportsTicket || useRegistersReports) &&
              <ListParentItemLink 
                primary={i18n.t("mainDrawer.listItems.reports")}
                icon="EqualizerIcon"
              >
                { useReports &&
                  <ListItemLink
                    to="/Reports"
                    primary={i18n.t("mainDrawer.listItems.reportsTalk")}
                    icon="AssessmentOutlinedIcon"
                  />
                }
                { useReportsTicket && 
                  <ListItemLink
                    to="/ReportsTicket"
                    primary={i18n.t("mainDrawer.listItems.reportsTicket")}
                    icon="AssessmentOutlinedIcon"
                  />
                }
                { useRegistersReports && 
                  <ListItemLink
                    to="/RegistersReports"
                    primary={i18n.t("mainDrawer.listItems.logReports")}
                    icon="AssessmentOutlinedIcon"
                  />
                }
              </ListParentItemLink>
            }
          </ListParentItemLink>
        </>
      }
    </div>
  );
};

export default MainListItems;
