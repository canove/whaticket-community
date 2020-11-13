import React from "react";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Skeleton from "@material-ui/lab/Skeleton";
import { makeStyles } from "@material-ui/core";

const useStyles = makeStyles(theme => ({
	customTableCell: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
}));

const TableRowSkeleton = () => {
	const classes = useStyles();
	return (
		<>
			<TableRow>
				<TableCell style={{ paddingRight: 0 }}>
					<Skeleton animation="wave" variant="circle" width={40} height={40} />
				</TableCell>
				<TableCell>
					<Skeleton animation="wave" height={20} width={80} />
				</TableCell>
				<TableCell align="center">
					<div className={classes.customTableCell}>
						<Skeleton align="center" animation="wave" height={20} width={80} />
					</div>
				</TableCell>
				<TableCell align="center">
					<div className={classes.customTableCell}>
						<Skeleton align="center" animation="wave" height={20} width={80} />
					</div>
				</TableCell>
				<TableCell align="center">
					<div className={classes.customTableCell}>
						<Skeleton align="center" animation="wave" height={20} width={80} />
					</div>
				</TableCell>
			</TableRow>
		</>
	);
};

export default TableRowSkeleton;
