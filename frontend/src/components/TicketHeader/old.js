import React from "react";

import {
	Avatar,
	Button,
	Card,
	CardHeader,
	IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Skeleton from "@material-ui/lab/Skeleton";
import { Replay } from "@material-ui/icons";

import TicketOptionsMenu from "../TicketOptionsMenu";
import { i18n } from "../../translate/i18n";

const drawerWidth = 320;

const useStyles = makeStyles(theme => ({
	root: {
		display: "flex",
		height: "100%",
		position: "relative",
		overflow: "hidden",
	},

	mainWrapper: {
		flex: 1,
		height: "100%",
		display: "flex",
		flexDirection: "column",
		overflow: "hidden",
		borderTopLeftRadius: 0,
		borderBottomLeftRadius: 0,
		borderLeft: "0",
		marginRight: -drawerWidth,
		transition: theme.transitions.create("margin", {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
	},

	mainWrapperShift: {
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
		transition: theme.transitions.create("margin", {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
		marginRight: 0,
	},

	messagesHeader: {
		display: "flex",
		// cursor: "pointer",
		backgroundColor: "#eee",
		flex: "none",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
	},

	actionButtons: {
		marginRight: 6,
		flex: "none",
		alignSelf: "center",
		marginLeft: "auto",
		"& > *": {
			margin: theme.spacing(1),
		},
	},

	messagesListWrapper: {
		overflow: "hidden",
		position: "relative",
		display: "flex",
		flexDirection: "column",
		flexGrow: 1,
	},

	circleLoading: {
		color: green[500],
		position: "absolute",
		opacity: "70%",
		top: 0,
		left: "50%",
		marginTop: 12,
	},

	messageLeft: {
		marginRight: 20,
		marginTop: 2,
		minWidth: 100,
		maxWidth: 600,
		height: "auto",
		display: "block",
		position: "relative",

		whiteSpace: "pre-wrap",
		backgroundColor: "#ffffff",
		color: "#303030",
		alignSelf: "flex-start",
		borderTopLeftRadius: 0,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
		paddingLeft: 5,
		paddingRight: 5,
		paddingTop: 5,
		paddingBottom: 0,
		boxShadow: "0 1px 1px #b3b3b3",
	},

	messageRight: {
		marginLeft: 20,
		marginTop: 2,
		minWidth: 100,
		maxWidth: 600,
		height: "auto",
		display: "block",
		position: "relative",

		whiteSpace: "pre-wrap",
		backgroundColor: "#dcf8c6",
		color: "#303030",
		alignSelf: "flex-end",
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 0,
		paddingLeft: 5,
		paddingRight: 5,
		paddingTop: 5,
		paddingBottom: 0,
		boxShadow: "0 1px 1px #b3b3b3",
	},

	textContentItem: {
		overflowWrap: "break-word",
		padding: "3px 80px 6px 6px",
	},

	messageMedia: {
		objectFit: "cover",
		width: 250,
		height: 200,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	},

	timestamp: {
		fontSize: 11,
		position: "absolute",
		bottom: 0,
		right: 5,
		color: "#999",
	},

	dailyTimestamp: {
		alignItems: "center",
		textAlign: "center",
		alignSelf: "center",
		width: "110px",
		backgroundColor: "#e1f3fb",
		margin: "10px",
		borderRadius: "10px",
		boxShadow: "0 1px 1px #b3b3b3",
	},

	dailyTimestampText: {
		color: "#808888",
		padding: 8,
		alignSelf: "center",
		marginLeft: "0px",
	},

	ackIcons: {
		fontSize: 18,
		verticalAlign: "middle",
		marginLeft: 4,
	},

	ackDoneAllIcon: {
		color: green[500],
		fontSize: 18,
		verticalAlign: "middle",
		marginLeft: 4,
	},
}));

const TicketHeader = ({ loading, contact, ticket }) => {
	const classes = useStyles();

	return (
		<Card square className={classes.messagesHeader}>
			<CardHeader
				// onClick={handleDrawerOpen}
				style={{ cursor: "pointer" }}
				titleTypographyProps={{ noWrap: true }}
				subheaderTypographyProps={{ noWrap: true }}
				avatar={
					loading ? (
						<Skeleton animation="wave" variant="circle">
							<Avatar alt="contact_image" />
						</Skeleton>
					) : (
						<Avatar src={contact.profilePicUrl} alt="contact_image" />
					)
				}
				title={
					loading ? (
						<Skeleton animation="wave" width={60} />
					) : (
						`${contact.name} #${ticket.id}`
					)
				}
				subheader={
					loading ? (
						<Skeleton animation="wave" width={80} />
					) : ticket.user ? (
						`${i18n.t("messagesList.header.assignedTo")} ${ticket.user.name}`
					) : (
						"Pending"
					)
				}
			/>
			{!loading && (
				<div className={classes.actionButtons}>
					{ticket.status === "closed" ? (
						<Button
							startIcon={<Replay />}
							size="small"
							// onClick={e => handleUpdateTicketStatus(e, "open", userId)}
						>
							{i18n.t("messagesList.header.buttons.reopen")}
						</Button>
					) : (
						<>
							<Button
								startIcon={<Replay />}
								size="small"
								// onClick={e => handleUpdateTicketStatus(e, "pending", null)}
							>
								{i18n.t("messagesList.header.buttons.return")}
							</Button>
							<Button
								size="small"
								variant="contained"
								color="primary"
								// onClick={e => handleUpdateTicketStatus(e, "closed", userId)}
							>
								{i18n.t("messagesList.header.buttons.resolve")}
							</Button>
						</>
					)}
					{/* <IconButton onClick={handleOpenTicketOptionsMenu}>
						<MoreVertIcon />
					</IconButton>
					<TicketOptionsMenu
						ticket={ticket}
						anchorEl={anchorEl}
						menuOpen={moreMenuOpen}
						handleClose={handleCloseTicketOptionsMenu}
					/> */}
				</div>
			)}
		</Card>
	);
};

export default TicketHeader;
