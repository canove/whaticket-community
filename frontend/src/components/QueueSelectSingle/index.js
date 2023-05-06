import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Chip from "@material-ui/core/Chip";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { useTranslation } from "react-i18next";

const useStyles = makeStyles(theme => ({
	chips: {
		display: "flex",
		flexWrap: "wrap",
	},
	chip: {
		margin: 2,
	},
}));

const QueueSelectSingle = ({ selectedQueue, onChange, excludedQueue, label }) => {
	const classes = useStyles();
	const { i18n } = useTranslation();
	const [queues, setQueues] = useState([]);

	useEffect(() => {
		(async () => {
			try {
				const { data } = await api.get("/queue");
				setQueues(data);
			} catch (err) {
				toastError(err);
			}
		})();
	}, []);

	const handleChange = e => {
		onChange(e.target.value);
	};

	return (
		<div style={{ marginTop: 6 }}>
			<FormControl fullWidth margin="dense" variant="outlined">
				<InputLabel>{label}</InputLabel>
				<Select
					label={label}
					value={selectedQueue}
					onChange={handleChange}
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
						if (queue.id == excludedQueue) return;
						return (
							<MenuItem key={queue.id} value={queue.id}>
								{queue.name}
							</MenuItem>
						)
					})}
				</Select>
			</FormControl>
		</div>
	);
};

export default QueueSelectSingle;
