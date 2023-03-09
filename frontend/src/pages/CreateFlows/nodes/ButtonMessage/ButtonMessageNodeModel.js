import { DefaultPortModel, NodeModel } from "@projectstorm/react-diagrams";

/**
 * Example of a custom model using pure javascript
 */
export class ButtonMessageNodeModel extends NodeModel {
  constructor(options = {}) {
    super({
      ...options,
      type: "button-message-node",
    });
    this.text = "";
    this.footer = "";
    this.imageUrl = "";
    this.buttons = [];
  }

  serialize() {
    return {
      ...super.serialize(),
      text: this.text,
      footer: this.footer,
      imageUrl: this.imageUrl,
      buttons: this.buttons,
    };
  }

  deserialize(ob, engine) {
    super.deserialize(ob, engine);
    this.text = ob.data.text;
    this.footer = ob.data.footer;
    this.imageUrl = ob.data.imageUrl;
    this.buttons = ob.data.buttons;

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
    });
  }
}
