import * as React from 'react';
import { ChatNodeModel } from './ChatNodeModel';
import { ChatNodeWidget } from './ChatNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class ChatNodeFactory extends AbstractReactFactory {
	constructor() {
		super('chat-node');
	}

	generateModel(event) {
		return new ChatNodeModel();
	}

	generateReactWidget(event) {
		return <ChatNodeWidget engine={this.engine} node={event.model} />;
	}
}
