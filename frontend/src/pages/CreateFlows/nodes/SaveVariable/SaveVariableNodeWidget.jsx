import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField, MenuItem, Select, InputLabel, FormControl } from '@material-ui/core';
import { PortWidget } from "@projectstorm/react-diagrams";

import { Settings } from "@material-ui/icons/";
import { IoIosSave } from 'react-icons/io';

const defaultSave = {
	"variableName": "{{ param }}",
}

export class SaveVariableNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  modalOpen: false,
		  save: props.node.save ? props.node.save : "",
		};
	}

	handleSaveChange = async (e) => {
		this.setState({ save: e.target.value });
		this.props.node.save = e.target.value;
	};

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
					Save Variables
				</DialogTitle>
				<DialogContent>
					<div>
						Para usar os parametros salvos, use: {'{{ variables.variableName }}'}
					</div>
					<div>
						<TextField
							as={TextField}
							label="Save"
							name="Save"
							value={this.state.save}
							placeholder={JSON.stringify(defaultSave, null, 4)}
							multiline
							minRows={16}
							maxLength="1024"
							variant="outlined"
							margin="normal"
							fullWidth
							onChange={(e) => { this.handleSaveChange(e) }}
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
						width: "200px",
					}}
				>
					<div 
						style={{
							backgroundColor: "#A30000",
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
							Save Variables
						</Typography>
						<IconButton
							onClick={() => {
								this.setState({ modalOpen: true });
							}}
						>
							<Settings />
						</IconButton>
					</div>
					<div 
						style={{
							minHeight: "110px",
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
								backgroundColor: "#A30000",
								border: "2px solid #075E54",
								borderRadius: "100%",
								cursor: "pointer",
								height: "16px",
								position: "absolute",
								right: "-8px",
								top: "50%",
								width: "16px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out')}
						>
						</PortWidget>
						<IoIosSave
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
						fontSize: "9px",
						padding: "10px",
					}}
				>
					{this.props.node.options.id}
				</div>
			</div>
		);
	}
}
