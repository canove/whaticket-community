import * as React from 'react';
import { ConditionalNodeModel } from './ConditionalNodeModel';
import { ConditionalNodeWidget } from './ConditionalNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class ConditionalNodeFactory extends AbstractReactFactory {
	constructor() {
		super('conditional-node');
	}

	generateModel(event) {
		return new ConditionalNodeModel();
	}

	generateReactWidget(event) {
		return <ConditionalNodeWidget engine={this.engine} node={event.model} />;
	}
}
