import * as React from 'react';
import { TemplateNodeModel } from './TemplateNodeModel';
import { TemplateNodeWidget } from './TemplateNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class TemplateNodeFactory extends AbstractReactFactory {
	constructor() {
		super('template-node');
	}

	generateModel(event) {
		return new TemplateNodeModel();
	}

	generateReactWidget(event) {
		return <TemplateNodeWidget engine={this.engine} node={event.model} />;
	}
}
