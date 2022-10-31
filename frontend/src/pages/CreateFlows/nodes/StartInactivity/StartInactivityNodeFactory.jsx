import * as React from 'react';
import { StartInactivityNodeModel } from './StartInactivityNodeModel';
import { StartInactivityNodeWidget } from './StartInactivityNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class StartInactivityNodeFactory extends AbstractReactFactory {
	constructor() {
		super('start-inactivity-node');
	}

	generateModel(event) {
		return new StartInactivityNodeModel();
	}

	generateReactWidget(event) {
		return <StartInactivityNodeWidget engine={this.engine} node={event.model} />;
	}
}
