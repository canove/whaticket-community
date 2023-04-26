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

const QuickAnswerSelect = ({ selectedUsers, onChange }) => {
	const classes = useStyles();
	const [users, setUsers] = useState([]);

	const handleChange = e => {
		onChange(e.target.value);
	};

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/users");
				data.users.sort((a, b) => {
					if (a.name > b.name) return 1
					return -1
				});
				setUsers(data?.users);
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	return (
		<div style={{ marginTop: 6 }}>
			<FormControl fullWidth margin="dense" variant="outlined">
				<InputLabel>{i18n.t("quickAnswersSelect.inputLabel")}</InputLabel>
				<Select
					multiple
					labelWidth={60}
					value={selectedUsers}
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
									const user = users.find(q => q.id === id);
									return user ? (
										<Chip
											key={id}
											style={{ backgroundColor: user.color }}
											variant="outlined"
											label={user.name}
											className={classes.chip}
										/>
									) : null;
								})}
						</div>
					)}
				>
					{users.map(user => (
						<MenuItem key={user.id} value={user.id}>
							{user.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
};

export default QuickAnswerSelect;
