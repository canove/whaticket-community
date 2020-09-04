import React, { useState, useEffect, useReducer } from "react";

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

const reducer = (state, action) => {
	if (action.type === "LOAD_USERS") {
		const users = action.payload;
		const newUsers = [];

		users.forEach(user => {
			const userIndex = state.findIndex(u => u.id === user.id);
			if (userIndex !== -1) {
				state[userIndex] = user;
			} else {
				newUsers.push(user);
			}
		});

		return [...state, ...newUsers];
	}

	if (action.type === "UPDATE_USERS") {
		const user = action.payload;
		const userIndex = state.findIndex(u => u.id === user.id);

		if (userIndex !== -1) {
			state[userIndex] = user;
			return [...state];
		} else {
			return [user, ...state];
		}
	}

	if (action.type === "DELETE_USER") {
		const userId = action.payload;

		const userIndex = state.findIndex(u => u.id === userId);
		if (userIndex !== -1) {
			state.splice(userIndex, 1);
		}
		return [...state];
	}

	if (action.type === "RESET") {
		return [];
	}
};

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
	const [hasMore, setHasMore] = useState(false);
	const [selectedUserId, setSelectedUserId] = useState(null);
	const [userModalOpen, setUserModalOpen] = useState(false);
	const [confirmModalOpen, setConfirmModalOpen] = useState(false);
	const [deletingUser, setDeletingUser] = useState(null);
	const [searchParam, setSearchParam] = useState("");
	const [users, dispatch] = useReducer(reducer, []);

	useEffect(() => {
		dispatch({ type: "RESET" });
		setPageNumber(1);
	}, [searchParam]);

	useEffect(() => {
		setLoading(true);
		const delayDebounceFn = setTimeout(() => {
			const fetchUsers = async () => {
				try {
					const { data } = await api.get("/users/", {
						params: { searchParam, pageNumber },
					});
					dispatch({ type: "LOAD_USERS", payload: data.users });
					setHasMore(data.hasMore);
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
				dispatch({ type: "UPDATE_USERS", payload: data.user });
			}

			if (data.action === "delete") {
				dispatch({ type: "DELETE_USER", payload: +data.userId });
			}
		});

		return () => {
			socket.disconnect();
		};
	}, []);

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

	const loadMore = () => {
		setPageNumber(prevState => prevState + 1);
	};

	const handleScroll = e => {
		if (!hasMore || loading) return;
		const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
		if (scrollHeight - (scrollTop + 100) < clientHeight) {
			loadMore();
		}
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
			<Paper
				className={classes.mainPaper}
				variant="outlined"
				onScroll={handleScroll}
			>
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
