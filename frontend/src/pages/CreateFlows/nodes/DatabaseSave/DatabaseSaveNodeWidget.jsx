import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField, MenuItem, FormControl, InputLabel, Select } from '@material-ui/core';
import SettingsIcon from "@material-ui/icons/Settings";
import { PortWidget } from "@projectstorm/react-diagrams";

import { AdvancedPortModel } from "../../ports/AdvancedPort/AdvancedPortModel";

import { DeleteOutline } from "@material-ui/icons";
import { AccountTree } from '@material-ui/icons/';
import { FaDatabase } from 'react-icons/fa';

export class DatabaseSaveNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  modalOpen: false,
		  input: props.node.input ? props.node.input : "input1",
		  value: props.node.value ? props.node.value : "",
		};
	}

	handleInputChange = (e) => {
		this.setState({ input: e.target.value });

		this.props.node.input = e.target.value;
	}

	handleValueChange = (e) => {
		this.setState({ value: e.target.value });

		this.props.node.value = e.target.value;
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
					Save in Database
				</DialogTitle>
				<DialogContent>
					<div
						style={{
							alignItems: "center",
							display: "flex",
						}}
					>
						<FormControl
							variant="outlined"
							margin="normal"
							fullWidth
						>
							<InputLabel id="input-select-label">
								Campo
							</InputLabel>
							<Select
								labelId="input-select-label"
								id="input-select"
								value={this.state.input}
								label="Campo"
								onChange={(e) => { this.handleInputChange(e) }}
								variant="outlined"
							>
								<MenuItem value={"input1"}>{'Input 1'}</MenuItem>
								<MenuItem value={"input2"}>{'Input 2'}</MenuItem>
								<MenuItem value={"input3"}>{'Input 3'}</MenuItem>
							</Select>
						</FormControl>
					</div>
					<div>
						<TextField
							as={TextField}
							name="value"
							variant="outlined"
							margin="normal"
							label="Valor"
							fullWidth
							value={this.state.value}
							onChange={(e) => { this.handleValueChange(e) }}
						/>
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
							Save in Database 
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
