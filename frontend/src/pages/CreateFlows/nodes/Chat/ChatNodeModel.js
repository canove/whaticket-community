import { DefaultPortModel, NodeModel } from '@projectstorm/react-diagrams';

/**
 * Example of a custom model using pure javascript
 */
export class ChatNodeModel extends NodeModel {
	constructor(options = {}) {
		super({
			...options,
			type: 'chat-node'
		});
		this.color = options.color || { options: 'red' };
		this.data = {
			senha: options.senha
		}

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
			data: this.data
		};
	}

	deserialize(ob, engine) {
		super.deserialize(ob, engine);
		this.color = ob.color;
		this.data = ob.data.data;
	}
}
