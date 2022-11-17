import * as React from 'react';
import { JumpNodeModel } from './JumpNodeModel';
import { JumpNodeWidget } from './JumpNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class JumpNodeFactory extends AbstractReactFactory {
	constructor() {
		super('jump-node');
	}

	generateModel(event) {
		return new JumpNodeModel();
	}

	generateReactWidget(event) {
		return <JumpNodeWidget engine={this.engine} node={event.model} />;
	}
}
