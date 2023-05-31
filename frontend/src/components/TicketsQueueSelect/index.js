import React, { useEffect, useState } from "react";

import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import { Checkbox, ListItemText } from "@material-ui/core";
import { useTranslation } from "react-i18next";
import api from "../../services/api";

const TicketsQueueSelect = ({
	userQueues,
	selectedQueueIds = ["NO_QUEUE"],
	onChange,
}) => {
	const { i18n } = useTranslation();

	const [queues, setQueues] = useState(null);

	useEffect(() => {
		const fetchQueues = async () => {
			try {
				const { data } = await api.get("/queue");
				setQueues(data);
			} catch (err) {

			}
		}

		const checkPermission = async () => {
			try {
				const { data } = await api.get("/profile/check", {
					params: { permission: "tickets-manager:showall" }
				});
	
				if (data) await fetchQueues();
			} catch (err) {
				
			}
		}

		checkPermission();
	}, []);
	
	const handleChange = e => {
		onChange(e.target.value);
	};

	return (
		<div style={{ width: 120, marginTop: -4 }}>
			<FormControl fullWidth margin="dense">
				<Select
					multiple
					displayEmpty
					variant="outlined"
					value={selectedQueueIds}
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
					renderValue={() => i18n.t("ticketsQueueSelect.placeholder")}
				>
					<MenuItem dense value={"NO_QUEUE"}>
						<Checkbox
							style={{
								color: "#7C7C7C",
							}}
							size="small"
							color="primary"
							checked={selectedQueueIds.indexOf("NO_QUEUE") > -1}
						/>
						<ListItemText primary={"Sem Fila"} />
					</MenuItem>
					{queues && queues.length > 0 && queues.map(queue => (
						<MenuItem dense key={queue.id} value={queue.id}>
							<Checkbox
								style={{
									color: queue.color,
								}}
								size="small"
								color="primary"
								checked={selectedQueueIds.indexOf(queue.id) > -1}
							/>
							<ListItemText primary={queue.name} />
						</MenuItem>
					))}
					{!queues && userQueues?.length > 0 &&
						userQueues.map(queue => (
							<MenuItem dense key={queue.id} value={queue.id}>
								<Checkbox
									style={{
										color: queue.color,
									}}
									size="small"
									color="primary"
									checked={selectedQueueIds.indexOf(queue.id) > -1}
								/>
								<ListItemText primary={queue.name} />
							</MenuItem>
						))}
				</Select>
			</FormControl>
		</div>
	);
};

export default TicketsQueueSelect;
