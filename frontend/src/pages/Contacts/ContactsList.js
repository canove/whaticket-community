import React, { useState, useEffect } from "react";

import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Avatar from "@material-ui/core/Avatar";
import TableFooter from "@material-ui/core/TableFooter";
import TablePagination from "@material-ui/core/TablePagination";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import Container from "@material-ui/core/Container";
import InputAdornment from "@material-ui/core/InputAdornment";

import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import PaginationActions from "./PaginationActions";
import api from "../../util/api";

const useStyles = makeStyles(theme => ({
	mainContainer: {
		flex: 1,
		// backgroundColor: "#eee",
		padding: theme.spacing(2),
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
			margin: theme.spacing(1),
		},
	},

	mainPaper: {
		height: "87%",
		padding: theme.spacing(2),

		overflowY: "scroll",
		"&::-webkit-scrollbar": {
			width: "8px",
		},
		"&::-webkit-scrollbar-thumb": {
			// borderRadius: "2px",
			boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
			backgroundColor: "#e8e8e8",
		},
	},
}));

const Contacts = () => {
	const classes = useStyles();

	const token = localStorage.getItem("token");
	const userId = localStorage.getItem("userId");

	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [count, setCount] = useState(0);
	const [searchParam, setSearchParam] = useState("");
	const [contacts, setContacts] = useState([]);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchContacts = async () => {
				try {
					const res = await api.get("/contacts/", {
						params: { searchParam, pageNumber: page + 1, rowsPerPage },
					});
					setContacts(res.data.contacts);
					setCount(res.data.count);
					setLoading(false);
				} catch (err) {
					console.log(err);
					alert(err);
				}
			};
			fetchContacts();
		}, 1000);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, page, token, rowsPerPage]);

	const handleChangePage = (event, newPage) => {
		setPage(newPage);
	};

	const handleChangeRowsPerPage = event => {
		setRowsPerPage(+event.target.value);
		setPage(0);
	};

	const handleSearch = event => {
		setSearchParam(event.target.value.toLowerCase());
	};

	return (
		<Container className={classes.mainContainer}>
			<div className={classes.contactsHeader}>
				<h2>Todos os contatos</h2>

				<div className={classes.actionButtons}>
					<TextField
						placeholder="Pesquisar..."
						type="search"
						value={searchParam}
						onChange={handleSearch}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<SearchIcon style={{ color: "gray" }} />
								</InputAdornment>
							),
						}}
					/>
					<Button variant="contained" color="primary">
						Importar contatos
					</Button>
					<Button variant="contained" color="primary">
						Adicionar contato
					</Button>
				</div>
			</div>
			<Paper className={classes.mainPaper}>
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
								<TableCell style={{ paddingRight: 0 }}>
									{<Avatar src={contact.profilePicUrl} />}
								</TableCell>
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
								colSpan={5}
								count={count}
								rowsPerPage={rowsPerPage}
								page={page}
								SelectProps={{
									inputProps: { "aria-label": "rows per page" },
									native: true,
								}}
								onChangePage={handleChangePage}
								onChangeRowsPerPage={handleChangeRowsPerPage}
								ActionsComponent={PaginationActions}
							/>
						</TableRow>
					</TableFooter>
				</Table>
			</Paper>
		</Container>
	);
};

export default Contacts;
