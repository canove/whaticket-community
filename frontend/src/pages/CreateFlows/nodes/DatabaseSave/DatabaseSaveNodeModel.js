import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

export class DatabaseSaveNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'database-save-node'
		});
		this.input = "input1";
		this.value = "";
	}

	serialize() {
		return {
			...super.serialize(),
			input: this.input,
			value: this.value,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.input = ob.data.input;
		this.value = ob.data.value;

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
