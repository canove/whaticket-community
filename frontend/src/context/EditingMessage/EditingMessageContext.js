import React, { useState, createContext } from "react";
import PropTypes from "prop-types";

const EditMessageContext = createContext();

const EditMessageProvider = ({ children }) => {
	const [editingMessage, setEditingMessage] = useState(null);

	return (
		<EditMessageContext.Provider
			value={{ editingMessage, setEditingMessage }}
		>
			{children}
		</EditMessageContext.Provider>
	);
};

EditMessageProvider.propTypes = {
	children: PropTypes.array
}

export { EditMessageContext, EditMessageProvider};
