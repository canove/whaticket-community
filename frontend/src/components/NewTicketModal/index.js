import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";

import makeStyles from '@mui/styles/makeStyles';
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import CircularProgress from "@mui/material/CircularProgress";
import Avatar from "@mui/material/Avatar";
import MenuItem from "@mui/material/MenuItem";
import Autocomplete, {
	createFilterOptions,
} from '@mui/material/Autocomplete';
import {
	Search as SearchIcon,
	UserPlus as UserPlusIcon,
	MessageSquare as MessageIcon,
} from "lucide-react";

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ContactModal from "../ContactModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const filter = createFilterOptions({ trim: true });

const avatarColors = [
	"#E8F5E9", "#E3F2FD", "#FFF3E0", "#FCE4EC",
	"#F3E5F5", "#E0F7FA", "#FFF8E1", "#EFEBE9",
];

const getAvatarColor = (name = "") => {
	let hash = 0;
	for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
	return avatarColors[Math.abs(hash) % avatarColors.length];
};

const getInitials = (name = "") =>
	name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

const useStyles = makeStyles(() => ({
	dialogTitle: {
		padding: "24px 24px 4px",
		display: "flex",
		alignItems: "center",
		gap: 10,
	},
	titleIcon: {
		width: 36,
		height: 36,
		borderRadius: 10,
		background: "linear-gradient(135deg, #E8F5E9, #C8E6C9)",
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		color: "#25D366",
		flexShrink: 0,
	},
	titleText: {
		fontFamily: '"Fraunces", Georgia, serif',
		fontWeight: 700,
		fontSize: 18,
		color: "#0A0F1E",
		letterSpacing: "-0.3px",
	},
	titleSub: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontSize: 12.5,
		color: "#9BA3B0",
		marginTop: 1,
	},

	sectionLabel: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontWeight: 600,
		fontSize: 11,
		color: "#9BA3B0",
		letterSpacing: "0.6px",
		textTransform: "uppercase",
		margin: "0 0 10px",
	},

	field: {
		"& .MuiOutlinedInput-root": {
			borderRadius: 11,
			fontFamily: '"DM Sans", system-ui, sans-serif',
			fontSize: 14,
			"& fieldset": { borderColor: "#E5E9EF" },
			"&:hover fieldset": { borderColor: "#25D366" },
			"&.Mui-focused fieldset": { borderColor: "#25D366", borderWidth: 1.5 },
		},
		"& .MuiInputLabel-outlined": {
			fontFamily: '"DM Sans", system-ui, sans-serif',
			fontSize: 14,
			color: "#9BA3B0",
		},
		"& .MuiInputLabel-outlined.Mui-focused": {
			color: "#25D366",
		},
	},

	queueField: {
		"& .MuiOutlinedInput-root": {
			borderRadius: 11,
			fontFamily: '"DM Sans", system-ui, sans-serif',
			fontSize: 14,
			"& fieldset": { borderColor: "#E5E9EF" },
			"&:hover fieldset": { borderColor: "#25D366" },
			"&.Mui-focused fieldset": { borderColor: "#25D366", borderWidth: 1.5 },
		},
		"& .MuiInputLabel-outlined": {
			fontFamily: '"DM Sans", system-ui, sans-serif',
			fontSize: 14,
			color: "#9BA3B0",
		},
		"& .MuiInputLabel-outlined.Mui-focused": {
			color: "#25D366",
		},
	},

	queueDot: {
		width: 8,
		height: 8,
		borderRadius: "50%",
		display: "inline-block",
		marginRight: 10,
		flexShrink: 0,
	},

	selectedContact: {
		display: "flex",
		alignItems: "center",
		gap: 12,
		padding: "12px 14px",
		borderRadius: 11,
		border: "1px solid #E5E9EF",
		backgroundColor: "#FAFAF9",
		marginTop: 14,
	},
	selectedAvatar: {
		width: 40,
		height: 40,
		fontSize: 14,
		fontWeight: 600,
		fontFamily: '"DM Sans", system-ui, sans-serif',
	},
	selectedName: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontWeight: 600,
		fontSize: 14,
		color: "#0A0F1E",
	},
	selectedNumber: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontSize: 12.5,
		color: "#9BA3B0",
	},
	clearBtn: {
		marginLeft: "auto",
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontSize: 12,
		color: "#9BA3B0",
		textTransform: "none",
		minWidth: "auto",
		padding: "2px 8px",
		"&:hover": {
			color: "#DC2626",
			backgroundColor: "rgba(220,38,38,0.06)",
		},
	},

	optionItem: {
		display: "flex",
		alignItems: "center",
		gap: 10,
		padding: "4px 0",
		width: "100%",
	},
	optionAvatar: {
		width: 32,
		height: 32,
		fontSize: 12,
		fontWeight: 600,
		fontFamily: '"DM Sans", system-ui, sans-serif',
		flexShrink: 0,
	},
	optionName: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontWeight: 500,
		fontSize: 13.5,
		color: "#0A0F1E",
		lineHeight: 1.3,
	},
	optionNumber: {
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontSize: 12,
		color: "#9BA3B0",
	},
	optionAdd: {
		display: "flex",
		alignItems: "center",
		gap: 8,
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontWeight: 600,
		fontSize: 13.5,
		color: "#25D366",
	},

	cancelBtn: {
		borderRadius: 11,
		border: "1px solid #E5E9EF",
		color: "#9BA3B0",
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontWeight: 600,
		fontSize: 13,
		textTransform: "none",
		height: 40,
		padding: "0 20px",
		backgroundColor: "transparent",
		boxShadow: "none",
		"&:hover": {
			backgroundColor: "#F7F8FA",
			boxShadow: "none",
		},
	},
	saveBtn: {
		borderRadius: 11,
		background: "linear-gradient(135deg, #25D366, #1DAB57)",
		color: "#ffffff",
		fontFamily: '"DM Sans", system-ui, sans-serif',
		fontWeight: 600,
		fontSize: 13,
		textTransform: "none",
		height: 40,
		padding: "0 24px",
		boxShadow: "none",
		position: "relative",
		"&:hover": {
			background: "linear-gradient(135deg, #1DAB57, #178A45)",
			boxShadow: "none",
		},
		"&.Mui-disabled": {
			opacity: 0.5,
			color: "#ffffff",
			background: "linear-gradient(135deg, #25D366, #1DAB57)",
		},
	},
	buttonProgress: {
		color: "#ffffff",
		position: "absolute",
		top: "50%",
		left: "50%",
		marginTop: -12,
		marginLeft: -12,
	},
}));

