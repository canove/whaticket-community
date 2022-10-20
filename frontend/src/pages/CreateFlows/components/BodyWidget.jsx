import * as React from 'react';

import * as _ from 'lodash';
import styled from '@emotion/styled';

import { DefaultNodeModel } from '@projectstorm/react-diagrams';
import { CanvasWidget } from '@projectstorm/react-canvas-core';

import { TrayWidget } from './TrayWidget';
import { TrayItemWidget } from './TrayItemWidget';
import { DemoCanvasWidget } from './DemoCanvasWidget';

import { JSCustomNodeModel } from '../nodes/Custom/JSCustomNodeModel';
import { AdvancedPortModel } from '../ports/AdvancedPort/AdvancedPortModel';
import { ChatNodeModel } from '../nodes/Chat/ChatNodeModel';

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
						<TrayItemWidget model={{ type: 'in' }} name="In Node" color="rgb(192,255,0)" />
						<TrayItemWidget model={{ type: 'out' }} name="Out Node" color="rgb(0,192,255)" />
						<TrayItemWidget model={{ type: 'custom' }} name="Custom" color="rgb(255,0,0)" />
						<TrayItemWidget model={{ type: 'chat' }} name="Chat" color="rgb(100,255,100)" />
					</TrayWidget>
					<Layer
						onDrop={(event) => {
							var data = JSON.parse(event.dataTransfer.getData('storm-diagram-node'));
							var nodesCount = _.keys(this.props.app.getDiagramEngine().getModel().getNodes()).length;

							var node = null;
							if (data.type === 'in') {
								node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'rgb(192,255,0)');
								node.addInPort('In');
							} else if (data.type === 'custom') {
								node = new JSCustomNodeModel('Node ' + (nodesCount + 1), 'rgb(192,255,0)');
								node.addPort(new AdvancedPortModel(false, 'out'));
							} else if (data.type === 'chat') {
								node = new ChatNodeModel('Node ' + (nodesCount + 1), 'rgb(192,255,0)');
								node.addPort(new AdvancedPortModel(false, 'out-true'));
								node.addPort(new AdvancedPortModel(false, 'out-false'));
							} else {
								node = new DefaultNodeModel('Node ' + (nodesCount + 1), 'rgb(0,192,255)');
								node.addOutPort('Out');
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