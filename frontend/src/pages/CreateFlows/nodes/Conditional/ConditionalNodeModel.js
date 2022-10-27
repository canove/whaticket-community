import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class ConditionalNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'conditional-node'
		});
		this.conditions = null;
		this.outPortsNumber = 2;
		this.name = "Conditional";
	}

	serialize() {
		return {
			...super.serialize(),
			conditions: this.conditions,
			outPortsNumber: this.outPortsNumber,
			name: this.name
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.conditions = ob.data.conditions;
		this.outPortsNumber = ob.data.outPortsNumber;
		this.name = ob.data.name;

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
