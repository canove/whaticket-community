import React, { useState, useEffect } from "react";

import openSocket from "socket.io-client";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";

import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";

import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import UserModal from "../../components/UserModal";
import ConfirmationModal from "../../components/ConfirmationModal";

const useStyles = makeStyles(theme => ({
	mainPaper: {
		flex: 1,
		padding: theme.spacing(1),
		overflowY: "scroll",
		...theme.scrollbarStyles,
	},
}));

const Users = () => {
	const classes = useStyles();

	const [loading, setLoading] = useState(false);
	const [pageNumber, setPageNumber] = useState(1);
	const [selectedUserId, setSelectedUserId] = useState(null);
	const [userModalOpen, setUserModalOpen] = useState(false);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [deletingUser, setDeletingUser] = useState(null);
	const [searchParam, setSearchParam] = useState("");
	const [users, setUsers] = useState([]);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchUsers = async () => {
				try {
					const res = await api.get("/users/", {
						params: { searchParam, pageNumber },
					});
					setUsers(res.data.users);
					setLoading(false);
				} catch (err) {
					console.log(err);
					alert(err);
				}
			};
			fetchUsers();
		}, 500);
		return () => clearTimeout(delayDebounceFn);
	}, [searchParam, pageNumber]);

	useEffect(() => {
		const socket = openSocket(process.env.REACT_APP_BACKEND_URL);
		socket.on("user", data => {
			if (data.action === "update" || data.action === "create") {
				updateUsers(data.user);
			}

			if (data.action === "delete") {
				deleteUser(data.userId);
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

	const updateUsers = user => {
		setUsers(prevState => {
			const userIndex = prevState.findIndex(c => c.id === user.id);

			if (userIndex === -1) {
				return [user, ...prevState];
			}
			const aux = [...prevState];
			aux[userIndex] = user;
			return aux;
		});
	};

	const deleteUser = userId => {
		setUsers(prevState => {
			const userIndex = prevState.findIndex(c => c.id === +userId);

			if (userIndex === -1) return prevState;

			const aux = [...prevState];
			aux.splice(userIndex, 1);
			return aux;
		});
	};

	const handleOpenUserModal = () => {
		setSelectedUserId(null);
		setUserModalOpen(true);
	};

	const handleCloseUserModal = () => {
		setSelectedUserId(null);
		setUserModalOpen(false);
	};

	const handleSearch = event => {
		setSearchParam(event.target.value.toLowerCase());
	};

	const handleEditUser = userId => {
		setSelectedUserId(userId);
		setUserModalOpen(true);
	};

	const handleDeleteUser = async userId => {
		try {
			await api.delete(`/users/${userId}`);
		} catch (err) {
			alert(err);
		}
		setDeletingUser(null);
		setSearchParam("");
		setPageNumber(1);
	};

	return (
		<MainContainer>
			<ConfirmationModal
				title={deletingUser && `Delete ${deletingUser.name}?`}
				open={confirmModalOpen}
				setOpen={setConfirmModalOpen}
				onConfirm={e => handleDeleteUser(deletingUser.id)}
			>
				Are you sure? It canoot be reverted.
			</ConfirmationModal>
			<UserModal
				open={userModalOpen}
				onClose={handleCloseUserModal}
				aria-labelledby="form-dialog-title"
				userId={selectedUserId}
			/>
			<MainHeader>
				<Title>Usuários</Title>
				<MainHeaderButtonsWrapper>
					<TextField
						placeholder="Search..."
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
						onClick={handleOpenUserModal}
					>
						Novo Usuário
					</Button>
				</MainHeaderButtonsWrapper>
			</MainHeader>
			<Paper className={classes.mainPaper} variant="outlined">
				<Table size="small">
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Email</TableCell>
							<TableCell>Profile</TableCell>
							<TableCell align="right">Actions</TableCell>
						</TableRow>
					</TableHead>
					<TableBody>
						{loading ? (
							<TableRowSkeleton />
						) : (
							<>
								{users.map(user => (
									<TableRow key={user.id}>
										<TableCell>{user.name}</TableCell>
										<TableCell>{user.email}</TableCell>
										<TableCell>{user.profile}</TableCell>
										<TableCell align="right">
											<IconButton
												size="small"
												onClick={() => handleEditUser(user.id)}
											>
												<EditIcon />
											</IconButton>

											<IconButton
												size="small"
												onClick={e => {
													setConfirmModalOpen(true);
													setDeletingUser(user);
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
				</Table>
			</Paper>
		</MainContainer>
	);
};

export default Users;
