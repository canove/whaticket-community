import * as React from 'react';
import { DatabaseCondition2NodeModel } from './DatabaseCondition2NodeModel';
import { DatabaseCondition2NodeWidget } from './DatabaseCondition2NodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class DatabaseCondition2NodeFactory extends AbstractReactFactory {
	constructor() {
		super('database-condition-2-node');
	}

	generateModel(event) {
		return new DatabaseCondition2NodeModel();
	}

	generateReactWidget(event) {
		return <DatabaseCondition2NodeWidget engine={this.engine} node={event.model} />;
	}
}
