import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import api from "../../services/api";
import { GetApp } from "@material-ui/icons";
import { Button, Divider } from "@material-ui/core";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	downloadAudio: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "inherit",
		padding: 10,
	},
}));

const ModalAudioCors = ({ audioUrl }) => {
	const classes = useStyles();
	const [fetching, setFetching] = useState(true);
	const [blobUrl, setBlobUrl] = useState("");

	useEffect(() => {
		if (!audioUrl) return;
		const fetchAudio = async () => {
			const { data, headers } = await api.get(audioUrl, {
				responseType: "blob",
			});
			const url = window.URL.createObjectURL(
				new Blob([data], { type: headers["content-type"] })
			);
			setBlobUrl(url);
			setFetching(false);
		};
		fetchAudio();
	}, [audioUrl]);

	return (
		<>
			{ (fetching === false) &&
				<audio controls>
					<source src={blobUrl} type="audio/ogg"></source>
				</audio>
			}
		</>
	);
};

export default ModalAudioCors;
