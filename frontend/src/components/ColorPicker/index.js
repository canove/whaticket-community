import { Dialog } from "@material-ui/core";
import React, { useState } from "react";

import { GithubPicker } from "react-color";

const ColorPicker = ({ onChange, currentColor, handleClose, open }) => {
  const [selectedColor, setSelectedColor] = useState(currentColor);

  const handleChange = (color) => {
    setSelectedColor(color.hex);
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
        color={selectedColor}
        onChange={handleChange}
        onChangeComplete={(color) => onChange(color.hex)}
      />
    </Dialog>
  );
};

export default ColorPicker;
