import { Dialog } from "@material-ui/core";
import React, { useState } from "react";

import { GithubPicker } from "react-color";

const ColorPicker = ({ onChange, currentColor, handleClose, open }) => {
	const [color, setColor] = useState(currentColor);

	const handleChange = color => {
		setColor(color.hex);
		handleClose();
	};

	return (
		<Dialog
			onClose={handleClose}
			aria-labelledby="simple-dialog-title"
			open={open}
		>
			<GithubPicker
				width={"100%"}
				triangle="hide"
				color={color}
				onChange={handleChange}
				onChangeComplete={color => onChange(color.hex)}
			/>
		</Dialog>
	);
};

export default ColorPicker;
