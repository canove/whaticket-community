import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField, MenuItem, FormControl, InputLabel, Select } from '@material-ui/core';
import SettingsIcon from "@material-ui/icons/Settings";
import { PortWidget } from "@projectstorm/react-diagrams";

import { AdvancedPortModel } from "../../ports/AdvancedPort/AdvancedPortModel";

import { DeleteOutline } from "@material-ui/icons";
import { AccountTree } from '@material-ui/icons/';
import { FaDatabase } from 'react-icons/fa';

export class DatabaseNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  modalOpen: false,
		  variable: props.node.variable ? props.node.variable : "",
		  varType: props.node.varType ? props.node.varType : "text",
		};
	}

	handleVariableChange = (e) => {
		this.setState({ variable: e.target.value });

		this.props.node.variable = e.target.value;
	}

	handleVarTypeChange = (e) => {
		this.setState({ varType: e.target.value });

		this.props.node.varType = e.target.value;
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
					Database
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
							<InputLabel id="var-type-select-label">
								Tipo
							</InputLabel>
							<Select
								labelId="var-type-select-label"
								id="var-type-select"
								value={this.state.varType}
								label="Tipo"
								onChange={(e) => { this.handleVarTypeChange(e) }}
								variant="outlined"
							>
								<MenuItem value={"text"}>{'Texto'}</MenuItem>
								<MenuItem value={"url"}>{'URL'}</MenuItem>
							</Select>
						</FormControl>
					</div>
					{/* Para usar esta variavel use: {'{{database.value}}'} <br/>
					Para usar o tipo use: {'{{database.type}}'} */}
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
							backgroundColor: "#BFBFBF",
							color: "black",
							display: "flex",
							justifyContent: "space-between"
						}}
					>
						<Typography style={{
								fontWeight: "bold",
								padding: "10px",
							}}
						>
							Database 
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
							minHeight: '100px',
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
								backgroundColor: "#BFBFBF",
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
						<FaDatabase
							style={{
								display: "block",
								height: "50px",
								position: "absolute",
								right: "calc(50% - 25px)",
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
