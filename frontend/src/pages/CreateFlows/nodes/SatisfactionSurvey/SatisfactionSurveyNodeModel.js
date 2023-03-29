import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

export class SatisfactionSurveyNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'satisfaction-survey-node'
		});
		this.surveyId = "";
	}

	serialize() {
		return {
			...super.serialize(),
			surveyId: this.surveyId,
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.surveyId = ob.data.surveyId;

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
