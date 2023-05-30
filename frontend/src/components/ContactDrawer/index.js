import React, { useState } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Drawer from "@material-ui/core/Drawer";
import Link from "@material-ui/core/Link";
import InputLabel from "@material-ui/core/InputLabel";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";

import ConfirmationModal from "../ConfirmationModal";
import ContactModal from "../ContactModal";
import ContactDrawerSkeleton from "../ContactDrawerSkeleton";
import MarkdownWrapper from "../MarkdownWrapper";
import { useTranslation } from "react-i18next";
import NewTicketModal from "../NewTicketModal";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const drawerWidth = 320;

const useStyles = makeStyles(theme => ({
	drawer: {
		width: drawerWidth,
		flexShrink: 0,
	},
	drawerPaper: {
		width: drawerWidth,
		display: "flex",
		borderTop: "1px solid rgba(0, 0, 0, 0.12)",
		borderRight: "1px solid rgba(0, 0, 0, 0.12)",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		borderTopRightRadius: 4,
		borderBottomRightRadius: 4,
	},
	header: {
		display: "flex",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
		backgroundColor: "#eee",
		alignItems: "center",
		padding: theme.spacing(0, 1),
		minHeight: "73px",
		justifyContent: "flex-start",
	},
	content: {
		display: "flex",
		backgroundColor: "#eee",
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
		padding: 8,
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		"& > *": {
			margin: 4,
		},
	},

	contactDetails: {
		marginTop: 8,
		padding: 8,
		display: "flex",
		flexDirection: "column",
	},
	contactExtraInfo: {
		marginTop: 4,
		padding: 6,
	},
}));

const ContactDrawer = ({ open, handleDrawerClose, contact, whatsapp, ticketId, loading, setContact }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();

	const [modalOpen, setModalOpen] = useState(false);
	const [blockModalOpen, setBlockModalOpen] = useState(false);
	const [newTicketModalOpen, setNewTicketModalOpen] = useState(false);

	const [loadingBlock, setLoadingBlock] = useState(false);

	const handleBlockContact = async () => {
		setLoadingBlock(true);

		try {
			const { data } = await api.put(`/contacts/block/${contact.id}`, {
				session: whatsapp.name
			});

			setContact(data);
		} catch (err) {
			toastError(err);
		}

		setLoadingBlock(false);
	}

	const checkBlockedList = () => {
		if (contact.blockedContacts && contact.blockedContacts.some(block => (block.session === whatsapp.name))) {
			return true;
		}

		return false;
	}

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
			<NewTicketModal
				modalOpen={newTicketModalOpen}
				onClose={(e) => setNewTicketModalOpen(false)}
				contactId={contact.id}
				ticketId={ticketId}
			/>
			<div className={classes.header}>
				<IconButton onClick={handleDrawerClose}>
					<CloseIcon />
				</IconButton>
				<Typography style={{ justifySelf: "center" }}>
					{i18n.t("contactDrawer.header")}
				</Typography>
			</div>
			{loading ? (
				<ContactDrawerSkeleton classes={classes} />
			) : (
				<div className={classes.content}>
					<Paper square variant="outlined" className={classes.contactHeader}>
						<Avatar
							alt={contact.name}
							src={contact.profilePicUrl}
							className={classes.contactAvatar}
						></Avatar>

						<Typography>{contact.name}</Typography>
						<Typography>
							<Link href={`tel:${contact.number}`}>{contact.number}</Link>
						</Typography>
						<Button
							variant="outlined"
							color="primary"
							onClick={() => setModalOpen(true)}
						>
							{i18n.t("contactDrawer.buttons.edit")}
						</Button>
						<Button
							variant="outlined"
							color="secondary"
							onClick={() => setBlockModalOpen(true)}
							disabled={loadingBlock}
						>
							{checkBlockedList() ? "Desbloquear contato" : "Bloquear contato"}
						</Button>
					</Paper>
					<Paper square variant="outlined" className={classes.contactDetails}>
						<ConfirmationModal
        					title={checkBlockedList() ? "Desbloquear contato" : "Bloquear contato"}
        					open={blockModalOpen}
        					onClose={setBlockModalOpen}
       						onConfirm={handleBlockContact}
      					>
							{(!checkBlockedList()) && <>Você realmente deseja bloquear esse contato? Você não receberá mais nenhuma mensagem dele.</>}
							{checkBlockedList() && <>Você realmente deseja desbloquear esse contato? Você poderá começar a receber mensagem dele.</>}
      					</ConfirmationModal>
						<ContactModal
							open={modalOpen}
							onClose={() => setModalOpen(false)}
							contactId={contact.id}
						></ContactModal>
						<Typography variant="subtitle1">
							{i18n.t("contactDrawer.extraInfo")}
						</Typography>
						{contact?.extraInfo?.map(info => (
							<Paper
								key={info.id}
								square
								variant="outlined"
								className={classes.contactExtraInfo}
							>
								<InputLabel>{info.name}</InputLabel>
								<Typography component="div" noWrap style={{ paddingTop: 2 }}>
									<MarkdownWrapper>{info.value}</MarkdownWrapper>
								</Typography>
							</Paper>
						))}
					</Paper>
					{ whatsapp && 
						<Paper square variant="outlined" className={classes.contactDetails}>
							<Typography variant="subtitle1">
								{"Whatsapp Info"}
							</Typography>
							<Paper
								square
								variant="outlined"
								className={classes.contactExtraInfo}
							>
								<InputLabel>{"Telefone"}</InputLabel>
								<Typography component="div" noWrap style={{ paddingTop: 2 }}>
									<MarkdownWrapper>{whatsapp.name}</MarkdownWrapper>
								</Typography>
							</Paper>
							<Paper
								square
								variant="outlined"
								className={classes.contactExtraInfo}
							>
								<InputLabel>{whatsapp.official ? "OFICIAL" : "NÃO OFICIAL"}</InputLabel>
							</Paper>
							{ !whatsapp.official && 
								<Paper
									square
									variant="outlined"
									className={classes.contactExtraInfo}
								>
									<InputLabel>{"Status"}</InputLabel>
									<Typography component="div" noWrap style={{ paddingTop: 2 }}>
										<MarkdownWrapper>{whatsapp.status}</MarkdownWrapper>
									</Typography>
								</Paper>
							}
							{ whatsapp.deleted && 
								<Paper
									square
									variant="outlined"
									className={classes.contactExtraInfo}
								>
									<InputLabel style={{ color: "red" }}>{"NÚMERO DELETADO"}</InputLabel>
								</Paper>
							}
							{ (whatsapp.deleted || whatsapp.status === "DISCONNECTED") &&
								<Button
									style={{ marginTop: 4 }}
									variant="outlined"
									onClick={() => setNewTicketModalOpen(true)}
								>
									Continuar conversa com outro número
								</Button>
							}
						</Paper>
					}
				</div>
			)}
		</Drawer>
	);
};

export default ContactDrawer;
