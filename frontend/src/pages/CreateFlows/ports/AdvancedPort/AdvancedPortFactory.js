import { AbstractModelFactory } from '@projectstorm/react-canvas-core';
import { AdvancedPortModel } from './AdvancedPortModel';

export class AdvancedPortFactory extends AbstractModelFactory {
	constructor() {
		super('advanced');
	}

	generateModel(event) {
		return new AdvancedPortModel();
	}
}