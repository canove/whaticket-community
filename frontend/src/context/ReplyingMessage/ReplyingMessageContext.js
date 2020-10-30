import React, { useState, createContext } from "react";

const ReplyMessageContext = createContext();

const ReplyMessageProvider = ({ children }) => {
	const [replyingMessage, setReplyingMessage] = useState(null);

	return (
		<ReplyMessageContext.Provider
			value={{ replyingMessage, setReplyingMessage }}
		>
			{children}
		</ReplyMessageContext.Provider>
	);
};

export { ReplyMessageContext, ReplyMessageProvider };
