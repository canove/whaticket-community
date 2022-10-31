import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField } from '@material-ui/core';
import SettingsIcon from "@material-ui/icons/Settings";
import { PortWidget } from "@projectstorm/react-diagrams";

import toastError from "../../../../errors/toastError";
import api from "../../../../services/api";

import { GiStopSign } from 'react-icons/gi';

export class EndNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  modalOpen: false,
		};
	}

	render() {
		return (
			<div>
				{/* <Dialog
					open={this.state.modalOpen}
					maxWidth="sm"
					fullWidth
					scroll="paper"
				>
					<DialogTitle id="form-dialog-title">
						End
					</DialogTitle>
					<DialogContent>
					
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
				</Dialog> */}
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
							End
						</Typography>
						{/* <IconButton
							onClick={() => {
								this.setState({ modalOpen: true });
							}}
						>
							<SettingsIcon />
						</IconButton> */}
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
						{/* <PortWidget
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
						</PortWidget> */}
						<GiStopSign
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
