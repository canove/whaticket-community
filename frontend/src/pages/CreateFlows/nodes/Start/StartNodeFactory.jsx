import * as React from 'react';
import { StartNodeModel } from './StartNodeModel';
import { StartNodeWidget } from './StartNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class StartNodeFactory extends AbstractReactFactory {
	constructor() {
		super('start-node');
	}

	generateModel(event) {
		return new StartNodeModel();
	}

	generateReactWidget(event) {
		return <StartNodeWidget engine={this.engine} node={event.model} />;
	}
}
