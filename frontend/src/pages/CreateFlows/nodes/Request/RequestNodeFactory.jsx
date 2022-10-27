import * as React from 'react';
import { RequestNodeModel } from './RequestNodeModel';
import { RequestNodeWidget } from './RequestNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class RequestNodeFactory extends AbstractReactFactory {
	constructor() {
		super('request-node');
	}

	generateModel(event) {
		return new RequestNodeModel();
	}

	generateReactWidget(event) {
		return <RequestNodeWidget engine={this.engine} node={event.model} />;
	}
}
