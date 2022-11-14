import * as React from 'react';
import { MultipleMessagesNodeModel } from './MultipleMessagesNodeModel';
import { MultipleMessagesNodeWidget } from './MultipleMessagesNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class MultipleMessagesNodeFactory extends AbstractReactFactory {
	constructor() {
		super('multiple-messages-node');
	}

	generateModel(event) {
		return new MultipleMessagesNodeModel();
	}

	generateReactWidget(event) {
		return <MultipleMessagesNodeWidget engine={this.engine} node={event.model} />;
	}
}
