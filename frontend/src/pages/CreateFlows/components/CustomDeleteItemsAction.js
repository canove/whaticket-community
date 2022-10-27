import * as _ from 'lodash';
import { Action, InputType } from '@projectstorm/react-canvas-core';

export class CustomDeleteItemsAction extends Action {
	constructor(options = {}) {
		options = {
			keyCodes: [46, 8],
			...options
		};
		super({
			type: InputType.KEY_DOWN,
			fire: (event) => {
				if (options.keyCodes.indexOf(event.event.keyCode) !== -1) {
					const selectedEntities = this.engine.getModel().getSelectedEntities();
					if (selectedEntities.length > 0) {
						_.forEach(selectedEntities, (model) => {
							if (!model.isLocked() && !model.main) {
								model.remove();
							}
						});
						this.engine.repaintCanvas();
					}
				}
			}
		});
	}
}
