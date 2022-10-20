import * as React from 'react';

import { DefaultLinkWidget } from '@projectstorm/react-diagrams';
import { LinkWidget } from '@projectstorm/react-diagrams-core';

import CustomLinkArrowWidget from '../CustomArrowLink/CustomArrowLinkWidget';

export class AdvancedLinkWidget extends DefaultLinkWidget {
	generateArrow(point, previousPoint) {
		return (
			<CustomLinkArrowWidget
				key={point.getID()}
				point={point}
				previousPoint={previousPoint}
				colorSelected={this.props.link.getOptions().selectedColor}
				color={this.props.link.getOptions().color}
			/>
		);
	}

	render() {
		//ensure id is present for all points on the path
		var points = this.props.link.getPoints();
		var paths = [];
		this.refPaths = [];

		//draw the multiple anchors and complex line instead
		for (let j = 0; j < points.length - 1; j++) {
			paths.push(
				this.generateLink(
					LinkWidget.generateLinePath(points[j], points[j + 1]),
					{
						'data-linkid': this.props.link.getID(),
						'data-point': j,
						onMouseDown: (event) => {
							this.addPointToLink(event, j + 1);
						}
					},
					j
				)
			);
		}

		//render the circles
		for (let i = 1; i < points.length - 1; i++) {
			paths.push(this.generatePoint(points[i]));
		}

		if (this.props.link.getTargetPort() !== null) {
			paths.push(this.generateArrow(points[points.length - 1], points[points.length - 2]));
		} else {
			paths.push(this.generatePoint(points[points.length - 1]));
		}

		return <g data-default-link-test={this.props.link.getOptions().testName}>{paths}</g>;
	}
}
