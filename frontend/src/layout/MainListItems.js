import React, { useContext, useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";

import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import { Badge } from "@material-ui/core";
import DashboardIcon from "@material-ui/icons/Dashboard";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsIcon from "@material-ui/icons/Settings";
import GroupIcon from "@material-ui/icons/Group";
import ContactPhoneIcon from "@material-ui/icons/ContactPhone";

import { i18n } from "../translate/i18n";
import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";

function ListItemLink(props) {
	const { icon, primary, to, className } = props;

	const renderLink = React.useMemo(
		() =>
			React.forwardRef((itemProps, ref) => (
				<RouterLink to={to} ref={ref} {...itemProps} />
			)),
		[to]
	);

	return (
		<li>
			<ListItem button component={renderLink} className={className}>
				{icon ? <ListItemIcon>{icon}</ListItemIcon> : null}
				<ListItemText primary={primary} />
			</ListItem>
		</li>
	);
}

const MainListItems = () => {
	const userProfile = localStorage.getItem("profile");
	const { whatsApps } = useContext(WhatsAppsContext);
	const [connectionWarning, setConnectionWarning] = useState(false);

	useEffect(() => {
		const delayDebounceFn = setTimeout(() => {
			if (whatsApps.length > 0) {
				const offlineWhats = whatsApps.filter(whats => {
					if (
						whats.status === "qrcode" ||
						whats.status === "PAIRING" ||
						whats.status === "DISCONNECTED" ||
						whats.status === "TIMEOUT" ||
						whats.status === "OPENING"
					)
						return true;
					else return false;
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

	return (
		<div>
			<ListItemLink to="/" primary="Dashboard" icon={<DashboardIcon />} />
			<ListItemLink
				to="/connections"
				primary={i18n.t("mainDrawer.listItems.connections")}
				icon={
					<Badge badgeContent={connectionWarning ? "!" : 0} color="error">
						<SyncAltIcon />
					</Badge>
				}
			/>
			<ListItemLink
				to="/tickets"
				primary={i18n.t("mainDrawer.listItems.tickets")}
				icon={<WhatsAppIcon />}
			/>

			<ListItemLink
				to="/contacts"
				primary={i18n.t("mainDrawer.listItems.contacts")}
				icon={<ContactPhoneIcon />}
			/>
			{userProfile === "admin" && (
				<>
					<Divider />
					<ListSubheader inset>
						{i18n.t("mainDrawer.listItems.administration")}
					</ListSubheader>
					<ListItemLink
						to="/users"
						primary={i18n.t("mainDrawer.listItems.users")}
						icon={<GroupIcon />}
					/>
					<ListItemLink
						to="/settings"
						primary={i18n.t("mainDrawer.listItems.settings")}
						icon={<SettingsIcon />}
					/>
				</>
			)}
		</div>
	);
};

export default MainListItems;
