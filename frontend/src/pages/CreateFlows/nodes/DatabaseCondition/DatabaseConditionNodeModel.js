import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class DatabaseConditionNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'database-condition-node'
		});
		this.variable = "";
		this.condition = "";
		this.charactersNumber = 0;
	}

	serialize() {
		return {
			...super.serialize(),
			variable: this.variable,
			condition: this.condition,
			charactersNumber: this.charactersNumber,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.variable = ob.data.variable;
		this.condition = ob.data.condition;
		this.charactersNumber = ob.data.charactersNumber;

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
