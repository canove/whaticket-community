import React, { useState } from "react";

import makeStyles from '@mui/styles/makeStyles';
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import { X as CloseIcon } from "lucide-react";
import Drawer from "@mui/material/Drawer";
import Link from "@mui/material/Link";
import InputLabel from "@mui/material/InputLabel";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

import { i18n } from "../../translate/i18n";

import ContactModal from "../ContactModal";
import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import MarkdownWrapper from "../MarkdownWrapper";

const drawerWidth = 320;

const useStyles = makeStyles(theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
		display: "flex",
		borderTop: "1px solid #E5E9EF",
		borderRight: "1px solid #E5E9EF",
		borderBottom: "1px solid #E5E9EF",
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
	},
	header: {
		display: "flex",
		borderBottom: "1px solid #E5E9EF",
		backgroundColor: "#ffffff",
		alignItems: "center",
		padding: theme.spacing(0, 1),
		minHeight: "73px",
		justifyContent: "flex-start",
	},
	content: {
		display: "flex",
		backgroundColor: "#F7F8FA",
		flexDirection: "column",
		padding: "8px 0px 8px 8px",
		height: "100%",
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},

	contactAvatar: {
		margin: 15,
		width: 160,
		height: 160,
	},

	contactHeader: {
		display: "flex",
		padding: "20px 12px 16px",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		borderRadius: "12px !important",
		"& > *": {
			margin: 4,
		},
	},

	contactName: {
		fontFamily: '"Fraunces", Georgia, serif',
		fontWeight: 700,
		fontSize: 18,
		color: "#0A0F1E",
		letterSpacing: "-0.3px",
		textAlign: "center",
		margin: "4px 0 0",
	},

	contactNumber: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontSize: 13,
		color: "#9BA3B0",
		textAlign: "center",
		margin: "2px 0 8px",
	},

	contactDetails: {
		marginTop: 8,
		padding: 8,
		display: "flex",
		flexDirection: "column",
		borderRadius: "12px !important",
	},

	contactExtraInfo: {
		marginTop: 4,
		padding: "10px 12px",
		borderRadius: "10px !important",
	},

	extraInfoLabel: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontSize: 11,
		fontWeight: 600,
		color: "#9BA3B0",
		letterSpacing: "0.6px",
		textTransform: "uppercase",
		marginBottom: 2,
	},

	extraInfoValue: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontSize: 14,
		color: "#0A0F1E",
	},
}));

const ContactDrawer = ({ open, handleDrawerClose, contact, loading }) => {
	const classes = useStyles();

	const [modalOpen, setModalOpen] = useState(false);

	return (
        <Drawer
			className={classes.drawer}
			variant="persistent"
			anchor="right"
			open={open}
			PaperProps={{ style: { position: "absolute" } }}
			BackdropProps={{ style: { position: "absolute" } }}
			ModalProps={{
				container: document.getElementById("drawer-container"),
				style: { position: "absolute" },
			}}
			classes={{
				paper: classes.drawerPaper,
			}}
		>
			<div className={classes.header}>
				<IconButton onClick={handleDrawerClose} size="large">
					<CloseIcon size={18} />
				</IconButton>
				<Typography style={{ justifySelf: "center" }}>
					{i18n.t("contactDrawer.header")}
				</Typography>
			</div>
			{loading ? (
				<ContactDrawerSkeleton classes={classes} />
			) : (
				<div className={classes.content}>
					<Paper variant="outlined" className={classes.contactHeader}>
						<Avatar
							alt={contact.name}
							src={contact.profilePicUrl}
							className={classes.contactAvatar}
						/>
						<p className={classes.contactName}>{contact.name}</p>
						<p className={classes.contactNumber}>
							<Link href={`tel:${contact.number}`} color="inherit">{contact.number}</Link>
						</p>
						<Button
							variant="outlined"
							color="primary"
							size="small"
							onClick={() => setModalOpen(true)}
						>
							{i18n.t("contactDrawer.buttons.edit")}
						</Button>
					</Paper>
					<Paper variant="outlined" className={classes.contactDetails}>
						<ContactModal
							open={modalOpen}
							onClose={() => setModalOpen(false)}
							contactId={contact.id}
						/>
						<Typography
							style={{
								fontFamily: '"DM Sans", system-ui, sans-serif',
								fontWeight: 600,
								fontSize: 11,
								color: "#9BA3B0",
								letterSpacing: "0.6px",
								textTransform: "uppercase",
								marginBottom: 8,
								padding: "0 4px",
							}}
						>
							{i18n.t("contactDrawer.extraInfo")}
						</Typography>
						{contact?.extraInfo?.map(info => (
							<Paper
								key={info.id}
								variant="outlined"
								className={classes.contactExtraInfo}
							>
								<p className={classes.extraInfoLabel}>{info.name}</p>
								<div className={classes.extraInfoValue}>
									<MarkdownWrapper>{info.value}</MarkdownWrapper>
								</div>
							</Paper>
						))}
					</Paper>
				</div>
			)}
		</Drawer>
    );
};

export default ContactDrawer;
