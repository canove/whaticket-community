import React, { useState } from "react";

import { GithubPicker } from "react-color";

const ColorPicker = ({ onChange, currentColor }) => {
	const [color, setColor] = useState(currentColor);

	const handleChange = color => {
		setColor(color.hex);
	};

	return (
		<div>
			<GithubPicker
				width={"100%"}
				triangle="hide"
				color={color}
				onChange={handleChange}
				onChangeComplete={color => onChange(color.hex)}
			/>
		</div>
	);
};

export default ColorPicker;
