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
		this.color = options.color || { options: 'red' };
		this.main = true;

		// this.portsOut = [];
        // this.portsIn = [];

		// setup an in and out port
		// this.addPort(
		// 	new DefaultPortModel({
		// 		in: false,
		// 		name: 'true'
		// 	})
		// );

		// this.addPort(
		// 	new DefaultPortModel({
		// 		in: false,
		// 		name: 'false'
		// 	})
		// );
	}

	serialize() {
		return {
			...super.serialize(),
			color: this.color,
			main: this.main
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.color = ob.color;
		this.main = ob.data.main;
	}
}
