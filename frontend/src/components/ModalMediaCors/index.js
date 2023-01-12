import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";

import api from "../../services/api";
import { GetApp } from "@material-ui/icons";
import { Button, Divider } from "@material-ui/core";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles(theme => ({
	downloadMedia: {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "inherit",
		padding: 10,
	},
}));

const ModalMediaCors = ({ mediaUrl }) => {
	const classes = useStyles();
	const [fetching, setFetching] = useState(true);
	const [blobUrl, setBlobUrl] = useState("");

	useEffect(() => {
		if (!mediaUrl) return;
		const fetchMedia = async () => {
			const { data, headers } = await api.get(mediaUrl, {
				responseType: "blob",
			});
			const url = window.URL.createObjectURL(
				new Blob([data], { type: headers["content-type"] })
			);
			setBlobUrl(url);
			setFetching(false);
		};
		fetchMedia();
	}, [mediaUrl]);

	return (
		<>
          <div className={classes.downloadMedia}>
            <Button
              startIcon={<GetApp />}
              color="primary"
              variant="outlined"
              target="_blank"
              href={fetching ? mediaUrl : blobUrl}
            >
             {i18n.t("locationPreview.download")}
            </Button>
          </div>
          <Divider />
        </>
	);
};

export default ModalMediaCors;