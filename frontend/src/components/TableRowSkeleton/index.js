import React from "react";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Skeleton from "@material-ui/lab/Skeleton";

const TableRowSkeleton = () => {
	return (
		<>
			<TableRow>
				<TableCell style={{ paddingRight: 0 }}>
					<Skeleton animation="wave" variant="circle" width={40} height={40} />
				</TableCell>
				<TableCell>
					<Skeleton animation="wave" height={20} width={80} />
				</TableCell>
				<TableCell>
					<Skeleton animation="wave" height={20} width={80} />
				</TableCell>
				<TableCell>
					<Skeleton animation="wave" height={20} width={80} />
				</TableCell>
				<TableCell></TableCell>
			</TableRow>
		</>
	);
};

export default TableRowSkeleton;
