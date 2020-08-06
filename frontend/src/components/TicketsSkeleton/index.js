import React from "react";

import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import Divider from "@material-ui/core/Divider";
import Skeleton from "@material-ui/lab/Skeleton";

const TicketsSkeleton = () => {
	return (
		<>
			<ListItem dense>
				<ListItemAvatar>
					<Skeleton animation="wave" variant="circle" width={40} height={40} />
				</ListItemAvatar>
				<ListItemText
					primary={<Skeleton animation="wave" height={20} width={60} />}
					secondary={<Skeleton animation="wave" height={20} width={90} />}
				/>
			</ListItem>
			<Divider variant="inset" />
			<ListItem dense>
				<ListItemAvatar>
					<Skeleton animation="wave" variant="circle" width={40} height={40} />
				</ListItemAvatar>
				<ListItemText
					primary={<Skeleton animation="wave" height={20} width={70} />}
					secondary={<Skeleton animation="wave" height={20} width={120} />}
				/>
			</ListItem>
			<Divider variant="inset" />
			<ListItem dense>
				<ListItemAvatar>
					<Skeleton animation="wave" variant="circle" width={40} height={40} />
				</ListItemAvatar>
				<ListItemText
					primary={<Skeleton animation="wave" height={20} width={60} />}
					secondary={<Skeleton animation="wave" height={20} width={90} />}
				/>
			</ListItem>
			<Divider variant="inset" />
		</>
	);
};

export default TicketsSkeleton;
