import React from "react";
import { Link as RouterLink } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
// import ListSubheader from "@material-ui/core/ListSubheader";
import Collapse from "@material-ui/core/Collapse";

import DashboardIcon from "@material-ui/icons/Dashboard";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
// import PeopleIcon from "@material-ui/icons/People";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import ChatIcon from "@material-ui/icons/Chat";
import BarChartIcon from "@material-ui/icons/BarChart";
import LayersIcon from "@material-ui/icons/Layers";
// import AssignmentIcon from "@material-ui/icons/Assignment";
import ExpandLess from "@material-ui/icons/ExpandLess";
import ExpandMore from "@material-ui/icons/ExpandMore";

const useStyles = makeStyles(theme => ({
	nested: {
		paddingLeft: theme.spacing(4),
	},
}));

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
	const classes = useStyles();
	const [open, setOpen] = React.useState(false);

	const handleClick = () => {
		setOpen(!open);
	};

	return (
		<div>
			<ListItemLink to="/" primary="Dashboard" icon={<DashboardIcon />} />

			<ListItem button onClick={handleClick}>
				<ListItemIcon>
					<WhatsAppIcon />
				</ListItemIcon>
				<ListItemText primary="WhatsApp" />
				{open ? <ExpandLess /> : <ExpandMore />}
			</ListItem>
			<Collapse in={open} timeout="auto" unmountOnExit>
				<List component="div" disablePadding>
					<ListItemLink
						className={classes.nested}
						to="/whats-auth"
						primary="Conexão"
						icon={<SyncAltIcon />}
					/>
					<ListItemLink
						className={classes.nested}
						to="/chat"
						primary="Chat"
						icon={<ChatIcon />}
					/>
				</List>
			</Collapse>

			<ListItem button disabled>
				<ListItemIcon>
					<BarChartIcon />
				</ListItemIcon>
				<ListItemText primary="Relatórios" />
			</ListItem>
			<ListItem button disabled>
				<ListItemIcon>
					<LayersIcon />
				</ListItemIcon>
				<ListItemText primary="Integrações" />
			</ListItem>
		</div>
	);
};
// export const secondaryListItems = (
// 	<div>
// 		<ListSubheader inset>Saved reports</ListSubheader>
// 		<ListItem button>
// 			<ListItemIcon>
// 				<AssignmentIcon />
// 			</ListItemIcon>
// 			<ListItemText primary="Current month" />
// 		</ListItem>
// 		<ListItem button>
// 			<ListItemIcon>
// 				<AssignmentIcon />
// 			</ListItemIcon>
// 			<ListItemText primary="Last quarter" />
// 		</ListItem>
// 		<ListItem button>
// 			<ListItemIcon>
// 				<AssignmentIcon />
// 			</ListItemIcon>
// 			<ListItemText primary="Year-end sale" />
// 		</ListItem>
// 	</div>
// );

export default MainListItems;
