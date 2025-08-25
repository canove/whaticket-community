import React from "react";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Skeleton from '@mui/material/Skeleton';
import makeStyles from '@mui/styles/makeStyles';

const useStyles = makeStyles(theme => ({
	customTableCell: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
	},
}));

const TableRowSkeleton = ({ avatar, columns }) => {
	const classes = useStyles();
	return (
        <>
            <TableRow>
				{avatar && (
					<>
						<TableCell style={{ paddingRight: 0 }}>
							<Skeleton
								animation="wave"
								variant="circular"
								width={40}
								height={40}
							/>
						</TableCell>
						<TableCell>
							<Skeleton animation="wave" height={30} width={80} />
						</TableCell>
					</>
				)}
				{Array.from({ length: columns }, (_, index) => (
					<TableCell align="center" key={index}>
						<div className={classes.customTableCell}>
							<Skeleton
								align="center"
								animation="wave"
								height={30}
								width={80}
							/>
						</div>
					</TableCell>
				))}
			</TableRow>
        </>
    );
};

export default TableRowSkeleton;
