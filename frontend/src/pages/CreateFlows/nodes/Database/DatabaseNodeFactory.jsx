import * as React from 'react';
import { DatabaseNodeModel } from './DatabaseNodeModel';
import { DatabaseNodeWidget } from './DatabaseNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class DatabaseNodeFactory extends AbstractReactFactory {
	constructor() {
		super('database-node');
	}

	generateModel(event) {
		return new DatabaseNodeModel();
	}

	generateReactWidget(event) {
		return <DatabaseNodeWidget engine={this.engine} node={event.model} />;
	}
}
