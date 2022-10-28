import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField } from '@material-ui/core';
import SettingsIcon from "@material-ui/icons/Settings";
import { PortWidget } from "@projectstorm/react-diagrams";

import toastError from "../../../../errors/toastError";
import api from "../../../../services/api";

import { IoIosRocket } from 'react-icons/io';
export class StartNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  count: 0,
		  modalOpen: false,
		  header: JSON.stringify({"Authorization": `Bearer TOKEN`}, null, 2),
		};
		this.url = `${process.env.REACT_APP_BACKEND_URL}flows/start/${this.props.node.options.id}`;
		this.payload = JSON.stringify({"text": "_____", "sessionId": "_____"}, null, 2);
		this.response = JSON.stringify({"content": "_____", "type": "text"}, null, 2);
	}

	componentDidMount() { 
		this.getToken();
	}

	getToken = async () => {
		try {
			const { data } = await api.get("/settings");
			const { value } = data.find(s => s.key === "userApiToken");
			this.setState({ header: JSON.stringify({"Authorization": `Bearer ${value}`}, null, 2) });
		} catch (err) {
			toastError(err);
		}

		this.props.node.url = this.url;
		this.props.node.header = this.state.header;
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
							Start
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
						<IoIosRocket
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
