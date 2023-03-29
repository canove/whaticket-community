import * as React from 'react';
import { SatisfactionSurveyNodeModel } from './SatisfactionSurveyNodeModel';
import { SatisfactionSurveyNodeWidget } from './SatisfactionSurveyNodeWidget';
import { AbstractReactFactory } from '@projectstorm/react-canvas-core';

export class SatisfactionSurveyNodeFactory extends AbstractReactFactory {
	constructor() {
		super('satisfaction-survey-node');
	}

	generateModel(event) {
		return new SatisfactionSurveyNodeModel();
	}

	generateReactWidget(event) {
		return <SatisfactionSurveyNodeWidget engine={this.engine} node={event.model} />;
	}
}
