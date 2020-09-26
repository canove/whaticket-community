import React from "react";

import { makeStyles } from "@material-ui/core/styles";
import { Avatar, Card, CardHeader } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";

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
					<Skeleton animation="wave" variant="circle">
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
