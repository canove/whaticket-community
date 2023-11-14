import React, { useState, createContext } from "react";

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

export { EditMessageContext, EditMessageProvider};
