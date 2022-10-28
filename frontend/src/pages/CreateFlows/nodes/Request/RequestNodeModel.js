import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class RequestNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'request-node'
		});
		this.url = "";
		this.method = "";
		this.header = "";
		this.body = "";
	}

	serialize() {
		return {
			...super.serialize(),
			url: this.url,
			method: this.method,
			header: this.header,
			body: this.body,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.url = ob.data.url;
		this.method = ob.data.method;
		this.header = ob.data.header;
		this.body = ob.data.body;

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
