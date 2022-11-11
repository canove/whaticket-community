import * as React from 'react';
import { DatabaseConditionNodeModel } from './DatabaseConditionNodeModel';
import { DatabaseConditionNodeWidget } from './DatabaseConditionNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class DatabaseConditionNodeFactory extends AbstractReactFactory {
	constructor() {
		super('database-condition-node');
	}

	generateModel(event) {
		return new DatabaseConditionNodeModel();
	}

	generateReactWidget(event) {
		return <DatabaseConditionNodeWidget engine={this.engine} node={event.model} />;
	}
}
