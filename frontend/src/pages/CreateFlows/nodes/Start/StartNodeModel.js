import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class StartNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'start-node'
		});
		this.main = true;
		this.url = "";
		this.header = "";
	}

	serialize() {
		return {
			...super.serialize(),
			main: this.main,
			url: this.url,
			header: this.header,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.main = ob.data.main;
		this.url = ob.data.url;
		this.header = ob.data.header;

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
