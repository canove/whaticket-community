import * as React from 'react';
import { EndNodeModel } from './EndNodeModel';
import { EndNodeWidget } from './EndNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class EndNodeFactory extends AbstractReactFactory {
	constructor() {
		super('end-node');
	}

	generateModel(event) {
		return new EndNodeModel();
	}

	generateReactWidget(event) {
		return <EndNodeWidget engine={this.engine} node={event.model} />;
	}
}
