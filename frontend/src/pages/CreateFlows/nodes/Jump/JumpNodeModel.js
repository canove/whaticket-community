import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class JumpNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'jump-node'
		});
		this.jumpNodeId = "";
	}

	serialize() {
		return {
			...super.serialize(),
			jumpNodeId: this.jumpNodeId,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.jumpNodeId = ob.data.jumpNodeId;

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
