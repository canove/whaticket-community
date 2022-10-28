import * as React from 'react';
import { SaveVariableNodeModel } from './SaveVariableNodeModel';
import { SaveVariableNodeWidget } from './SaveVariableNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class SaveVariableNodeFactory extends AbstractReactFactory {
	constructor() {
		super('save-variable-node');
	}

	generateModel(event) {
		return new SaveVariableNodeModel();
	}

	generateReactWidget(event) {
		return <SaveVariableNodeWidget engine={this.engine} node={event.model} />;
	}
}
