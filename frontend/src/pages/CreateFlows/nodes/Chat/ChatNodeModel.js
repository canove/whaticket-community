import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';
import { AdvancedPortModel } from '../../ports/AdvancedPort/AdvancedPortModel';

/**
 * Example of a custom model using pure javascript
 */
export class ChatNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'chat-node'
		});
		this.data = {
			content: '',
		}
	}

	serialize() {
		return {
			...super.serialize(),
			data: this.data,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.data = ob.data.data;

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
