import * as React from 'react';

import { DefaultLinkFactory } from '@projectstorm/react-diagrams';

import { AdvancedLinkModel } from './AdvancedLinkModel';
import { AdvancedLinkWidget } from './AdvancedLinkWidget';

export class AdvancedLinkFactory extends DefaultLinkFactory {
	constructor() {
		super('advanced');
	}

	generateModel() {
		return new AdvancedLinkModel();
	}

	generateReactWidget(event) {
		return <AdvancedLinkWidget link={event.model} diagramEngine={this.engine} />;
	}
}
