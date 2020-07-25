import React from "react";
import Linkify from "react-linkify";

const componentDecorator = (href, text, key) => (
	<a href={href} key={key} target="_blank" rel="noopener noreferrer">
		{text}
	</a>
);

const LinkifyWithTargetBlank = ({ children }) => {
	return <Linkify componentDecorator={componentDecorator}>{children}</Linkify>;
};

export default LinkifyWithTargetBlank;
