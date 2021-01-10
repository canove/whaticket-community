import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import Chip from "@material-ui/core/Chip";
import { OutlinedInput } from "@material-ui/core";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const useStyles = makeStyles(theme => ({
	chips: {
		display: "flex",
		flexWrap: "wrap",
	},
	chip: {
		margin: 2,
	},
}));

const QueueSelector = ({ selectedQueueIds, onChange }) => {
	const classes = useStyles();
	// const [selectedQueues, setSelectedQueues] = useState([]);
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

	const handleChange = event => {
		onChange(event.target.value);
	};

	return (
		<div style={{ marginTop: 6 }}>
			<FormControl fullWidth variant="outlined">
				<InputLabel>Filas</InputLabel>
				<Select
					multiple
					value={selectedQueueIds}
					onChange={handleChange}
					input={<OutlinedInput label="Filas" id="select-multiple-chip" />}
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
							{selected.length > 0 &&
								selected.map(value => {
									const queue = queues.find(q => q.id === value);
									return queue ? (
										<Chip
											key={value}
											style={{ backgroundColor: queue.color }}
											variant="outlined"
											label={queue.name}
											className={classes.chip}
										/>
									) : null;
								})}
						</div>
					)}
				>
					{queues.map(queue => (
						<MenuItem key={queue.id} value={queue.id}>
							{queue.name}
						</MenuItem>
					))}
				</Select>
			</FormControl>
		</div>
	);
};

export default QueueSelector;
