import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class StartInactivityNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'start-inactivity-node'
		});
		this.inactivityTime = "";
	}

	serialize() {
		return {
			...super.serialize(),
			inactivityTime: this.inactivityTime,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.inactivityTime = ob.data.inactivityTime;

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
