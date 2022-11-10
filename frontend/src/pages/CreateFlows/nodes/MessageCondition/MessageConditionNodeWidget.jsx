import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField, MenuItem, FormControl, InputLabel, Select } from '@material-ui/core';
import SettingsIcon from "@material-ui/icons/Settings";
import { PortWidget } from "@projectstorm/react-diagrams";

import { AdvancedPortModel } from "../../ports/AdvancedPort/AdvancedPortModel";

import { DeleteOutline } from "@material-ui/icons";
import { AiOutlineMessage } from 'react-icons/ai';

export class MessageConditionNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  modalOpen: false,
		  outPorts: props.node.outPorts,
		  currentId: props.node.currentId,
		  conditions: props.node.conditions,
		  selectedCondition: ""
		};
	}

	render() {
		return (
			<div>
				<Dialog
					open={this.state.modalOpen}
					maxWidth="sm"
					fullWidth
					scroll="paper"
				>
				<DialogTitle id="form-dialog-title">
					Message Condition
				</DialogTitle>
				<DialogContent>
					{ this.state.outPorts.map(port => {
						return <div key={port.id}>
							{(!this.state.selectedCondition || this.state.selectedCondition === port.id) &&
								<div style={{ display: "flex" }}>
									<Button 
										variant="outlined" 
										style={{
											marginBottom: "5px",
											width: "100%",
										}}
										onClick={() => {
											if (this.state.selectedCondition === port.id) {
												this.setState({ selectedCondition: "" });
											} else {
												this.setState({ selectedCondition: port.id });
											}
										}}
									>
										{port.id === this.state.selectedCondition ? 'Esconder' : 'Mostrar'} Condição {port.customName ? port.customName : port.name}
									</Button>
									<IconButton
										onClick={() => {
											const deletedPort = this.state.outPorts.find((p) => (p.id === port.id));
											const deletedPortIndex = this.state.outPorts.indexOf(deletedPort);
											
											const array = this.state.outPorts;

											array.splice(deletedPortIndex, 1);

											this.setState({ outPorts: array });
											this.props.node.outPorts = array;

											delete this.props.node.ports[`out-${port.id}`];
											delete this.state.conditions[`${port.id}`];
										}}
									>
										<DeleteOutline />
									</IconButton>
								</div>
							}
							{ this.state.selectedCondition === port.id && 
								<>
									<TextField
										as={TextField}
										name="name"
										variant="outlined"
										margin="normal"
										label="Name"
										fullWidth
										value={port.customName}
										onChange={(e) => {
											const portInfo = this.state.outPorts.find((p) => (p.id === port.id));
											const portIndex = this.state.outPorts.indexOf(portInfo);

											let array =  this.state.outPorts;
											array[portIndex] = { ...portInfo, customName: e.target.value }

											this.setState({ outPorts: array });
											this.props.node.outPorts = array;
										}}
									/>
									<TextField
										as={TextField}
										name="condition"
										variant="outlined"
										margin="normal"
										label="Condition"
										fullWidth
										value={this.state.conditions[port.id]}
										onChange={(e) => {
											const newCondition = {
												...this.state.conditions,
												[port.id]: e.target.value
											}

											this.setState({ conditions: newCondition });
											this.props.node.conditions = newCondition;
										}}
									/>
								</>
							}
						</div>;
					}) }
					{ !this.state.selectedCondition &&
						<Button
							onClick={() => {
								this.props.node.addPort(new AdvancedPortModel(false, `out-${this.state.currentId + 1}`));
								const array = [...this.state.outPorts, { name: `out-${this.state.currentId + 1}`, customName: `out-${this.state.currentId + 1}`, id: this.state.currentId + 1 }];
								
								const newCondition = {
									...this.state.conditions,
									[`${this.state.currentId + 1}`]: ""
								};

								this.setState({ conditions: newCondition });
								this.props.node.conditions = newCondition;

								this.setState({ outPorts: array });
								this.props.node.outPorts = array;

								this.setState({ currentId: this.state.currentId + 1 });
								this.props.node.currentId = this.state.currentId + 1;
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
							this.setState({ selectedCondition: "" });
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
							backgroundColor: "#211F7E",
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
							Message Condition
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
							minHeight: `calc(5px + (50px * ${this.state.outPorts.length ? this.state.outPorts.length + 1 : 2}))`,
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
						
						{ Object.keys(this.props.node.ports).map((port) => {
							const type = port.slice(0, 3);
							const name = port.slice(-4);
							if (type !== "out") return;
							if (name === "else") return;

							const outPort = this.state.outPorts.find((p) => (p.name === port));
							const outPortIndex = this.state.outPorts.indexOf(outPort);

							return (
								<PortWidget
									key={port}
									style={{
										backgroundColor: "#BCBBD8",
										border: "2px solid #075E54",
										cursor: "pointer",
										height: "50px",
										position: "absolute",
										right: "-2px",
										top: `calc(50px * ${outPortIndex + 1})`,
										width: "85px",
									}}
									engine={this.props.engine}
									port={this.props.node.getPort(port)}
								>
									<div
										style={{
											margin: "10px 10px",
											fontSize: "20px",
											fontWeight: "bold",
										}}
									>
										{ outPort.customName ? outPort.customName : outPort.name }
									</div>
								</PortWidget>
							);
						}) }

						<PortWidget
							style={{
								backgroundColor: "#BCBBD8",
								border: "2px solid #075E54",
								cursor: "pointer",
								height: "50px",
								position: "absolute",
								right: "-2px",
								top: `calc(50px * ${this.state.outPorts.length + 1})`,
								width: "85px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-else')}
						>
							<div
								style={{
									margin: "10px 10px",
									fontSize: "20px",
									fontWeight: "bold",
								}}
							>
								ELSE
							</div>
						</PortWidget>

						<AiOutlineMessage
							style={{
								display: "block",
								height: "50px",
								position: "absolute",
								right: "calc(50% + 15px)",
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
