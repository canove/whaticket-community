import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField, FormControl, InputLabel, Select, MenuItem } from '@material-ui/core';
import SettingsIcon from "@material-ui/icons/Settings";
import { PortWidget } from "@projectstorm/react-diagrams";

import toastError from "../../../../errors/toastError";
import api from "../../../../services/api";

import { GiReturnArrow } from 'react-icons/gi';

export class JumpNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  modalOpen: false,
		  jumpNodeId: props.node.jumpNodeId,
		};
		this.allNodes = Object.keys(this.props.engine.model.layers[1].models).map(nodeId => nodeId);
		this.endNodes = Object.keys(this.props.engine.model.layers[1].models).map(nodeId => {
			const node = this.props.engine.model.layers[1].models[nodeId]
			if (node.options.type === "end-node") return nodeId;
		});
	}

	handleJumpNodeChange = (e) => {
		this.setState({ jumpNodeId: e.target.value });

		this.props.node.jumpNodeId = e.target.value;
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
						Jump
					</DialogTitle>
					<DialogContent>
						<FormControl
							variant="outlined"
							margin="normal"
							fullWidth
						>
							<InputLabel id="node-select-label">
								Node
							</InputLabel>
							<Select
								labelId="node-select-label"
								id="node-select"
								value={this.state.jumpNodeId}
								label="Node"
								onChange={(e) => { this.handleJumpNodeChange(e) }}
								variant="outlined"
							>
								<MenuItem value={""}>{'Nenhum'}</MenuItem>
								{ this.allNodes.map(nodeId => {
									if (this.props.node.options.id === nodeId) return;
									if (this.endNodes.indexOf(nodeId) !== -1) return;

									return (
										<MenuItem value={nodeId}>{nodeId}</MenuItem>
									);
								})}
							</Select>
						</FormControl>
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
							backgroundColor: "#98CEFF",
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
							Jump
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
							minHeight: "100px",
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

						<GiReturnArrow
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
