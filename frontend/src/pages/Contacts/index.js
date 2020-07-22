import React, { useState, useEffect } from "react";

import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import TableContainer from "@material-ui/core/TableContainer";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Grid from "@material-ui/core/Grid";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import FirstPageIcon from "@material-ui/icons/FirstPage";
import KeyboardArrowLeft from "@material-ui/icons/KeyboardArrowLeft";
import KeyboardArrowRight from "@material-ui/icons/KeyboardArrowRight";
import LastPageIcon from "@material-ui/icons/LastPage";

import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

const useStyles1 = makeStyles(theme => ({
	root: {
		flexShrink: 0,
		marginLeft: theme.spacing(2.5),
	},
}));

const TablePaginationActions = ({ count, page, rowsPerPage, onChangePage }) => {
	const classes = useStyles1();

	const handleFirstPageButtonClick = event => {
		onChangePage(event, 0);
	};

	const handleBackButtonClick = event => {
		onChangePage(event, page - 1);
	};

	const handleNextButtonClick = event => {
		onChangePage(event, page + 1);
	};

	const handleLastPageButtonClick = event => {
		onChangePage(event, Math.max(0, Math.ceil(count / rowsPerPage) - 1));
	};

	return (
		<div className={classes.root}>
			<IconButton
				onClick={handleFirstPageButtonClick}
				disabled={page === 0}
				aria-label="first page"
			>
				{<FirstPageIcon />}
			</IconButton>
			<IconButton
				onClick={handleBackButtonClick}
				disabled={page === 0}
				aria-label="previous page"
			>
				{<KeyboardArrowLeft />}
			</IconButton>
			<IconButton
				onClick={handleNextButtonClick}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
				aria-label="next page"
			>
				{<KeyboardArrowRight />}
			</IconButton>
			<IconButton
				onClick={handleLastPageButtonClick}
				disabled={page >= Math.ceil(count / rowsPerPage) - 1}
				aria-label="last page"
			>
				{<LastPageIcon />}
			</IconButton>
		</div>
	);
};

const useStyles = makeStyles(theme => ({
	mainContainer: {
		flex: 1,
		// backgroundColor: "#eee",
		padding: theme.spacing(4),
		height: `calc(100% - 48px)`,
		overflowY: "hidden",
	},

	contactsHeader: {
		display: "flex",
		alignItems: "center",
		padding: "0px 6px 6px 6px",
	},

	actionButtons: {
		marginLeft: "auto",
		"& > *": {
			margin: theme.spacing(0.5),
		},
	},

	mainPaper: {
		height: "100%",
		overflowY: "scroll",
	},
}));