const NewTicketModal = ({ modalOpen, onClose }) => {
	const classes = useStyles();
	const navigate = useNavigate();

	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [selectedContact, setSelectedContact] = useState(null);
	const [selectedQueueId, setSelectedQueueId] = useState("");
	const [newContact, setNewContact] = useState({});
	const [contactModalOpen, setContactModalOpen] = useState(false);
	const { user } = useContext(AuthContext);

	const userQueues = user.queues || [];

	useEffect(() => {
		if (!modalOpen) return;
		// Auto-select if user has exactly 1 queue
		if (userQueues.length === 1) {
			setSelectedQueueId(userQueues[0].id);
		}
	}, [modalOpen]);

	useEffect(() => {
		if (!modalOpen || searchParam.length < 3) {
			setLoading(false);
			return;
		}
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const { data } = await api.get("contacts", {
						params: { searchParam },
					});
					setOptions(data.contacts);
					setLoading(false);
				} catch (err) {
					setLoading(false);
					toastError(err);
				}
			};
			fetchContacts();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, modalOpen]);

	const handleClose = () => {
		onClose();
		setSearchParam("");
		setSelectedContact(null);
		setSelectedQueueId(userQueues.length === 1 ? userQueues[0].id : "");
	};

	const handleSaveTicket = async (contactId) => {
		if (!contactId) return;
		setLoading(true);
		try {
			const payload = {
				contactId,
				userId: user.id,
				status: "open",
			};
			if (selectedQueueId) {
				payload.queueId = selectedQueueId;
			}
			const { data: ticket } = await api.post("/tickets", payload);
			navigate(`/tickets/${ticket.id}`);
		} catch (err) {
			toastError(err);
		}
		setLoading(false);
		handleClose();
	};

	const handleSelectOption = (e, newValue) => {
		if (newValue?.number) {
			setSelectedContact(newValue);
		} else if (newValue?.name) {
			setNewContact({ name: newValue.name });
			setContactModalOpen(true);
		}
	};

	const handleCloseContactModal = () => {
		setContactModalOpen(false);
	};

	const handleAddNewContactTicket = (contact) => {
		handleSaveTicket(contact.id);
	};

	const createAddContactOption = (filterOptions, params) => {
		const filtered = filter(filterOptions, params);
		if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
			filtered.push({ name: `${params.inputValue}` });
		}
		return filtered;
	};

	const renderOption = (option) => {
		if (option.number) {
			const hasPhoto = option.profilePicUrl && !option.profilePicUrl.includes("nopicture");
			return (
				<div className={classes.optionItem}>
					<Avatar
						src={hasPhoto ? option.profilePicUrl : undefined}
						className={classes.optionAvatar}
						style={!hasPhoto ? {
							backgroundColor: getAvatarColor(option.name),
							color: "#1C1917",
						} : undefined}
					>
						{!hasPhoto && getInitials(option.name)}
					</Avatar>
					<div>
						<div className={classes.optionName}>{option.name}</div>
						<div className={classes.optionNumber}>{option.number}</div>
					</div>
				</div>
			);
		}
		return (
			<div className={classes.optionAdd}>
				<UserPlusIcon size={16} />
				{i18n.t("newTicketModal.add")} {option.name}
			</div>
		);
	};

	const renderOptionLabel = (option) => {
		if (option.number) {
			return `${option.name} - ${option.number}`;
		}
		return `${option.name}`;
	};

	return (
		<>
			<ContactModal
				open={contactModalOpen}
				initialValues={newContact}
				onClose={handleCloseContactModal}
				onSave={handleAddNewContactTicket}
			/>
			<Dialog
				open={modalOpen}
				onClose={handleClose}
				maxWidth="xs"
				fullWidth
				PaperProps={{
					style: {
						borderRadius: 14,
						border: "1px solid #E5E9EF",
						boxShadow: "0 8px 32px rgba(10,15,30,0.10)",
					},
				}}
			>
				{/* Header */}
				<div className={classes.dialogTitle}>
					<div className={classes.titleIcon}>
						<MessageIcon size={18} />
					</div>
					<div>
						<div className={classes.titleText}>
							{i18n.t("newTicketModal.title")}
						</div>
						<div className={classes.titleSub}>
							{i18n.t("newTicketModal.titleSub")}
						</div>
					</div>
				</div>

				<DialogContent style={{ padding: "16px 24px 20px" }}>
					{/* Contact search */}
					<div style={{ marginBottom: selectedContact ? 0 : 16 }}>
						<p className={classes.sectionLabel}>
							{i18n.t("newTicketModal.contactSection")}
						</p>
						{!selectedContact ? (
							<Autocomplete
								options={options}
								loading={loading}
								clearOnBlur
								autoHighlight
								freeSolo
								clearOnEscape
								getOptionLabel={renderOptionLabel}
								renderOption={renderOption}
								filterOptions={createAddContactOption}
								onChange={(e, newValue) => handleSelectOption(e, newValue)}
								ListboxProps={{
									style: {
										padding: "6px 0",
									},
								}}
								PaperComponent={({ children, ...props }) => (
									<div
										{...props}
										style={{
											borderRadius: 11,
											border: "1px solid #E5E9EF",
											boxShadow: "0 8px 24px rgba(10,15,30,0.10)",
											backgroundColor: "#fff",
											marginTop: 4,
										}}
									>
										{children}
									</div>
								)}
								renderInput={(params) => (
									<TextField
										{...params}
										label={i18n.t("newTicketModal.fieldLabel")}
										variant="outlined"
										size="small"
										autoFocus
										className={classes.field}
										onChange={(e) => setSearchParam(e.target.value)}
										onKeyPress={(e) => {
											if (loading || !selectedContact) return;
											if (e.key === "Enter") {
												handleSaveTicket(selectedContact.id);
											}
										}}
										InputProps={{
											...params.InputProps,
											startAdornment: (
												<SearchIcon
													size={16}
													style={{ color: "#9BA3B0", marginRight: 4, flexShrink: 0 }}
												/>
											),
											endAdornment: (
												<React.Fragment>
													{loading ? (
														<CircularProgress color="inherit" size={18} />
													) : null}
													{params.InputProps.endAdornment}
												</React.Fragment>
											),
										}}
									/>
								)}
							/>
						) : (
							<div className={classes.selectedContact}>
								<Avatar
									src={
										selectedContact.profilePicUrl &&
										!selectedContact.profilePicUrl.includes("nopicture")
											? selectedContact.profilePicUrl
											: undefined
									}
									className={classes.selectedAvatar}
									style={{
										backgroundColor: getAvatarColor(selectedContact.name),
										color: "#1C1917",
									}}
								>
									{getInitials(selectedContact.name)}
								</Avatar>
								<div>
									<div className={classes.selectedName}>{selectedContact.name}</div>
									<div className={classes.selectedNumber}>{selectedContact.number}</div>
								</div>
								<Button
									className={classes.clearBtn}
									onClick={() => setSelectedContact(null)}
									size="small"
								>
									{i18n.t("newTicketModal.change")}
								</Button>
							</div>
						)}
					</div>

					{/* Queue selector (only if user has 2+ queues) */}
					{userQueues.length > 1 && (
						<div style={{ marginTop: 18 }}>
							<p className={classes.sectionLabel}>
								{i18n.t("newTicketModal.queueSection")}
							</p>
							<TextField
								select
								fullWidth
								variant="outlined"
								size="small"
								className={classes.queueField}
								value={selectedQueueId}
								onChange={(e) => setSelectedQueueId(e.target.value)}
								label={i18n.t("newTicketModal.queueLabel")}
							>
								<MenuItem value="">
									<em style={{
										fontFamily: '"DM Sans", system-ui, sans-serif',
										fontSize: 13,
										color: "#9BA3B0",
									}}>
										{i18n.t("newTicketModal.queueNone")}
									</em>
								</MenuItem>
								{userQueues.map((queue) => (
									<MenuItem
										key={queue.id}
										value={queue.id}
										style={{
											fontFamily: '"DM Sans", system-ui, sans-serif',
											fontSize: 13,
										}}
									>
										<span
											className={classes.queueDot}
											style={{ backgroundColor: queue.color || "#9BA3B0" }}
										/>
										{queue.name}
									</MenuItem>
								))}
							</TextField>
						</div>
					)}
				</DialogContent>

				<DialogActions style={{ padding: "0 24px 20px", gap: 10 }}>
					<Button
						onClick={handleClose}
						disabled={loading}
						className={classes.cancelBtn}
						variant="outlined"
					>
						{i18n.t("newTicketModal.buttons.cancel")}
					</Button>
					<Button
						variant="contained"
						disabled={!selectedContact || loading}
						onClick={() => handleSaveTicket(selectedContact.id)}
						className={classes.saveBtn}
					>
						{i18n.t("newTicketModal.buttons.ok")}
						{loading && (
							<CircularProgress size={22} className={classes.buttonProgress} />
						)}
					</Button>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default NewTicketModal;
