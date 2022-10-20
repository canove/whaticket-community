import * as React from 'react';

import { PortWidget } from '@projectstorm/react-diagrams';

import { Button, Dialog, DialogActions, DialogTitle, Typography } from '@material-ui/core';

import { AdvancedPortModel } from '../../ports/AdvancedPort/AdvancedPortModel';

export class ChatNodeWidget extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
		  count: 0,
		  modalOpen: false,
		};
	}

	render() {
		return (
			<div>
				<Dialog
				open={this.state.modalOpen}
				maxWidth="xs"
				fullWidth
				scroll="paper"
			>
				<DialogTitle id="form-dialog-title">
					Modal do Chat
				</DialogTitle>
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
				<div style={{
						backgroundColor: "white",
						border: "2px solid #075E54",
						position: "relative",
						width: "250px",
					}}
				>
					<div style={{
							backgroundColor: "#25D366",
							color: "white",
							cursor: "pointer",
						}}
						onClick={() => {
							// console.log(this.props.node);
							// this.props.node.data.senha = "12345";

							// console.log(`COUNTER: ${this.state.count}`);
							// this.setState({ count: this.state.count + 1 });

							// this.props.node.addPort(new AdvancedPortModel(false, `out-false ${Object.keys(this.props.node.ports).length + 1}`));
							// console.log(this.props.node.ports);
						}}
					>
						<Typography style={{
								fontWeight: "bold",
								padding: "10px",
							}}
						>
							Chat
						</Typography>
					</div>
					<div style={{
							height: "150px",
							verticalAlign: "bottom",
						}}
					>
						<Button
							onClick={() => {
								this.setState({ modalOpen: true });
							}}
						>
							Abrir Modal
						</Button>
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
						<PortWidget
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
						</PortWidget>
					</div>
				</div>
			</div>
		);
	}
}
