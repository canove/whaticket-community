import * as React from 'react';

import * as _ from 'lodash';
import styled from '@emotion/styled';

import { DefaultNodeModel, PortModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';

import { TrayWidget } from './TrayWidget';
import { TrayItemWidget } from './TrayItemWidget';
import { DemoCanvasWidget } from './DemoCanvasWidget';

import { JSCustomNodeModel } from '../nodes/Custom/JSCustomNodeModel';
import { AdvancedPortModel } from '../ports/AdvancedPort/AdvancedPortModel';
import { ChatNodeModel } from '../nodes/Chat/ChatNodeModel';
import { ConditionalNodeModel } from '../nodes/Conditional/ConditionalNodeModel';
import { RequestNodeModel } from '../nodes/Request/RequestNodeModel';

export const Body = styled.div`
	flex-grow: 1;
	display: flex;
	flex-direction: column;
	min-height: 100%;
`;

export const Header = styled.div`
	display: flex;
	background: rgb(30, 30, 30);
	flex-grow: 0;
	flex-shrink: 0;
	color: white;
	font-family: Helvetica, Arial, sans-serif;
	padding: 10px;
	align-items: center;
`;

export const Content = styled.div`
	display: flex;
	flex-grow: 1;
`;

export const Layer = styled.div`
	position: relative;
	flex-grow: 1;
`;

export class BodyWidget extends React.Component {
	render() {
		return (
			<Body>
				<Header>
					<div className="title">Brain It Solutions</div>
				</Header>
				<Content>
					<TrayWidget>
						{/* <TrayItemWidget model={{ type: 'in' }} name="In Node" color="rgb(192,255,0)" />
						<TrayItemWidget model={{ type: 'out' }} name="Out Node" color="rgb(0,192,255)" />
						<TrayItemWidget model={{ type: 'custom' }} name="Custom" color="rgb(255,0,0)" /> */}
						<TrayItemWidget model={{ type: 'chat' }} name="Chat" color="rgb(100, 255, 100)" />
						<TrayItemWidget model={{ type: 'conditional' }} name="Conditional" color="rgb(33, 31, 126)" />
						<TrayItemWidget model={{ type: 'request' }} name="Request" color="rgb(128, 128, 128)" />
					</TrayWidget>
					<Layer
						onDrop={(event) => {
							try {
								JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
							} catch {
								return;
							}

							var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
							var nodesCount = _.keys(this.props.app.getDiagramEngine().getModel().getNodes()).length;

							var node = null;
							if (data.type === 'chat') {
								node = new ChatNodeModel();
								node.addPort(new AdvancedPortModel(true, 'in'));
								node.addPort(new AdvancedPortModel(false, 'out'));
							} else if (data.type === 'conditional') {
								node = new ConditionalNodeModel();
								node.addPort(new AdvancedPortModel(true, 'in'));
								node.addPort(new AdvancedPortModel(false, 'out-c1'));
								node.addPort(new AdvancedPortModel(false, 'out-else'));
							} else if (data.type === 'request') {
								node = new RequestNodeModel();
								node.addPort(new AdvancedPortModel(true, 'in'));
								node.addPort(new AdvancedPortModel(true, 'out-2xx'));
								node.addPort(new AdvancedPortModel(true, 'out-err'));
							}

							var point = this.props.app.getDiagramEngine().getRelativeMousePoint(event);
							node.setPosition(point);
							this.props.app.getDiagramEngine().getModel().addNode(node);
							this.forceUpdate();
						}}
						onDragOver={(event) => {
							event.preventDefault();
						}}
					>
						<DemoCanvasWidget>
							<CanvasWidget engine={this.props.app.getDiagramEngine()} />
						</DemoCanvasWidget>
					</Layer>
				</Content>
			</Body>
		);
	}
}