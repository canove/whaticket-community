import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField, MenuItem, FormControl, InputLabel, Select } from '@material-ui/core';
import SettingsIcon from "@material-ui/icons/Settings";
import { PortWidget } from "@projectstorm/react-diagrams";

import { AdvancedPortModel } from "../../ports/AdvancedPort/AdvancedPortModel";

import { DeleteOutline } from "@material-ui/icons";
import { AccountTree } from '@material-ui/icons/';
import { FaDatabase } from 'react-icons/fa';

export class DatabaseConditionNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  modalOpen: false,
		  variable: props.node.variable ? props.node.variable : "",
		  condition: props.node.condition ? props.node.condition : "",
		  charactersNumber: props.node.charactersNumber ? props.node.charactersNumber : 0,
		};
	}

	handleVariableChange = (e) => {
		this.setState({ variable: e.target.value });

		this.props.node.variable = e.target.value;
	}

	handleConditionChange = (e) => {
		this.setState({ condition: e.target.value });

		this.props.node.condition = e.target.value;
	}

	handleCharactersNumberChange = (e) => {
		this.setState({ charactersNumber: e.target.value });

		this.props.node.charactersNumber = e.target.value;
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
					Database Condition
				</DialogTitle>
				<DialogContent>
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
								value={this.state.variable}
								label="Variable"
								onChange={(e) => { this.handleVariableChange(e) }}
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
							style={{ margin: "0 5px" }}
						>
							<InputLabel id="condition-select-label">
								Condição
							</InputLabel>
							<Select
								labelId="condition-select-label"
								id="condition-select"
								value={this.state.condition}
								label="Condição"
								onChange={(e) => { this.handleConditionChange(e) }}
								variant="outlined"
							>
								<MenuItem value={"complete"}>{'Completo'}</MenuItem>
								<MenuItem value={"last"}>{`Últimos ${this.state.charactersNumber} Caracteres`}</MenuItem>
								<MenuItem value={"start"}>{`Primeiros ${this.state.charactersNumber} Caracteres`}</MenuItem>
							</Select>
						</FormControl>
						{ this.state.condition !== "complete" &&
							<FormControl
								variant="outlined"
								margin="dense"
								fullWidth
								style={{ margin: "0 5px" }}
							>
								<TextField
									id="characters-number"
									label="Número"
									type="number"
									variant="outlined"
									value={this.state.charactersNumber}
									onChange={this.handleCharactersNumberChange}
									fullWidth
									inputProps={{
										step: 1,
										min: 0,
										type: 'number',
									}}
								/>
							</FormControl>
						}
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
							Database Condition
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
							minHeight: '120px',
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
								backgroundColor: "#BCBBD8",
								border: "2px solid #075E54",
								cursor: "pointer",
								height: "50px",
								position: "absolute",
								right: "-2px",
								top: '60px',
								width: "50px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-true')}
						>
							<div
								style={{
									margin: "13.5px 6px",
								}}
							>
								TRUE
							</div>
						</PortWidget>
						<PortWidget
							style={{
								backgroundColor: "#BCBBD8",
								border: "2px solid #075E54",
								cursor: "pointer",
								height: "50px",
								position: "absolute",
								right: "-2px",
								top: '110px',
								width: "50px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-false')}
						>
							<div
								style={{
									margin: "13.5px 6px",
								}}
							>
								FALSE
							</div>
						</PortWidget>
						<FaDatabase
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
			</div>
		);
	}
}