const Contacts = () => {
	const classes = useStyles();
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(5);
	const [contacts, setContacts] = useState([
		// {
		// 	id: 1,
		// 	name: "Cassio",
		// 	number: "5513991428988",
		// 	profilePicUrl:
		// 		"https://pps.whatsapp.net/v/t61.24694-24/69475768_2460671290686732_6259438857054322688_n.jpg?oh=ec972d658eae256f9d0675852d8cf9a3&oe=5F1CDD33",
		// 	createdAt: "2020-07-17T16:16:59.000Z",
		// 	updatedAt: "2020-07-22T12:23:58.000Z",
		// },
		// {
		// 	id: 2,
		// 	name: "Luana",
		// 	number: "5513991264923",
		// 	profilePicUrl: null,
		// 	createdAt: "2020-07-17T17:48:01.000Z",
		// 	updatedAt: "2020-07-17T17:48:01.000Z",
		// },
		// {
		// 	id: 3,
		// 	name: "551333074319",
		// 	number: "551333074319",
		// 	profilePicUrl:
		// 		"https://pps.whatsapp.net/v/t61.24694-24/56106113_757880717947097_7376625555153616896_n.jpg?oh=287b4d0de2810cca361af7eaa1381076&oe=5F1ABC3A",
		// 	createdAt: "2020-07-17T18:13:15.000Z",
		// 	updatedAt: "2020-07-20T19:44:33.000Z",
		// },
		// {
		// 	id: 1,
		// 	name: "Cassio",
		// 	number: "5513991428988",
		// 	profilePicUrl:
		// 		"https://pps.whatsapp.net/v/t61.24694-24/69475768_2460671290686732_6259438857054322688_n.jpg?oh=ec972d658eae256f9d0675852d8cf9a3&oe=5F1CDD33",
		// 	createdAt: "2020-07-17T16:16:59.000Z",
		// 	updatedAt: "2020-07-22T12:23:58.000Z",
		// },
		// {
		// 	id: 2,
		// 	name: "Luana",
		// 	number: "5513991264923",
		// 	profilePicUrl: null,
		// 	createdAt: "2020-07-17T17:48:01.000Z",
		// 	updatedAt: "2020-07-17T17:48:01.000Z",
		// },
		// {
		// 	id: 3,
		// 	name: "551333074319",
		// 	number: "551333074319",
		// 	profilePicUrl:
		// 		"https://pps.whatsapp.net/v/t61.24694-24/56106113_757880717947097_7376625555153616896_n.jpg?oh=287b4d0de2810cca361af7eaa1381076&oe=5F1ABC3A",
		// 	createdAt: "2020-07-17T18:13:15.000Z",
		// 	updatedAt: "2020-07-20T19:44:33.000Z",
		// },
		// {
		// 	id: 1,
		// 	name: "Cassio",
		// 	number: "5513991428988",
		// 	profilePicUrl:
		// 		"https://pps.whatsapp.net/v/t61.24694-24/69475768_2460671290686732_6259438857054322688_n.jpg?oh=ec972d658eae256f9d0675852d8cf9a3&oe=5F1CDD33",
		// 	createdAt: "2020-07-17T16:16:59.000Z",
		// 	updatedAt: "2020-07-22T12:23:58.000Z",
		// },
		// {
		// 	id: 2,
		// 	name: "Luana",
		// 	number: "5513991264923",
		// 	profilePicUrl: null,
		// 	createdAt: "2020-07-17T17:48:01.000Z",
		// 	updatedAt: "2020-07-17T17:48:01.000Z",
		// },
		// {
		// 	id: 3,
		// 	name: "551333074319",
		// 	number: "551333074319",
		// 	profilePicUrl:
		// 		"https://pps.whatsapp.net/v/t61.24694-24/56106113_757880717947097_7376625555153616896_n.jpg?oh=287b4d0de2810cca361af7eaa1381076&oe=5F1ABC3A",
		// 	createdAt: "2020-07-17T18:13:15.000Z",
		// 	updatedAt: "2020-07-20T19:44:33.000Z",
		// },
		{
			id: 1,
			name: "Cassio",
			number: "5513991428988",
			profilePicUrl:
				"https://pps.whatsapp.net/v/t61.24694-24/69475768_2460671290686732_6259438857054322688_n.jpg?oh=ec972d658eae256f9d0675852d8cf9a3&oe=5F1CDD33",
			createdAt: "2020-07-17T16:16:59.000Z",
			updatedAt: "2020-07-22T12:23:58.000Z",
		},
		{
			id: 2,
			name: "Luana",
			number: "5513991264923",
			profilePicUrl: null,
			createdAt: "2020-07-17T17:48:01.000Z",
			updatedAt: "2020-07-17T17:48:01.000Z",
		},
		{
			id: 3,
			name: "551333074319",
			number: "551333074319",
			profilePicUrl:
				"https://pps.whatsapp.net/v/t61.24694-24/56106113_757880717947097_7376625555153616896_n.jpg?oh=287b4d0de2810cca361af7eaa1381076&oe=5F1ABC3A",
			createdAt: "2020-07-17T18:13:15.000Z",
			updatedAt: "2020-07-20T19:44:33.000Z",
		},
		{
			id: 1,
			name: "Cassio",
			number: "5513991428988",
			profilePicUrl:
				"https://pps.whatsapp.net/v/t61.24694-24/69475768_2460671290686732_6259438857054322688_n.jpg?oh=ec972d658eae256f9d0675852d8cf9a3&oe=5F1CDD33",
			createdAt: "2020-07-17T16:16:59.000Z",
			updatedAt: "2020-07-22T12:23:58.000Z",
		},
		{
			id: 2,
			name: "Luana",
			number: "5513991264923",
			profilePicUrl: null,
			createdAt: "2020-07-17T17:48:01.000Z",
			updatedAt: "2020-07-17T17:48:01.000Z",
		},
		{
			id: 3,
			name: "551333074319",
			number: "551333074319",
			profilePicUrl:
				"https://pps.whatsapp.net/v/t61.24694-24/56106113_757880717947097_7376625555153616896_n.jpg?oh=287b4d0de2810cca361af7eaa1381076&oe=5F1ABC3A",
			createdAt: "2020-07-17T18:13:15.000Z",
			updatedAt: "2020-07-20T19:44:33.000Z",
		},
	]);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = event => {
		setRowsPerPage(parseInt(event.target.value, 10));
		setPage(0);
	};

	return (
		<div className={classes.mainContainer}>
			<Paper className={classes.mainPaper}>
				<div className={classes.contactsHeader}>
					<h2>Todos os contatos</h2>
					<div className={classes.actionButtons}>
						<Button variant="contained" color="primary">
							Importar contatos
						</Button>
						<Button variant="contained" color="primary">
							Adicionar contato
						</Button>
					</div>
				</div>
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell padding="checkbox" />
							<TableCell>Nome</TableCell>
							<TableCell>Telefone</TableCell>
							<TableCell>Email</TableCell>
							<TableCell align="right">Ações</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{contacts.map(contact => (
							<TableRow key={contact.id}>
								<TableCell style={{ paddingRight: 0 }}>{<Avatar />}</TableCell>
								<TableCell>{contact.name}</TableCell>
								<TableCell>{contact.number}</TableCell>
								<TableCell>{contact.updatedAt}</TableCell>
								<TableCell align="right">
									<IconButton size="small">
										<EditIcon />
									</IconButton>
									<IconButton size="small">
										<DeleteOutlineIcon />
									</IconButton>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
					<TableFooter>
						<TableRow>
							<TablePagination
								rowsPerPageOptions={[5, 10, 25, { label: "All", value: -1 }]}
								colSpan={5}
								count={contacts.length}
								rowsPerPage={rowsPerPage}
								page={page}
								SelectProps={{
									inputProps: { "aria-label": "rows per page" },
									native: true,
								}}
								onChangePage={handleChangePage}
								onChangeRowsPerPage={handleChangeRowsPerPage}
								ActionsComponent={TablePaginationActions}
							/>
						</TableRow>
					</TableFooter>
				</Table>
			</Paper>
		</div>
	);
};

export default Contacts;
