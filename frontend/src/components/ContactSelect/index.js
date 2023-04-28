import React, { useEffect, useState } from "react";

import Chip from "@material-ui/core/Chip";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import Select from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";

import toastError from "../../errors/toastError";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	chips: {
		display: "flex",
		flexWrap: "wrap",
	},
	chip: {
		margin: 2,
	},
}));

const ContactSelect = ({ selectedContacts, onChange }) => {
	const classes = useStyles();
	const [contacts, setContacts] = useState([]);

	const handleChange = e => {
		onChange(e.target.value);
	};

	useEffect(() => {
		(async () => {
			try {
				let hasMore = true;
				let pageNumber = 1;
				let dataContacts = [];

				while (hasMore) {
					const { data } = await api.get(`/contacts?pageNumber=${pageNumber}`);
					dataContacts = dataContacts.concat(data?.contacts);
					dataContacts.sort((a, b) => {
						if (a.name.toLowerCase() > b.name.toLowerCase()) return 1
						return -1
					});

					if (!data.hasMore) {
						hasMore = data?.hasMore;
						break;
					}
					pageNumber += 1;
				}
				setContacts(dataContacts);
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	return (
		<div style={{ marginTop: 6 }}>
			<FormControl fullWidth margin="dense" variant="outlined">
				<InputLabel>{i18n.t("contactSelect.inputLabel")}</InputLabel>
				<Select
					multiple
					labelWidth={60}
					value={selectedContacts}
					onChange={handleChange}
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
					renderValue={selected => (
						<div className={classes.chips}>
							{selected?.length > 0 &&
								selected.map(id => {
									const contact = contacts.find(q => q.id === id);
									return contact ? (
										<Chip
											key={id}
											style={{ backgroundColor: contact.color }}
											variant="outlined"
											label={contact.name}
											className={classes.chip}
										/>
									) : null;
								})}
						</div>
					)}
				>
					{contacts.map(contact => (
						<MenuItem key={contact.id} value={contact.id}>
							{contact.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
};

export default ContactSelect;
