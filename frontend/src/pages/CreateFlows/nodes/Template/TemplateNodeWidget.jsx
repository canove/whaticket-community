import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField, MenuItem, Select, InputLabel, FormControl } from '@material-ui/core';
import { PortWidget } from "@projectstorm/react-diagrams";

import { Settings } from "@material-ui/icons/";
import { RiSurveyLine } from "react-icons/ri"
import api from "../../../../services/api";
import toastError from "../../../../errors/toastError";

export class TemplateNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  modalOpen: false,
		  templateId: props.node.templateId ? props.node.templateId : "",
		  templates: []
		};
	}

	handleTemplateChange = async (e) => {
		this.setState({ templateId: e.target.value });
		this.props.node.templateId = e.target.value;
	};

	componentDidMount() { 
		this.fetchTemplates();
	}

	fetchTemplates = async () => {
		try {
			const { data } = await api.get("/TemplatesData/list/");
			this.setState({ templates: data.templates });
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
					Templates
				</DialogTitle>
				<DialogContent>
					<FormControl
						variant="outlined"
						margin="normal"
						fullWidth
					>
						<InputLabel id="template-select-label">
							Templates
						</InputLabel>
						<Select
							labelId="template-select-label"
							id="template-select"
							value={this.state.templateId}
							label="Templates"
							onChange={(e) => { this.handleTemplateChange(e) }}
							variant="outlined"
						>
							{ this.state.templates.map((template) => (
								<MenuItem key={template.id} value={template.id}>{template.name}</MenuItem>
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
						width: "250px",
					}}
				>
					<div 
						style={{
							backgroundColor: "#25D366",
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
							Templates
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
						<PortWidget
							style={{
								backgroundColor: "#25D366",
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
							port={this.props.node.getPort("out")}
						></PortWidget>
						<RiSurveyLine
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
