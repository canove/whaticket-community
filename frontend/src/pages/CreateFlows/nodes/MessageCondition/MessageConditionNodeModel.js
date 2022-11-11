import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class MessageConditionNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'message-condition-node'
		});
		this.outPorts = [{ name: "out-1", customName: "out-1", id: 1 }];
		this.currentId = 1;
		this.conditions = {
			"1": ""
		}
	}

	serialize() {
		return {
			...super.serialize(),
			outPorts: this.outPorts,
			currentId: this.currentId,
			conditions: this.conditions,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.outPorts = ob.data.outPorts;
		this.currentId = ob.data.currentId;
		this.conditions = ob.data.conditions;

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
