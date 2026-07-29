import React, { useState } from "react";

import {
	Badge,
	Checkbox,
	IconButton,
	ListItemText,
	Menu,
	MenuItem,
	Tooltip,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import FilterListIcon from "@material-ui/icons/FilterList";

import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	filterButton: {
		padding: 6,
		color: theme.palette.text.secondary,
	},
	filterButtonActive: {
		color: theme.palette.primary.main,
	},
}));

// Discrete queue filter: a small icon in the corner that opens a menu with the
// user's queues. A dot marks when a filter is active.
const TicketsQueueSelect = ({ userQueues, selectedQueueIds = [], onChange }) => {
	const classes = useStyles();
	const [anchorEl, setAnchorEl] = useState(null);
	const open = Boolean(anchorEl);

	const handleToggleQueue = queueId => {
		const exists = selectedQueueIds.indexOf(queueId) > -1;
		const next = exists
			? selectedQueueIds.filter(id => id !== queueId)
			: [...selectedQueueIds, queueId];
		onChange(next);
	};

	const isFiltered =
		userQueues?.length > 0 && selectedQueueIds.length < userQueues.length;

	return (
		<>
			<Tooltip title={i18n.t("ticketsQueueSelect.placeholder")}>
				<IconButton
					size="small"
					className={
						isFiltered
							? `${classes.filterButton} ${classes.filterButtonActive}`
							: classes.filterButton
					}
					onClick={e => setAnchorEl(e.currentTarget)}
				>
					<Badge color="primary" variant="dot" invisible={!isFiltered}>
						<FilterListIcon fontSize="small" />
					</Badge>
				</IconButton>
			</Tooltip>
			<Menu
				anchorEl={anchorEl}
				open={open}
				onClose={() => setAnchorEl(null)}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
				getContentAnchorEl={null}
			>
				{userQueues?.length > 0 &&
					userQueues.map(queue => (
						<MenuItem
							dense
							key={queue.id}
							onClick={() => handleToggleQueue(queue.id)}
						>
							<Checkbox
								style={{ color: queue.color }}
								size="small"
								color="primary"
								checked={selectedQueueIds.indexOf(queue.id) > -1}
							/>
							<ListItemText primary={queue.name} />
						</MenuItem>
					))}
			</Menu>
		</>
	);
};

export default TicketsQueueSelect;
