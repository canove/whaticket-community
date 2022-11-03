import * as React from 'react';
import { TransferQueueNodeModel } from './TransferQueueNodeModel';
import { TransferQueueNodeWidget } from './TransferQueueNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class TransferQueueNodeFactory extends AbstractReactFactory {
	constructor() {
		super('transfer-queue-node');
	}

	generateModel(event) {
		return new TransferQueueNodeModel();
	}

	generateReactWidget(event) {
		return <TransferQueueNodeWidget engine={this.engine} node={event.model} />;
	}
}
