import React, { useContext, useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import SearchIcon from "@material-ui/icons/Search";
import InputBase from "@material-ui/core/InputBase";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import MoveToInboxIcon from "@material-ui/icons/MoveToInbox";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Switch from "@material-ui/core/Switch";

import NewTicketModal from "../NewTicketModal";
import TicketsList from "../TicketsList";
import TabPanel from "../TabPanel";

import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import Can from "../Can";

const useStyles = makeStyles(theme => ({
	ticketsWrapper: {
		position: "relative",
		display: "flex",
		height: "100%",
		flexDirection: "column",
		overflow: "hidden",
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
	},

	tabsHeader: {
		flex: "none",
		backgroundColor: "#eee",
	},

	settingsIcon: {
		alignSelf: "center",
		marginLeft: "auto",
		padding: 8,
	},

	tab: {
		minWidth: 120,
		width: 120,
	},

	ticketsListActions: {
		flex: "none",
		marginLeft: "auto",
	},

	searchBox: {
		position: "relative",
		display: "flex",
		alignItems: "center",
		background: "#fafafa",
		padding: "10px 13px",
	},

	serachInputWrapper: {
		flex: 1,
		background: "#fff",
		display: "flex",
		borderRadius: 40,
		padding: 4,
	},

	searchIcon: {
		color: "grey",
		marginLeft: 6,
		marginRight: 6,
		alignSelf: "center",
	},

	searchInput: {
		flex: 1,
		border: "none",
		borderRadius: 30,
	},
}));

const TicketsManager = () => {
	const classes = useStyles();

	const [searchParam, setSearchParam] = useState("");
	const [tab, setTab] = useState("open");
	const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);
	const [showAllTickets, setShowAllTickets] = useState(false);
	const { user } = useContext(AuthContext);

	const handleSearchContact = e => {
		if (e.target.value === "") {
			setSearchParam(e.target.value.toLowerCase());
			setTab("open");
			return;
		}
		setSearchParam(e.target.value.toLowerCase());
		setTab("search");
	};

	const handleChangeTab = (e, newValue) => {
		setTab(newValue);
	};

	return (
		<Paper elevation={0} variant="outlined" className={classes.ticketsWrapper}>
			<NewTicketModal
				modalOpen={newTicketModalOpen}
				onClose={e => setNewTicketModalOpen(false)}
			/>
			<Paper elevation={0} square className={classes.tabsHeader}>
				<Tabs
					value={tab}
					onChange={handleChangeTab}
					variant="fullWidth"
					indicatorColor="primary"
					textColor="primary"
					aria-label="icon label tabs example"
				>
					<Tab
						value={"open"}
						icon={<MoveToInboxIcon />}
						label={i18n.t("tickets.tabs.open.title")}
						classes={{ root: classes.tab }}
					/>
					<Tab
						value={"closed"}
						icon={<CheckBoxIcon />}
						label={i18n.t("tickets.tabs.closed.title")}
						classes={{ root: classes.tab }}
					/>
					<Tab
						value={"search"}
						icon={<SearchIcon />}
						label={i18n.t("tickets.tabs.search.title")}
						classes={{ root: classes.tab }}
					/>
				</Tabs>
			</Paper>
			<Paper square elevation={0} className={classes.searchBox}>
				<div className={classes.serachInputWrapper}>
					<SearchIcon className={classes.searchIcon} />
					<InputBase
						className={classes.searchInput}
						placeholder={i18n.t("tickets.search.placeholder")}
						type="search"
						onChange={handleSearchContact}
					/>
				</div>
				<div className={classes.ticketsListActions}>
					<Can
						role={user.profile}
						perform="tickets-manager:showall"
						yes={() => (
							<FormControlLabel
								label={i18n.t("tickets.buttons.showAll")}
								labelPlacement="start"
								control={
									<Switch
										size="small"
										checked={showAllTickets}
										onChange={() => setShowAllTickets(prevState => !prevState)}
										name="showAllTickets"
										color="primary"
									/>
								}
							/>
						)}
					/>

					<IconButton
						aria-label="add ticket"
						size="small"
						color="primary"
						onClick={e => setNewTicketModalOpen(true)}
						style={{ marginLeft: 20 }}
					>
						<AddIcon />
					</IconButton>
				</div>
			</Paper>
			<TabPanel value={tab} name="open" className={classes.ticketsWrapper}>
				<TicketsList status="open" showAll={showAllTickets} />
				<TicketsList status="pending" />
			</TabPanel>
			<TabPanel value={tab} name="closed" className={classes.ticketsWrapper}>
				<TicketsList status="closed" showAll={showAllTickets} />
			</TabPanel>
			<TabPanel value={tab} name="search" className={classes.ticketsWrapper}>
				<TicketsList searchParam={searchParam} showAll={showAllTickets} />
			</TabPanel>
		</Paper>
	);
};

export default TicketsManager;
