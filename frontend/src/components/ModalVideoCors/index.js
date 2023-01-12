import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import api from "../../services/api";
import { GetApp } from "@material-ui/icons";
import { Button, Divider } from "@material-ui/core";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	messageMedia: {
		objectFit: "cover",
		width: 250,
		height: 200,
		borderTopLeftRadius: 8,
		borderTopRightRadius: 8,
		borderBottomLeftRadius: 8,
		borderBottomRightRadius: 8,
	  },
}));

const ModalVideoCors = ({ videoUrl }) => {
	const classes = useStyles();
	const [fetching, setFetching] = useState(true);
	const [blobUrl, setBlobUrl] = useState("");

	useEffect(() => {
		if (!videoUrl) return;
		const fetchVideo = async () => {
			const { data, headers } = await api.get(videoUrl, {
				responseType: "blob",
			});
			const url = window.URL.createObjectURL(
				new Blob([data], { type: headers["content-type"] })
			);
			setBlobUrl(url);
			setFetching(false);
		};
		fetchVideo();
	}, [videoUrl]);

	return (
		<>
			{ (fetching === false) &&
				<video
					className={classes.messageMedia}
					src={blobUrl}
					controls
				/>
			}
		</>
	);
};

export default ModalVideoCors;
