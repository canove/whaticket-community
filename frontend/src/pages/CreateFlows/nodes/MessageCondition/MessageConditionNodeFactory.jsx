import * as React from 'react';
import { MessageConditionNodeModel } from './MessageConditionNodeModel';
import { MessageConditionNodeWidget } from './MessageConditionNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class MessageConditionNodeFactory extends AbstractReactFactory {
	constructor() {
		super('message-condition-node');
	}

	generateModel(event) {
		return new MessageConditionNodeModel();
	}

	generateReactWidget(event) {
		return <MessageConditionNodeWidget engine={this.engine} node={event.model} />;
	}
}
