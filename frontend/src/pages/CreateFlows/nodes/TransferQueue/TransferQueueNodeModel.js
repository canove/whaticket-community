import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class TransferQueueNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'transfer-queue-node'
		});
		this.queueId = "";
		this.queueType = "queue";
	}

	serialize() {
		return {
			...super.serialize(),
			queueId: this.queueId,
			queueType: this.queueType,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.queueId = ob.data.queueId;
		this.queueType = ob.data.queueType;

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
