import * as React from 'react';
import { DatabaseSaveNodeModel } from './DatabaseSaveNodeModel';
import { DatabaseSaveNodeWidget } from './DatabaseSaveNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class DatabaseSaveNodeFactory extends AbstractReactFactory {
	constructor() {
		super('database-save-node');
	}

	generateModel(event) {
		return new DatabaseSaveNodeModel();
	}

	generateReactWidget(event) {
		return <DatabaseSaveNodeWidget engine={this.engine} node={event.model} />;
	}
}
