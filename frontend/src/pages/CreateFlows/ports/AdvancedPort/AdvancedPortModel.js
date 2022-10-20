import { DefaultPortModel, PortModel } from '@projectstorm/react-diagrams';

import { AdvancedLinkModel } from '../../links/AdvancedLink/AdvancedLinkModel';

export class AdvancedPortModel extends PortModel {
	constructor(isIn, name, label) {
		super({
			type: 'advanced',
			isIn, 
			name,
			label
		});
	}

	createLinkModel() {
		return new AdvancedLinkModel();
	}
}
