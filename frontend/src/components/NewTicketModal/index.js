import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";

import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";

import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Autocomplete, {
	createFilterOptions,
} from "@material-ui/lab/Autocomplete";
import CircularProgress from "@material-ui/core/CircularProgress";

import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModal from "../ContactModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { useTranslation } from "react-i18next";
import { Checkbox, Chip, FormControl, FormControlLabel, InputLabel, makeStyles, MenuItem, Select, Tooltip, Typography } from "@material-ui/core";
import QueueSelectSingle from "../QueueSelectSingle";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';

const filter = createFilterOptions({
	trim: true,
});

const useStyles = makeStyles(theme => ({
	chips: {
		display: "flex",
		flexWrap: "wrap",
	},
	chip: {
		margin: 2,
	},
	multFieldLine: {
		display: "flex",
		"& > *:not(:last-child)": {
		  marginRight: theme.spacing(1),
		},
	},
}));

const NewTicketModal = ({ modalOpen, onClose, contactId, ticketId, isOfficial, officialWhatsappId, officialContact }) => {
	const history = useHistory();
	const classes = useStyles();

	const { i18n } = useTranslation();

	const { user } = useContext(AuthContext);
	const { whatsApps } = useContext(WhatsAppsContext);

	const [options, setOptions] = useState([]);
	const [queues, setQueues] = useState([]);
	const [templates, setTemplates] = useState([]);

	const [loading, setLoading] = useState(false);
	const [contactModalOpen, setContactModalOpen] = useState(false);
	const [official, setOfficial] = useState(false);

	const [searchParam, setSearchParam] = useState("");
	const [queueId, setQueueId] = useState("");
	const [whatsappId, setWhatsappId] = useState("");
	
	const [selectedContact, setSelectedContact] = useState(null);
	const [selectedTemplate, setSelectedTemplate] = useState(null);
	const [variables, setVariables] = useState(null);
	const [header, setHeader] = useState(null);
	const [newContact, setNewContact] = useState({});

	useEffect(() => {
		const fetchQueues = async () => {
			if (user.profileId !== 1) {
				setQueues(user.queues);
				return;
			}
			
			try {
				const { data } = await api.get("/queue");
				setQueues(data);
			} catch (err) {
				toastError(err);
			}
		}

		fetchQueues();
	}, []);

	useEffect(() => {
		if (isOfficial && officialWhatsappId) {
			setOfficial(isOfficial);
			setWhatsappId(officialWhatsappId);
		}
	}, [isOfficial, officialWhatsappId]);

	useEffect(() => {
		const fetchTemplates = async () => {
			if (!whatsappId) return;

			try {
				const { data } = await api.get("/whatsappTemplate/", {
					params: { whatsappId }
				});
				setTemplates(data);
			} catch (err) {
				toastError(err);
			}
		}

		fetchTemplates();
	}, [whatsappId]);

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
	}, [searchParam, modalOpen, contactModalOpen]);

	const handleClose = () => {
		onClose();
		setQueueId("");
		setSearchParam("");
		setWhatsappId("");
		setSelectedContact(null);
		setSelectedTemplate(null);
		setVariables(null);
		setHeader(null);
		setOfficial(false);
	};

	const handleSaveTicket = async (contactId) => {
		if (!contactId) return;
		setLoading(true);
		try {
			const { data: ticket } = await api.post("/tickets", {
				contactId: contactId,
				userId: user.id,
				status: "open",
				ticketId: ticketId,
				queueId: queueId ? queueId : null,
				whatsappId: whatsappId ? whatsappId : null,
				official,
				templateId: selectedTemplate ? selectedTemplate.id : null,
				templateVariables: variables ? JSON.stringify(variables) : null,
				templateHeader: header ? JSON.stringify(header) : null,
			});
			history.push(`/tickets/${ticket.id}`);
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
		} else {
			setSelectedContact(null);
		}
	};

	const handleCloseContactModal = () => {
		setContactModalOpen(false);
	};

	const handleAddNewContactTicket = contact => {
		// handleSaveTicket(contact.id);
		setSearchParam(contact.name);
		setSelectedContact(contact);
	};

	const createAddContactOption = (filterOptions, params) => {
		const filtered = filter(filterOptions, params);

		if (params.inputValue !== "" && !loading && searchParam.length >= 3) {
			filtered.push({
				name: `${params.inputValue}`,
			});
		}

		return filtered;
	};

	const renderOption = option => {
		if (option.number) {
			return `${option.name} - ${option.number}`;
		} else {
			return `${i18n.t("newTicketModal.add")} ${option.name}`;
		}
	};

	const renderOptionLabel = option => {
		if (option.number) {
			return `${option.name} - ${option.number}`;
		} else {
			return `${option.name}`;
		}
	};

	return (
		<>
			<ContactModal
				open={contactModalOpen}
				initialValues={newContact}
				onClose={handleCloseContactModal}
				onSave={handleAddNewContactTicket}
			/>
			<Dialog open={modalOpen} onClose={handleClose} maxWidth="sm" fullWidth>
				<DialogTitle id="form-dialog-title">
					{i18n.t("newTicketModal.title")}
				</DialogTitle>
				<DialogContent dividers>
					{ contactId &&
						<Typography>Você tem certeza que deseja continuar esta conversa com outro número? Este ticket será finalizado e um novo ticket será criado.</Typography>
					}
					{ !contactId &&
						<>
							<Autocomplete
								options={options}
								loading={loading}
								// style={{ width: 300 }}
								fullWidth
								clearOnBlur
								autoHighlight
								freeSolo
								clearOnEscape
								getOptionLabel={renderOptionLabel}
								renderOption={renderOption}
								filterOptions={createAddContactOption}
								onChange={(e, newValue) => handleSelectOption(e, newValue)}
								renderInput={params => (
									<TextField
										{...params}
										label={i18n.t("newTicketModal.fieldLabel")}
										variant="outlined"
										autoFocus
										onChange={e => setSearchParam(e.target.value)}
										onKeyPress={e => {
											if (loading || !selectedContact) return;
											else if (e.key === "Enter") {
												handleSaveTicket(selectedContact.id);
											}
										}}
										InputProps={{
											...params.InputProps,
											endAdornment: (
												<React.Fragment>
													{loading ? (
														<CircularProgress color="inherit" size={20} />
													) : null}
													{(!loading && selectedContact) ? (
														<CheckCircleIcon color="inherit" size={20} />
													) : null}
													{(!loading && !selectedContact) ? (
														<CancelIcon color="inherit" size={20} />
													) : null}
													{params.InputProps.endAdornment}
												</React.Fragment>
											),
										}}
									/>
								)}
							/>
							{ officialContact && 
								<div>Contato da conversa: {officialContact.number}</div>
							}
							<div style={{ marginTop: 6 }}>
								<FormControl fullWidth margin="dense" variant="outlined">
									<InputLabel>{"Fila"}</InputLabel>
									<Select
										label={"Fila"}
										value={queueId}
										onChange={(e) => {
											setQueueId(e.target.value)
											setWhatsappId("");
										}}
										defaultValue=""
										MenuProps={{
											anchorOrigin: {
												vertical: "bottom",
												horizontal: "left",
											},
											transformOrigin: {
												vertical: "top",
												horizontal: "left",
											},
											getContentAnchorEl: null,
										}}
										renderValue={selected => {
											const queue = queues.find(q => q.id === selected);
											return queue ? (
												<Chip
													key={selected}
													style={{ backgroundColor: queue.color }}
													variant="outlined"
													label={queue.name}
													className={classes.chip}
												/>
											) : null;
										}}
									>
										<MenuItem value={""}>Nenhum</MenuItem>
										{queues.map(queue => {
											return (
												<MenuItem key={queue.id} value={queue.id}>
													{queue.name}
												</MenuItem>
											)
										})}
									</Select>
								</FormControl>
							</div>
							<div>
								<FormControlLabel
									control={
										<Checkbox
											checked={official}
											onChange={() => {
												setOfficial(prevOfficial => !prevOfficial);
												setWhatsappId("");
												setSelectedTemplate(null);
												setVariables(null);
												setHeader(null);
											}}
											name="official"
											color="primary"
										/>
									}
									label="Whatsapp Oficial"
								/>
							</div>
							<div>
								<FormControl variant="outlined" margin="normal" fullWidth>
									<InputLabel>Conexões</InputLabel>
									<Select
										variant="outlined"
										value={whatsappId}
										label={"Conexões"}
										onChange={(e) => {
											setWhatsappId(e.target.value)
											setSelectedTemplate(null);
											setVariables(null);
											setHeader(null);
										}}
										fullWidth
									>
										<MenuItem value={""}>
											{"Qualquer Número"}
										</MenuItem>
										{whatsApps &&
											whatsApps.map((whats) => {
												if (official) {
													if (whats.official === true && whats.deleted === false) {
														return (
															<MenuItem key={whats.id} value={whats.id}>
																{whats.name}
															</MenuItem>
														);
													}
												} else {
													if (whats.official === false && whats.status === "CONNECTED" && whats.deleted === false) {
														return (
															<MenuItem key={whats.id} value={whats.id}>
																{whats.name}
															</MenuItem>
														);
													}
												}

												return null;
											})
										}
									</Select>
								</FormControl>
							</div>
							{ official && whatsappId &&
								<div>
									<FormControl variant="outlined" margin="normal" fullWidth>
										<InputLabel>Templates</InputLabel>
										<Select
											variant="outlined"
											value={selectedTemplate}
											label={"Templates"}
											onChange={(e) => {
												setSelectedTemplate(e.target.value);

												const mapping = e.target.value.mapping;
												const header = e.target.value.header;

												if (mapping) {
													setVariables(JSON.parse(mapping));
												} else {
													setVariables(null);
												}

												if (header) {
													setHeader(JSON.parse(header));
												} else {
													setHeader(null);
												}
											}}
											fullWidth
										>
											<MenuItem value={""}>
												{"Nenhum"}
											</MenuItem>
											{templates &&
												templates.map((template) => (
													<MenuItem key={template.id} value={template}>
														{template.name}
													</MenuItem>
												))
											}
										</Select>
									</FormControl>
								</div>
							}
							{ selectedTemplate &&
								<div style={{ border: "1px solid rgba(0, 0, 0, 0.7)", borderRadius: "3px", padding: "5px" }}>
									{ (selectedTemplate.header || selectedTemplate.buttons) &&
										<div style={{ border: "2px solid red", borderRadius: "5px", padding: "5px", marginBottom: "5px" }}>
											{"Iniciar conversar enviando mensagens com arquivo ou botões não é possível no momento."}
										</div>
									}

									{ (!selectedTemplate.header && !selectedTemplate.buttons) &&
										<>
											<div style={{ border: "1px solid rgba(0, 0, 0, 0.3)", borderRadius: "5px", padding: "5px" }}>
												{selectedTemplate.body}
											</div>

											{ selectedTemplate.footer &&
												<div style={{ border: "1px solid rgba(0, 0, 0, 0.3)", borderTop: "none", borderRadius: "5px", padding: "5px", fontSize: "10px" }}>
													{selectedTemplate.footer}
												</div>
											}

											{ selectedTemplate.mapping && Object.keys(JSON.parse(selectedTemplate.mapping)).length > 0 &&
												<div style={{ border: "1px solid rgba(0, 0, 0, 0.3)", marginTop: "8px", borderRadius: "5px", padding: "5px" }}>
													<Typography>Variáveis: </Typography>
													{ Object.keys(JSON.parse(selectedTemplate.mapping)).map(key => {
														return (
															<div key={key} className={classes.multFieldLine} style={{ marginTop: "5px" }}>
																<Typography>
																	{key}
																</Typography>
																<TextField
																	variant="outlined"
																	fullWidth
																	value={variables[key]}
																	onChange={(e) => { 
																		const value = e.target.value;

																		setVariables(prevVariables => ({
																			...prevVariables, 
																			[key]: value
																		})) 
																	}}
																/>
															</div>
														)
													})}
												</div>
											}
										</>
									}

									{/* { selectedTemplate.buttons &&
										<div style={{ border: "1px solid rgba(0, 0, 0, 0.5)", borderRadius: "5px", padding: "8px", marginTop: "8px" }}>
											<Typography>Botões: </Typography>
											{ JSON.parse(selectedTemplate.buttons).map((button, index) => (
												<Tooltip title={button.type} key={index}>
													<Button
														variant="outlined"
														fullWidth
													>
														{button.text}
													</Button>
												</Tooltip>
											)) }
										</div>
									} */}

									{/* { selectedTemplate.header &&
										<div style={{ border: "1px solid rgba(0, 0, 0, 0.3)", marginTop: "8px", borderRadius: "5px", padding: "5px" }}>
											<Typography>Arquivo: </Typography>
											{ Object.keys(JSON.parse(selectedTemplate.header)).map(key => {
												return (
													<div key={key} className={classes.multFieldLine} style={{ marginTop: "5px" }}>
														<Typography>
															{key}
														</Typography>
														<TextField
															variant="outlined"
															fullWidth
															value={header[key]}
															onChange={(e) => { 
																const value = e.target.value;

																setHeader(prevHeader => ({
																	...prevHeader, 
																	[key]: value
																})) 
															}}
														/>
													</div>
												)
											})}
										</div>
									} */}
								</div>
							}
						</>
					}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						disabled={loading}
						variant="outlined"
					>
						{i18n.t("newTicketModal.buttons.cancel")}
					</Button>
					<ButtonWithSpinner
						variant="contained"
						type="button"
						disabled={(!selectedContact && !contactId) || (official && (!whatsappId || !selectedTemplate) || (selectedTemplate && (selectedTemplate.header || selectedTemplate.buttons)))}
						onClick={() => handleSaveTicket(selectedContact ? selectedContact.id : contactId)}
						color="primary"
						loading={loading}
					>
						{"Criar"}
					</ButtonWithSpinner>
				</DialogActions>
			</Dialog>
		</>
	);
};

export default NewTicketModal;
