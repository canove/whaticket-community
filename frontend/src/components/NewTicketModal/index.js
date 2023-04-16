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

import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import ButtonWithSpinner from "../ButtonWithSpinner";
import ContactModal from "../ContactModal";
import GroupModal from "../GroupModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";

const filter = createFilterOptions({
	trim: true,
});

const NewTicketModal = ({ modalOpen, onClose }) => {
	const history = useHistory();

	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [selectedContact, setSelectedContact] = useState(null);
	const [newContact, setNewContact] = useState({});
	const [contactModalOpen, setContactModalOpen] = useState(false);
	const [groupModalOpen, setGroupModalOpen] = useState(false);
	const [choiceInput, setChoiceInput] = useState('ticket');
  const [listSelectd, setListSelectd] = useState([])
	const { user } = useContext(AuthContext);
	// console.log(listSelectd)

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
					let filter = data.contacts;
					if (choiceInput !== 'ticket') {
						filter = data.contacts.filter((e, i) => e.isGroup === false)
					}
					if (choiceInput !== 'ticket' && options.length > 0) {
						filter = filter.filter((e, i) => e.number !== options[i].number);
					}
					// console.log(filter)
					setOptions(filter);
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
		setListSelectd([]);
	};

	const handleSaveTicket = async contactId => {
		if (!contactId) return;
		setLoading(true);
		try {
			const { data: ticket } = await api.post("/tickets", {
				contactId: contactId,
				userId: user.id,
				status: "open",
			});
			history.push(`/tickets/${ticket.id}`);
		} catch (err) {
			toastError(err);
		}
		setLoading(false);
		handleClose();
	};

	const handleSelectOption = (e, newValue) => {
		// console.log(newValue)
		if (newValue?.number) {
			setSelectedContact(newValue);
		} 
		else if (newValue?.name) {
			setNewContact({ name: newValue.name });
			setContactModalOpen(true);
		}
	};

	const handleListSelectd = (e, newValue) => {
		// console.log(newValue)
		if (newValue?.number && !listSelectd.some(e => e.number === newValue.number)) {
			setListSelectd([...listSelectd, `${newValue.number}@c.us`]);
		}
	}

	const handleCloseContactModal = () => {
		setContactModalOpen(false);
	};

	const handleCloseGroupModal = () => {
		setGroupModalOpen(false);
	};

	const handleAddNewContactTicket = contact => {
		handleSaveTicket(contact.id);
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
			<GroupModal
				open={groupModalOpen}
				initialValues={listSelectd}
				onClose={handleCloseGroupModal}
				onSave={handleAddNewContactTicket}
			/>
			<ContactModal
				open={contactModalOpen}
				initialValues={newContact}
				onClose={handleCloseContactModal}
				onSave={handleAddNewContactTicket}
			/>
			<Dialog open={modalOpen} onClose={handleClose}>
				<div 
					style={ { display: 'flex', width: '100%', justifyContent: 'space-around' } } 
				>
					<DialogTitle 
						onClick={() => {
							setOptions([]);
							setListSelectd([])
							setChoiceInput('ticket')
						}}
						style={ { cursor: 'pointer' } }
						id="form-dialog-title"
					>
						{i18n.t("newTicketModal.title")}
					</DialogTitle>
					<DialogTitle 
						id="form-dialog-title"
						style={ { cursor: 'pointer' } }
						onClick={() => {
							setOptions([]);
							setChoiceInput('group')
						}} 
					>
						Criar Grupo
					</DialogTitle>
				</div>
				{ choiceInput === 'ticket'
				? (
					<>
						<DialogContent dividers>
						<Autocomplete
							options={options}
							loading={loading}
							style={{ width: 300 }}
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
												{params.InputProps.endAdornment}
											</React.Fragment>
										),
									}}
								/>
							)}
						/>
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
								disabled={!selectedContact}
								onClick={() => handleSaveTicket(selectedContact.id)}
								color="primary"
								loading={loading}
							>
								{i18n.t("newTicketModal.buttons.ok")}
							</ButtonWithSpinner>
						</DialogActions>
					</>
					) 
					: (
						<>
							<DialogContent dividers>
							<Autocomplete
								options={options}
								loading={loading}
								style={{ width: 300 }}
								clearOnBlur
								autoHighlight
								freeSolo
								clearOnEscape
								getOptionLabel={renderOptionLabel}
								renderOption={renderOption}
								// filterOptions={createAddContactOption}
								onChange={(e, newValue) => handleListSelectd(e, newValue)}
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
													{params.InputProps.endAdornment}
												</React.Fragment>
											),
										}}
									/>
								)}
							/>
						<p>total adicionado: {listSelectd.length}</p>
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
								disabled={!listSelectd.length > 0}
								onClick={() => setGroupModalOpen(true)}
								color="primary"
								loading={loading}
							>
								Próximo
							</ButtonWithSpinner>
						</DialogActions>
					</>
				)}
			</Dialog>
		</>
	);
};

export default NewTicketModal;
