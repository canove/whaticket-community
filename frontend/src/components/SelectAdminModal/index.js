import React, { useState, useEffect } from "react";
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

const filterOptions = createFilterOptions({
	trim: true,
});

const SelectAdminModal = ({ modalOpen, onClose, ticketid, ticketWhatsappId }) => {
	const history = useHistory();
	const [options, setOptions] = useState([]);
	const [loading, setLoading] = useState(false);
	const [searchParam, setSearchParam] = useState("");
	const [listSelectd, setListSelectd] = useState([])
	// console.log(listSelectd)
	const numberOfGroup = history.location.pathname.split('/')[2];

	useEffect(() => {
		if (!modalOpen || searchParam.length < 3) {
			setLoading(false);
			return;
		}
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchMembers = async () => {
				const { data } = await api.get("contacts", {
					params: { searchParam },
				});
				let contacts;
				if (data.contacts.length === 0) {
					setOptions([]);
					setLoading(false);
					return;
				}	else {contacts = data.contacts}
				const { data: { contact: { number } } } = await api.get(`/tickets/${numberOfGroup}`)
				const { data: { groupMetadata: { participants } } } = await api.get(`/group/${number}@g.us`)
				// console.log(contacts)
				// console.log(participants)
				const filter = participants.filter((e, i) => Number(e.id.user) === Number(contacts[i > contacts.length - 1 ? contacts.length - 1 : i].number));
				// console.log(filter);
				let filter2 = []
				filter.forEach(e => {
					filter2.push(e.id.user);
				})
				let filter3 = contacts.filter(e => filter2.includes(e.number));
				// console.log(filter3);
				if (listSelectd.length > 0) {
					filter3 = filter3.filter((e, i) => !listSelectd.includes(`${e.number}@c.us`));
				}
				// console.log(filter3);
				setOptions(filter3);
				setLoading(false);
			};

			fetchMembers();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, modalOpen]);

	const handleClose = () => {
		onClose();
		setSearchParam("");
	};

	const handleAdmin = async () => {
		const { data: { contact: { number } } } = await api.get(`/tickets/${numberOfGroup}`)
		await api.put('/group/promoveAdmin', {
			chatID: `${number}@g.us`,
			peoples: listSelectd
		})
		handleClose();
	}

	const handleListSelectd = (e, newValue) => {
		if (newValue?.number && !listSelectd.some(e => e === `${newValue.number}@c.us`)) {
			// console.log(!listSelectd.some(e => e === `${newValue.number}@c.us`))
			setListSelectd([...listSelectd, `${newValue.number}@c.us`]);
		}
	}

	return (
		<Dialog open={modalOpen} onClose={handleClose} maxWidth="lg" scroll="paper">
				<DialogTitle id="form-dialog-title">
					Tornar pessoas admin
				</DialogTitle>
				<DialogContent dividers>
					<Autocomplete
						style={{ width: 300, marginBottom: 20 }}
						getOptionLabel={option => `${option.name}`}	
						onChange={(_e, newValue) => handleListSelectd(_e, newValue)}
						options={options}
						filterOptions={filterOptions}
						freeSolo
						autoHighlight
						noOptionsText={i18n.t("transferTicketModal.noOptions")}
						loading={loading}
						renderInput={params => (
							<TextField
								{...params}
								label={i18n.t("transferTicketModal.fieldLabel")}
								variant="outlined"
								required
								autoFocus
								onChange={e => setSearchParam(e.target.value)}
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
					<p>Total selecionado: {listSelectd.length}</p>
				</DialogContent>
				<DialogActions>
					<Button
						onClick={handleClose}
						color="secondary"
						disabled={loading}
						variant="outlined"
					>
						{i18n.t("transferTicketModal.buttons.cancel")}
					</Button>
					<ButtonWithSpinner
						variant="contained"
						type="button"
						color="primary"
						onClick={ handleAdmin }
						disabled={ loading || !listSelectd.length > 0 }
						loading={loading}
					>
						Tornar Admin
					</ButtonWithSpinner>
				</DialogActions>
		</Dialog>
	);
};

export default SelectAdminModal;
