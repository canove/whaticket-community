import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField, MenuItem, FormControl, InputLabel, Select } from '@material-ui/core';
import SettingsIcon from "@material-ui/icons/Settings";
import { PortWidget } from "@projectstorm/react-diagrams";

import { AdvancedPortModel } from "../../ports/AdvancedPort/AdvancedPortModel";

import { DeleteOutline } from "@material-ui/icons";
import { AccountTree } from '@material-ui/icons/';

const defaultConditions = {
	"C1": {
		param1: "",
		condition: "",
		param2: "",
	},
};

export class ConditionalNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  modalOpen: false,
		  name: props.node.name ? props.node.name : "Conditional",
		  conditions: props.node.conditions ? props.node.conditions : defaultConditions,
		  ports: props.node.outPortsNumber ? props.node.outPortsNumber : 2,
		};
	}

	handleNameChange = (e) => {
		this.setState({ name: e.target.value });

		this.props.node.name = e.target.value;
	}

	handleConditionsChange = (conditions) => {
		this.setState({ conditions });

		this.props.node.conditions = conditions;
	}

	render() {
		const { conditions } = this.state;
		return (
			<div>
				<Dialog
					open={this.state.modalOpen}
					maxWidth="sm"
					fullWidth
					scroll="paper"
				>
				<DialogTitle id="form-dialog-title">
				<div>
                  <TextField
					as={TextField}
                    name="name"
                    variant="outlined"
                    margin="normal"
                    label="Name"
                    fullWidth
					value={this.state.name}
					onChange={(e) => { this.handleNameChange(e) }}
                  />
                </div>
				</DialogTitle>
				<DialogContent>
					<div>
						{ Object.keys(this.props.node.ports).map((port, index) => {
							const type = port.slice(0, 3);
							const name = port.replace("out-", "").toUpperCase();

							if (type !== "out") return;
							if (name === "ELSE") return;

							return (
								<div
									key={port}
									style={{
										alignItems: "center",
										display: "flex",
										marginBottom: "16px",
									}}
								>
									<Typography>{name}</Typography>
									<TextField
										as={TextField}
										name="param1"
										variant="outlined"
										margin="normal"
										label="Param 1"
										fullWidth
										value={conditions[name].param1}
										onChange={(e) => { 
											const newConditions = {
												...conditions,
												[name]: {
													...conditions[name],
													param1: e.target.value,
												}
											}
											this.handleConditionsChange(newConditions)
										}}
										style={{ margin: "0 5px" }}
									/>
									<FormControl
										variant="outlined"
										margin="normal"
										fullWidth
										style={{ margin: "0 5px" }}
									>
										<InputLabel id="condition-select-label">
											Condition
										</InputLabel>
										<Select
											labelId="condition-select-label"
											id="condition-select"
											value={conditions[name].condition}
											label="Condition"
											onChange={(e) => { 
												const newConditions = {
													...conditions,
													[name]: {
														...conditions[name],
														condition: e.target.value,
													}
												}

												if (e.target.value === "exists" || e.target.value === "not_exists") {
													delete newConditions[name].param2;
												}

												this.handleConditionsChange(newConditions)
											}}
											variant="outlined"
										>
											<MenuItem value={"equals"}>{'='}</MenuItem>
											<MenuItem value={"not_equal"}>{'!='}</MenuItem>
											<MenuItem value={"greater_than"}>{'>'}</MenuItem>
											<MenuItem value={"greater_than_or_equal"}>{'>='}</MenuItem>
											<MenuItem value={"exists"}>{'Exists'}</MenuItem>
											<MenuItem value={"not_exists"}>{'Not Exists'}</MenuItem>
											<MenuItem value={"contains"}>{'Contains'}</MenuItem>
											<MenuItem value={"not_contains"}>{'Not Contains'}</MenuItem>
											<MenuItem value={"less_than"}>{'<'}</MenuItem>
											<MenuItem value={"less_than_or_equal"}>{'<='}</MenuItem>
										</Select>
									</FormControl>
									{ (conditions[name].condition !== "exists" && conditions[name].condition !== "not_exists") &&
										<TextField
											as={TextField}
											name="param2"
											variant="outlined"
											margin="normal"
											label="Param 2"
											fullWidth
											value={conditions[name].param2}
											onChange={(e) => { 
												const newConditions = {
													...conditions,
													[name]: {
														...conditions[name],
														param2: e.target.value,
													}
												}
												this.handleConditionsChange(newConditions)
											}}
											style={{ margin: "0 5px" }}
										/>
									}
									{ this.state.ports === index &&
										<IconButton
											onClick={() => {
												this.setState({ ports: this.state.ports - 1 });
												this.props.node.outPortsNumber -= 1;

												delete this.props.node.ports[port];

												const newConditions = {
													...conditions,
												}

												delete newConditions[name];

												this.handleConditionsChange(newConditions);
											}}
										>
											<DeleteOutline />
										</IconButton>
									}
								</div>
							)
						})}
						<Button
							onClick={() => {
								if (this.state.ports >= 2) {
									this.setState({ ports: this.state.ports + 1 });
									this.props.node.outPortsNumber += 1;

									const name = `C${this.state.ports}`.toUpperCase();
									
									const newConditions = {
										...conditions,
										[name]: {
											param1: "",
											condition: "",
											param2: "",
										},
									};

									this.handleConditionsChange(newConditions);

									this.props.node.addPort(new AdvancedPortModel(false, `out-c${this.state.ports}`));
								}
							}}
							style={{
								display: "block",
								margin: "0 auto",
							}}
						>
							ADICIONAR CONDIÇÃO
						</Button>
					</div>
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
							{ this.state.name }
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
							minHeight: `calc(5px + (50px * ${this.state.ports}))`,
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

						{ Object.keys(this.props.node.ports).map((port, index) => {
							const type = port.slice(0, 3);
							const name = port.replace("out-", "").toUpperCase();
							const number = parseInt(port.replace("out-c", "").toUpperCase());

							if (type !== "out") return;
							if (name === "ELSE") return;

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
										top: `calc(50px * ${number})`,
										width: "50px",
									}}
									engine={this.props.engine}
									port={this.props.node.getPort(port)}
								>
									<div
										style={{
											margin: "13.5px 6px",
										}}
									>
										{ name }
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
								top: `calc(50px * ${this.state.ports})`,
								width: "50px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-else')}
						>
							<div
								style={{
									margin: "13.5px 6px",
								}}
							>
								ELSE
							</div>
						</PortWidget>
						<AccountTree
							style={{
								display: "block",
								height: "50px",
								position: "absolute",
								right: "50%",
								top: "50%",
								width: "50px",
							}}
						/>  
					</div>
				</div>
				<div
					style={{
						background: "white",
						border: "2px solid #075E54",
						borderTop: "0",
						fontSize: "11px",
						padding: "10px",
					}}
				>
					{this.props.node.options.id}
				</div>
			</div>
		);
	}
}
