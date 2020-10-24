import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

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

const filter = createFilterOptions({
	trim: true,
});

const NewTicketModal = ({ modalOpen, onClose }) => {
	const history = useHistory();
	const userId = +localStorage.getItem("userId");

	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [selectedContact, setSelectedContact] = useState(null);
	const [newContact, setNewContact] = useState({});
	const [contactModalOpen, setContactModalOpen] = useState(false);

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
					const errorMsg = err.response?.data?.error;
					if (errorMsg) {
						if (i18n.exists(`backendErrors.${errorMsg}`)) {
							toast.error(i18n.t(`backendErrors.${errorMsg}`));
						} else {
							toast.error(err.response.data.error);
						}
					} else {
						toast.error("Unknown error");
					}
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
	};

	const handleSaveTicket = async contactId => {
		if (!contactId) return;
		setLoading(true);
		try {
			const { data: ticket } = await api.post("/tickets", {
				contactId: contactId,
				userId: userId,
				status: "open",
			});
			history.push(`/tickets/${ticket.id}`);
		} catch (err) {
			const errorMsg = err.response?.data?.error;
			if (errorMsg) {
				if (i18n.exists(`backendErrors.${errorMsg}`)) {
					toast.error(i18n.t(`backendErrors.${errorMsg}`));
				} else {
					toast.error(err.response.data.error);
				}
			} else {
				toast.error("Unknown error");
			}
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

	const handleAddNewContactTicket = contact => {
		handleSaveTicket(contact.id);
	};

	const createAddContactOption = (options, params) => {
		const filtered = filter(options, params);

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
			></ContactModal>
			<Dialog open={modalOpen} onClose={handleClose}>
				<DialogTitle id="form-dialog-title">
					{i18n.t("newTicketModal.title")}
				</DialogTitle>
				<DialogContent dividers>
					<Autocomplete
						options={options}
						loading={loading}
						style={{ width: 300 }}
						clearOnBlur
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
			</Dialog>
		</>
	);
};

export default NewTicketModal;
