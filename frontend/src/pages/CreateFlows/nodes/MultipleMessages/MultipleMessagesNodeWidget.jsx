import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField, MenuItem, FormControl, InputLabel, Select } from '@material-ui/core';
import SettingsIcon from "@material-ui/icons/Settings";
import { PortWidget } from "@projectstorm/react-diagrams";

import { AdvancedPortModel } from "../../ports/AdvancedPort/AdvancedPortModel";

import { DeleteOutline } from "@material-ui/icons";
import { AiOutlineMessage } from 'react-icons/ai';

export class MultipleMessagesNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  modalOpen: false,
		  messages: props.node.messages,
		  selectedMessage: ""
		};
	}

	render() {
		const { messages, selectedMessage } = this.state
		return (
			<div>
				<Dialog
					open={this.state.modalOpen}
					maxWidth="sm"
					fullWidth
					scroll="paper"
				>
				<DialogTitle id="form-dialog-title">
					Multiple Messages
				</DialogTitle>
				<DialogContent>
					{ messages.map((message, index) => {
						return (
							<div>
								{ (!selectedMessage || selectedMessage === message.id) &&
									<div style={{ display: "flex" }}>
										<Button 
											variant="outlined" 
											style={{
												marginBottom: "5px",
												width: "100%",
											}}
											onClick={() => {
												if (selectedMessage === message.id) {
													this.setState({ selectedMessage: "" });
												} else {
													this.setState({ selectedMessage: message.id });
												}
											}}
										>
											{message.id === selectedMessage ? 'Esconder' : 'Mostrar'} Mensagem #{index+1}
										</Button>
										<IconButton
											onClick={() => {
												this.setState({ selectedMessage: "" });

												const deletedMessage = messages.find((m) => (m.id === message.id));
												const deletedMessageIndex = messages.indexOf(deletedMessage);
												
												const array = messages;

												array.splice(deletedMessageIndex, 1);

												this.setState({ messages: array });
												this.props.node.messages = array;
											}}
										>
											<DeleteOutline />
										</IconButton>
									</div>
								}
								{ selectedMessage === message.id &&
									<FormControl
										variant="outlined"
										margin="normal"
										fullWidth
										style={{ margin: "5px 0" }}
									>
										<InputLabel id="type-select-label">
											Tipo
										</InputLabel>
										<Select
											labelId="type-select-label"
											id="type-select"
											value={message.messageType}
											label="Tipo"
											onChange={(e) => {
												const editedMessage = messages.find((m) => (m.id === message.id));
												const editedMessageIndex = messages.indexOf(editedMessage);
												
												const newMessageType = {
													...message,
													messageType: e.target.value,
													messageContent: "",
													textType: "",
												}

												let array = messages;

												array[editedMessageIndex] = newMessageType;

												this.setState({ messages: array });
												this.props.node.messages = array;
											}}
											variant="outlined"
										>
											<MenuItem value={"text"}>{'Texto'}</MenuItem>
											<MenuItem value={"database"}>{'Database Var'}</MenuItem>
										</Select>
									</FormControl>
								}
								{ (selectedMessage === message.id && message.messageType === "text") &&
									<TextField
										as={TextField}
										name="message"
										variant="outlined"
										margin="normal"
										label="Message"
										fullWidth
										style={{ margin: "5px 0" }}
										value={message.messageContent}
										onChange={(e) => {
											const editedMessage = messages.find((m) => (m.id === message.id));
											const editedMessageIndex = messages.indexOf(editedMessage);
												
											const newMessageType = {
												...message,
												messageContent: e.target.value,
											}

											let array = messages;
											array[editedMessageIndex] = newMessageType;

											this.setState({ messages: array });
											this.props.node.messages = array;
										}}
									/>
								}
								{ (selectedMessage === message.id && message.messageType === "database") &&
									<div
										style={{
											alignItems: "center",
											display: "flex",
											marginBottom: "16px",
										}}
									>
										<FormControl
											variant="outlined"
											margin="normal"
											fullWidth
											style={{ margin: "0 5px" }}
										>
											<InputLabel id="variable-select-label">
												Variable
											</InputLabel>
											<Select
												labelId="variable-select-label"
												id="variable-select"
												value={message.messageContent}
												label="Variable"
												onChange={(e) => {
													const editedMessage = messages.find((m) => (m.id === message.id));
													const editedMessageIndex = messages.indexOf(editedMessage);
													
													const newMessageType = {
														...message,
														messageContent: e.target.value,
													}

													let array = messages;

													array[editedMessageIndex] = newMessageType;

													this.setState({ messages: array });
													this.props.node.messages = array;
												}}
												variant="outlined"
											>
												<MenuItem value={"name"}>{'Nome'}</MenuItem>
												<MenuItem value={"documentNumber"}>{'CPF'}</MenuItem>
												<MenuItem value={"message"}>{'Mensagem'}</MenuItem>
												<MenuItem value={"phoneNumber"}>{'Telefone'}</MenuItem>
												<MenuItem value={"var1"}>{'Var 1'}</MenuItem>
												<MenuItem value={"var2"}>{'Var 2'}</MenuItem>
												<MenuItem value={"var3"}>{'Var 3'}</MenuItem>
												<MenuItem value={"var4"}>{'Var 4'}</MenuItem>
												<MenuItem value={"var5"}>{'Var 5'}</MenuItem>
											</Select>
										</FormControl>
										<FormControl
											variant="outlined"
											margin="normal"
											fullWidth
											style={{ margin: "5px 5px" }}
										>
											<InputLabel id="var-type-select-label">
												Tipo
											</InputLabel>
											<Select
												labelId="var-type-select-label"
												id="var-type-select"
												value={message.textType}
												label="Tipo"
												onChange={(e) => {
													const editedMessage = messages.find((m) => (m.id === message.id));
													const editedMessageIndex = messages.indexOf(editedMessage);
													
													const newMessageType = {
														...message,
														textType: e.target.value,
													}

													let array = messages;

													array[editedMessageIndex] = newMessageType;

													this.setState({ messages: array });
													this.props.node.messages = array;
												}}
												variant="outlined"
											>
												<MenuItem value={"text"}>{'Texto'}</MenuItem>
												<MenuItem value={"url"}>{'URL'}</MenuItem>
											</Select>
										</FormControl>
									</div>
								}
							</div>
						);
					}) }
					{ !selectedMessage &&
						<Button
							onClick={() => {
								const newMessage = {
									id: messages[messages.length - 1].id + 1,
									messageType: "text",
									messageContent: "",
									textType: "text"
								}

								const array = [...messages, newMessage];

								this.setState({ messages: array });
								this.props.node.messages = array;
							}}
							style={{
								display: "block",
								margin: "0 auto",
								width: "100%",
							}}
						>
							ADICIONAR CONDIÇÃO
						</Button>
					}
				</DialogContent>
				<DialogActions>
					<Button
						onClick={() => {
							this.setState({ modalOpen: false });
						}}
					>
						Fechar
					</Button>
				</DialogActions>
			</Dialog>
				<div 
					style={{
						backgroundColor: "white",
						border: "2px solid #075E54",
						position: "relative",
						width: "250px",
					}}
				>
					<div 
						style={{
							backgroundColor: "#25D366",
							color: "white",
							display: "flex",
							justifyContent: "space-between"
						}}
					>
						<Typography style={{
								fontWeight: "bold",
								padding: "10px",
							}}
						>
							Multiple Messages
						</Typography>
						<IconButton
							onClick={() => {
								this.setState({ modalOpen: true });
							}}
						>
							<SettingsIcon />
						</IconButton>
					</div>
					<div 
						style={{
							minHeight: `110px`,
						}}
					>
						<PortWidget
							style={{
								cursor: "pointer",
								height: "100%",
								left: "0",
								position: "absolute",
								top: "0",
								width: "32px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('in')}
						>
						</PortWidget>

						<PortWidget
							style={{
								backgroundColor: "#25D366",
								border: "2px solid #075E54",
								borderRadius: "100%",
								cursor: "pointer",
								height: "16px",
								position: "absolute",
								right: "-8px",
								top: "calc(50% + 8px)",
								width: "16px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out')}
						>
						</PortWidget>

						<AiOutlineMessage
							style={{
								display: "block",
								height: "50px",
								position: "absolute",
								right: "calc(50% - 15px)",
								top: "50%",
								width: "50px",
							}}
						/>  
					</div>
				</div>
			</div>
		);
	}
}
