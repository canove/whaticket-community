import React from "react";

import makeStyles from '@mui/styles/makeStyles';
import { Avatar, Card, CardHeader } from "@mui/material";
import Skeleton from '@mui/material/Skeleton';

const useStyles = makeStyles(theme => ({
	ticketHeader: {
		display: "flex",
		backgroundColor: "#eee",
		flex: "none",
		borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
	},
}));

const TicketHeaderSkeleton = () => {
	const classes = useStyles();

	return (
        <Card square className={classes.ticketHeader}>
            <CardHeader
				titleTypographyProps={{ noWrap: true }}
				subheaderTypographyProps={{ noWrap: true }}
				avatar={
					<Skeleton animation="wave" variant="circular">
						<Avatar alt="contact_image" />
					</Skeleton>
				}
				title={<Skeleton animation="wave" width={80} />}
				subheader={<Skeleton animation="wave" width={140} />}
			/>
        </Card>
    );
};

export default TicketHeaderSkeleton;
