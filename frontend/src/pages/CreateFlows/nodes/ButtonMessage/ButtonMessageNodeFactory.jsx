import * as React from 'react';
import { ButtonMessageNodeModel } from './ButtonMessageNodeModel';
import { ButtonMessageNodeWidget } from './ButtonMessageNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class ButtonMessageNodeFactory extends AbstractReactFactory {
	constructor() {
		super('button-message-node');
	}

	generateModel(event) {
		return new ButtonMessageNodeModel();
	}

	generateReactWidget(event) {
		return <ButtonMessageNodeWidget engine={this.engine} node={event.model} />;
	}
}
