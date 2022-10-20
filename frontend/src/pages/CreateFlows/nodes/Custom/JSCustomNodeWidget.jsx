import * as React from 'react';
import { PortWidget } from '@projectstorm/react-diagrams';
import { Button } from '@material-ui/core';

export class JSCustomNodeWidget extends React.Component {
	render() {
		return (
			<div className="custom-node">
				<div style={{ backgroundColor: 'white', width: '100px' }}>
					Testando
					<PortWidget engine={this.props.engine} port={this.props.node.getPort('in')}>
						<div style={{ backgroundColor: "green", marginBottom: "16px" }}>In</div>
					</PortWidget>
					<PortWidget engine={this.props.engine} port={this.props.node.getPort('out')}>
						<div style={{ backgroundColor: "red" }}>Out</div>
					</PortWidget>
					<div className="custom-node-color" style={{ backgroundColor: this.props.node.color }} />
				</div>
			</div>
		);
	}
}
