import React, { useEffect, useState } from "react";

import { Button, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, Typography, TextField, MenuItem, FormControl, InputLabel, Select } from '@material-ui/core';
import SettingsIcon from "@material-ui/icons/Settings";
import { PortWidget } from "@projectstorm/react-diagrams";

import { AdvancedPortModel } from "../../ports/AdvancedPort/AdvancedPortModel";

import { DeleteOutline } from "@material-ui/icons";
import { AccountTree } from '@material-ui/icons/';
import { Ri24HoursLine } from "react-icons/ri"

export class SessionNodeWidget extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<div>
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
							Sessão
						</Typography>
					</div>
					<div 
						style={{
							minHeight: '120px',
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
								backgroundColor: "#BCBBD8",
								border: "2px solid #075E54",
								cursor: "pointer",
								height: "50px",
								position: "absolute",
								right: "-2px",
								top: '60px',
								width: "50px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-true')}
						>
							<div
								style={{
									margin: "13.5px 6px",
								}}
							>
								SIM
							</div>
						</PortWidget>
						<PortWidget
							style={{
								backgroundColor: "#BCBBD8",
								border: "2px solid #075E54",
								cursor: "pointer",
								height: "50px",
								position: "absolute",
								right: "-2px",
								top: '110px',
								width: "50px",
							}}
							engine={this.props.engine}
							port={this.props.node.getPort('out-false')}
						>
							<div
								style={{
									margin: "13.5px 6px",
								}}
							>
								NÃO
							</div>
						</PortWidget>
						<Ri24HoursLine
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
