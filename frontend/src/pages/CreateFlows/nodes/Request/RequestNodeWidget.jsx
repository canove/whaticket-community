import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField, MenuItem, Select, InputLabel, FormControl } from '@material-ui/core';
import { PortWidget } from "@projectstorm/react-diagrams";

import { Settings, GetApp } from "@material-ui/icons/";
export class RequestNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  modalOpen: false,
		  url: props.node.url ? props.node.url : "",
		  method: props.node.method ? props.node.method : "",
		  header: props.node.header ? props.node.header : "",
		  body: props.node.body ? props.node.body : "",
		};
	}

	handleUrlChange = async (e) => {
		this.setState({ url: e.target.value });
		this.props.node.url = e.target.value;
	};

	handleMethodChange = async (e) => {
		this.setState({ method: e.target.value });
		this.props.node.method = e.target.value;

		if (e.target.value === "GET") {
			this.setState({ body: "" });
			this.props.node.body = "";
		}
	};

	handleHeaderChange = async (e) => {
		this.setState({ header: e.target.value });
		this.props.node.header = e.target.value;
	};

	handleBodyChange = async (e) => {
		this.setState({ body: e.target.value });
		this.props.node.body = e.target.value;
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
					Request
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
						value={this.state.url}
						onChange={(e) => { this.handleUrlChange(e) }}
					/>
					</div>
					<FormControl
						variant="outlined"
						margin="normal"
						fullWidth
					>
						<InputLabel id="method-select-label">
							Método
						</InputLabel>
						<Select
							labelId="method-select-label"
							id="method-select"
							value={this.state.method}
							label="Method"
							onChange={(e) => { this.handleMethodChange(e) }}
							variant="outlined"
						>
							<MenuItem value={"GET"}>{'GET'}</MenuItem>
							<MenuItem value={"POST"}>{'POST'}</MenuItem>
						</Select>
					</FormControl>
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
							onChange={(e) => { this.handleHeaderChange(e) }}
						/>
					</div>
					{ this.state.method === "POST" && 
						<div>
							<TextField
								as={TextField}
								label="Body"
								name="Body"
								value={this.state.body}
								multiline
								minRows={4}
								maxLength="1024"
								variant="outlined"
								margin="normal"
								fullWidth
								onChange={(e) => { this.handleBodyChange(e) }}
							/>
						</div>
					}
					<div>
						Para usar os parametros da resposta do request, use: {'{{ response. }}'}
					</div>
					<div>
						Para usar os parametros de erro do request, use: {'{{ error. }}'}
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
							Request
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
								backgroundColor: "green",
								border: "2px solid #075E54",
								color: "white",
								cursor: "pointer",
								height: "50px",
								position: "absolute",
								right: "-2px",
								top: "calc(50% - 25px)",
								width: "50px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-2xx')}
						>
							<div
								style={{
									margin: "13.5px 6px",
								}}
							>
								2XX
							</div>
						</PortWidget>
						<PortWidget
							style={{
								backgroundColor: "red",
								border: "2px solid #075E54",
								color: "white",
								cursor: "pointer",
								height: "50px",
								position: "absolute",
								right: "-2px",
								top: "calc(50% + 25px)",
								width: "50px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-err')}
						>
							<div
								style={{
									margin: "13.5px 6px",
								}}
							>
								ERR
							</div>
						</PortWidget>
						<GetApp
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
