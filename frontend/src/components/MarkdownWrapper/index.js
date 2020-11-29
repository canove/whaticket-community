import React from "react";
import Markdown from "markdown-to-jsx";

import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles(theme => ({
	markdownP: {
		marginBlockStart: 0,
		marginBlockEnd: 0,
	},
}));

const CustomLink = ({ children, ...props }) => (
	<a {...props} target="_blank" rel="noopener noreferrer">
		{children}
	</a>
);

const MarkdownWrapper = ({ children }) => {
	const classes = useStyles();
	const boldRegex = /\*(.*?)\*/g;

	if (children && boldRegex.test(children)) {
		children = children.replace(boldRegex, "**$1**");
	}

	return (
		<Markdown
			options={{
				disableParsingRawHTML: true,
				overrides: {
					a: { component: CustomLink },
					p: {
						props: {
							className: classes.markdownP,
						},
					},
				},
			}}
		>
			{children}
		</Markdown>
	);
};

export default MarkdownWrapper;
