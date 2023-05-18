import * as React from 'react';
import { SessionNodeModel } from './SessionNodeModel';
import { SessionNodeWidget } from './SessionNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class SessionNodeFactory extends AbstractReactFactory {
	constructor() {
		super('session-node');
	}

	generateModel(event) {
		return new SessionNodeModel();
	}

	generateReactWidget(event) {
		return <SessionNodeWidget engine={this.engine} node={event.model} />;
	}
}
