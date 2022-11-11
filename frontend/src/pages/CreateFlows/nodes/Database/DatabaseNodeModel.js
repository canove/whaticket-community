import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class DatabaseNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'database-node'
		});
		this.variable = "";
		this.varType = "text";
	}

	serialize() {
		return {
			...super.serialize(),
			variable: this.variable,
			varType: this.varType,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.variable = ob.data.variable;
		this.varType = ob.data.varType;

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
