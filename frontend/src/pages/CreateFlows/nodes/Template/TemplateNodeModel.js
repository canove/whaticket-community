import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

export class TemplateNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'template-node'
		});
		this.templateId = "";
	}

	serialize() {
		return {
			...super.serialize(),
			templateId: this.templateId,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.templateId = ob.data.templateId;

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
