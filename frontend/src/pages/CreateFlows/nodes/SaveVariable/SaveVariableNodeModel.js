import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class SaveVariableNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'save-variable-node'
		});
		this.save = "";
	}

	serialize() {
		return {
			...super.serialize(),
			save: this.save,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.save = ob.data.save;

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
