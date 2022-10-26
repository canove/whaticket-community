import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField } from '@material-ui/core';
import SettingsIcon from "@material-ui/icons/Settings";
import { PortWidget } from "@projectstorm/react-diagrams";

import toastError from "../../../../errors/toastError";
import api from "../../../../services/api";
export class StartNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  count: 0,
		  modalOpen: false,
		  header: JSON.stringify({"Authorization": `Bearer TOKEN`}, null, 2),
		};
		this.url = `${process.env.REACT_APP_BACKEND_URL}flows/start/${this.props.node.options.id}`;
		this.payload = JSON.stringify({"text": "STRING"}, null, 2);
		this.response = JSON.stringify({"content": "STRING", "type": "text"}, null, 2);
	}

	getToken = async () => {
		try {
			const { data } = await api.get("/settings");
			const { value } = data.find(s => s.key === "userApiToken");
			this.setState({ header: JSON.stringify({"Authorization": `Bearer ${value}`}, null, 2) });
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
					Start
				</DialogTitle>
				<DialogContent>
				<div>
                  <TextField
					as={TextField}
                    name="url"
                    variant="outlined"
                    margin="normal"
                    label="URL"
                    fullWidth
					value={this.url}
					onChange={() => { return false }}
                  />
                </div>
				<div>
					<TextField
						as={TextField}
						label="Header"
						name="header"
						value={this.state.header}
						multiline
						minRows={4}
						maxLength="1024"
						variant="outlined"
						margin="normal"
						fullWidth
						onChange={() => { return false }}
					/>
				</div>
				<div>
					<TextField
						as={TextField}
						label="Payload"
						name="payload"
						value={this.payload}
						multiline
						minRows={4}
						maxLength="1024"
						variant="outlined"
						margin="normal"
						fullWidth
						onChange={() => { return false }}
					/>
				</div>
				<div>
					<TextField
						as={TextField}
						label="Response"
						name="response"
						value={this.response}
						multiline
						minRows={4}
						maxLength="1024"
						variant="outlined"
						margin="normal"
						fullWidth
						onChange={() => { return false }}
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
							Start
						</Typography>
						<IconButton
							onClick={() => {
								this.getToken();
								this.setState({ modalOpen: true });
							}}
						>
							<SettingsIcon />
						</IconButton>
					</div>
					<div 
						style={{
							minHeight: "150px",
						}}
					>
						<PortWidget
							style={{
								backgroundColor: "#70BAFF",
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
						{/* { Object.keys(this.props.node.ports).map((port, index) => (
							<PortWidget
							key={index}
							style={{
								backgroundColor: "black",
								border: "1px solid white",
								bottom: `calc(50px * ${index})`,
								height: "50px",
								position: "absolute",
								right: "0",
								width: "75px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort(port)}
						>
							<div style={{
									backgroundColor: "green",
									border: "1px solid white",
									height: "50px",
									width: "75px",
								}}
							>
								{port}
							</div>
						</PortWidget>
						))} */}
						{/* <PortWidget
							style={{
								bottom: "50px",
								height: "50px",
								position: "absolute",
								right: "0",
								width: "50px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-true')}
						>
							<div style={{
									backgroundColor: "green",
									height: "50px",
									width: "50px",
								}}
							>
								True
							</div>
						</PortWidget>
						<PortWidget
							style={{
								bottom: "0",
								height: "50px",
								position: "absolute",
								right: "0",
								width: "50px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-false')}
						>
							<div style={{
									backgroundColor: "red",
									height: "50px",
									width: "50px",
								}}
							>
								False
							</div>
						</PortWidget> */}
					</div>
				</div>
			</div>
		);
	}
}
