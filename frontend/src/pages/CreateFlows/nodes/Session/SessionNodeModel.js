import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class SessionNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'session-node'
		});
	}

	serialize() {
		return {
			...super.serialize(),
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);

		this.updatePorts();
	}

	updatePorts() {
		const ports = this.getPorts();

		Object.keys(ports).find((port) => {
			if (port.includes("in")) {
				ports[port].options.isIn = true;
			}
			if (port.includes("out")) {
				ports[port].options.isIn = false;
			}
		})
	}
}
