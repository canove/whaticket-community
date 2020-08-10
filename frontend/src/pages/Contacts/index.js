import React, { useState, useEffect } from "react";
import openSocket from "socket.io-client";

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
import Typography from "@material-ui/core/Typography";

import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import PaginationActions from "../../components/PaginationActions";
import api from "../../services/api";
import ContactsSekeleton from "../../components/ContactsSekeleton";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal/";

let socket;

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
			height: "8px",
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

	const [loading, setLoading] = useState(true);
	const [page, setPage] = useState(0);
	const [rowsPerPage, setRowsPerPage] = useState(10);
	const [count, setCount] = useState(0);
	const [searchParam, setSearchParam] = useState("");
	const [contacts, setContacts] = useState([]);
	const [selectedContactId, setSelectedContactId] = useState(null);
	const [contactModalOpen, setContactModalOpen] = useState(false);
	const [deletingContact, setDeletingContact] = useState(null);
	const [confirmOpen, setConfirmOpen] = useState(false);

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
	}, [searchParam, page, rowsPerPage]);

	useEffect(() => {
		socket = openSocket(process.env.REACT_APP_BACKEND_URL);
		return () => {
			socket.disconnect();
		};
	}, []);

	useEffect(() => {
		socket.on("contact", data => {
			if ((data.action === "update" || data.action === "create") && !loading) {
				updateContacts(data.contact);
			}

			if (data.action === "delete" && !loading) {
				deleteContact(data.contactId);
			}
		});
	}, [loading]);

	const updateContacts = contact => {
		setContacts(prevState => {
			const contactIndex = prevState.findIndex(c => c.id === contact.id);

			if (contactIndex === -1) {
				return [contact, ...prevState];
			}
			const aux = [...prevState];
			aux[contactIndex] = contact;
			return aux;
		});
	};

	const deleteContact = contactId => {
		setContacts(prevState => {
			const contactIndex = prevState.findIndex(c => c.id === +contactId);

			if (contactIndex === -1) return prevState;

			const aux = [...prevState];
			aux.splice(contactIndex, 1);
			return aux;
		});
	};

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

	const handleOpenContactModal = () => {
		setSelectedContactId(null);
		setContactModalOpen(true);
	};

	const handleCloseContactModal = () => {
		setSelectedContactId(null);
		setContactModalOpen(false);
	};

	const hadleEditContact = contactId => {
		setSelectedContactId(contactId);
		setContactModalOpen(true);
	};

	const handleDeleteContact = async contactId => {
		try {
			await api.delete(`/contacts/${contactId}`);
		} catch (err) {
			alert(err);
		}
		setDeletingContact(null);
		setSearchParam("");
		setPage(0);
	};

	const handleimportContact = async () => {
		try {
			await api.post("/contacts/import");
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<Container className={classes.mainContainer}>
			<ContactModal
				open={contactModalOpen}
				onClose={handleCloseContactModal}
				aria-labelledby="form-dialog-title"
				contactId={selectedContactId}
			></ContactModal>
			<ConfirmationModal
				title={
					deletingContact
						? `Deletar ${deletingContact.name}?`
						: `Importar contatos`
				}
				open={confirmOpen}
				setOpen={setConfirmOpen}
				onConfirm={e =>
					deletingContact
						? handleDeleteContact(deletingContact.id)
						: handleimportContact()
				}
			>
				{deletingContact
					? "Tem certeza que deseja deletar este contato? Todos os tickets relacionados serão perdidos."
					: "Deseja importas todos os contatos do telefone? Essa função é experimental, você terá que recarregar a página após a importação "}
			</ConfirmationModal>
			<div className={classes.contactsHeader}>
				<Typography variant="h5" gutterBottom>
					Contatos
				</Typography>

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
					<Button
						variant="contained"
						color="primary"
						onClick={e => setConfirmOpen(true)}
					>
						Importar contatos
					</Button>
					<Button
						variant="contained"
						color="primary"
						onClick={handleOpenContactModal}
					>
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
							<TableCell>Whatsapp</TableCell>
							<TableCell>Email</TableCell>
							<TableCell align="right">Ações</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<ContactsSekeleton />
						) : (
							<>
								{contacts.map(contact => (
									<TableRow key={contact.id}>
										<TableCell style={{ paddingRight: 0 }}>
											{<Avatar src={contact.profilePicUrl} />}
										</TableCell>
										<TableCell>{contact.name}</TableCell>
										<TableCell>{contact.number}</TableCell>
										<TableCell>{contact.email}</TableCell>
										<TableCell align="right">
											<IconButton
												size="small"
												onClick={() => hadleEditContact(contact.id)}
											>
												<EditIcon />
											</IconButton>

											<IconButton
												size="small"
												onClick={e => {
													setConfirmOpen(true);
													setDeletingContact(contact);
												}}
											>
												<DeleteOutlineIcon />
											</IconButton>
										</TableCell>
									</TableRow>
								))}
							</>
						)}
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
