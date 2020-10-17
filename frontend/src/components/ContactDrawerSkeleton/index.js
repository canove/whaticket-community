import React from "react";
import Skeleton from "@material-ui/lab/Skeleton";
import Typography from "@material-ui/core/Typography";
import Paper from "@material-ui/core/Paper";
import { i18n } from "../../translate/i18n";

const ContactDrawerSkeleton = ({ classes }) => {
	return (
		<div className={classes.content}>
			<Paper square variant="outlined" className={classes.contactHeader}>
				<Skeleton
					animation="wave"
					variant="circle"
					width={160}
					height={160}
					className={classes.contactAvatar}
				/>
				<Skeleton animation="wave" height={25} width={90} />
				<Skeleton animation="wave" height={25} width={80} />
				<Skeleton animation="wave" height={25} width={80} />
			</Paper>
			<Paper square className={classes.contactDetails}>
				<Typography variant="subtitle1">
					{i18n.t("contactDrawer.extraInfo")}
				</Typography>
				<Paper square variant="outlined" className={classes.contactExtraInfo}>
					<Skeleton animation="wave" height={20} width={60} />
					<Skeleton animation="wave" height={20} width={160} />
				</Paper>
				<Paper square variant="outlined" className={classes.contactExtraInfo}>
					<Skeleton animation="wave" height={20} width={60} />
					<Skeleton animation="wave" height={20} width={160} />
				</Paper>
				<Paper square variant="outlined" className={classes.contactExtraInfo}>
					<Skeleton animation="wave" height={20} width={60} />
					<Skeleton animation="wave" height={20} width={160} />
				</Paper>
			</Paper>
		</div>
	);
};

export default ContactDrawerSkeleton;
