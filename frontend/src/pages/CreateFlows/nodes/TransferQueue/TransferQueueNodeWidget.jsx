import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField, MenuItem, Select, InputLabel, FormControl } from '@material-ui/core';
import { PortWidget } from "@projectstorm/react-diagrams";

import { Settings } from "@material-ui/icons/";
import { TfiHeadphoneAlt } from "react-icons/tfi"
import api from "../../../../services/api";
import toastError from "../../../../errors/toastError";

export class TransferQueueNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  modalOpen: false,
		  queueId: props.node.queueId ? props.node.queueId : "",
		  queues: []
		};
	}

	handleQueueChange = async (e) => {
		this.setState({ queueId: e.target.value });
		this.props.node.queueId = e.target.value;
	};

	componentDidMount() { 
		this.fetchQueues();
	}

	fetchQueues = async () => {
		try {
			const { data } = await api.get("/queue");
			this.setState({ queues: data });
		} catch (err) {
			toastError(err);
		}
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
					Transfer Queue
				</DialogTitle>
				<DialogContent>
					<FormControl
						variant="outlined"
						margin="normal"
						fullWidth
					>
						<InputLabel id="method-select-label">
							Queues
						</InputLabel>
						<Select
							labelId="method-select-label"
							id="method-select"
							value={this.state.queueId}
							label="Method"
							onChange={(e) => { this.handleQueueChange(e) }}
							variant="outlined"
						>
							{ this.state.queues.map((queue) => (
								<MenuItem key={queue.id} value={queue.id}>{queue.name}</MenuItem>
							)) }
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
							Transfer Queue
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
						<TfiHeadphoneAlt
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
