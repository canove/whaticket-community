import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField } from '@material-ui/core';
import SettingsIcon from "@material-ui/icons/Settings";
import { PortWidget } from "@projectstorm/react-diagrams";

import toastError from "../../../../errors/toastError";
import api from "../../../../services/api";

import { AiOutlineFieldTime } from 'react-icons/ai';

export class StartInactivityNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  modalOpen: false,
		  inactivityTime: props.node.inactivityTime ? props.node.inactivityTime : "0"
		};
	}

	handleTimeChange = (e) => {
		const value = e.target.value.replace(/[^0-9]/gi, "");

		this.setState({ inactivityTime: value });
		this.props.node.inactivityTime = value;
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
					Start Inactivity
				</DialogTitle>
				<DialogContent>
					<div>
						<TextField
							as={TextField}
							name="time"
							variant="outlined"
							margin="normal"
							label="Time (minutes)"
							fullWidth
							value={this.state.inactivityTime}
							onChange={this.handleTimeChange}
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
							Start Inactivity
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
						<PortWidget
							style={{
								backgroundColor: "#A30000",
								border: "2px solid #075E54",
								borderRadius: "100%",
								cursor: "pointer",
								height: "16px",
								position: "absolute",
								right: "-8px",
								top: "40%",
								width: "16px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-1')}
						>
						</PortWidget>
						<PortWidget
							style={{
								backgroundColor: "white",
								border: "2px solid #075E54",
								cursor: "pointer",
								height: "auto",
								position: "absolute",
								right: "-2px",
								top: "70%",
								width: "64px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-2')}
						>
							<div
								style={{
									display: "inlineBlock",
									textAlign: "center",
								}}
							>
								{ this.state.inactivityTime } min
							</div>
						</PortWidget>
						<AiOutlineFieldTime
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
