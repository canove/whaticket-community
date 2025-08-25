import React from "react";

import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import ListItemAvatar from "@mui/material/ListItemAvatar";
import Divider from "@mui/material/Divider";
import Skeleton from '@mui/material/Skeleton';

const TicketsSkeleton = () => {
	return (
        <>
            <ListItem dense>
				<ListItemAvatar>
					<Skeleton animation="wave" variant="circular" width={40} height={40} />
				</ListItemAvatar>
				<ListItemText
					primary={<Skeleton animation="wave" height={20} width={60} />}
					secondary={<Skeleton animation="wave" height={20} width={90} />}
				/>
			</ListItem>
            <Divider variant="inset" />
            <ListItem dense>
				<ListItemAvatar>
					<Skeleton animation="wave" variant="circular" width={40} height={40} />
				</ListItemAvatar>
				<ListItemText
					primary={<Skeleton animation="wave" height={20} width={70} />}
					secondary={<Skeleton animation="wave" height={20} width={120} />}
				/>
			</ListItem>
            <Divider variant="inset" />
            <ListItem dense>
				<ListItemAvatar>
					<Skeleton animation="wave" variant="circular" width={40} height={40} />
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
