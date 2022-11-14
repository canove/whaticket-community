import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class MultipleMessagesNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'multiple-messages-node'
		});
		this.messages = [{ id: 1, messageType: "text", messageContent: "", textType: "text" }];
	}

	serialize() {
		return {
			...super.serialize(),
			messages: this.messages,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.messages = ob.data.messages;

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
