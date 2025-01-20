import { useState, useEffect } from "react";
import { makeStyles } from "@mui/styles";

import ModalImage from "react-modal-image";
import api from "../../services/api";
import type { Theme } from "@mui/material/styles";

const useStyles = makeStyles((_theme: Theme) => ({
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

interface ModalImageCorsProps {
  imageUrl: string;
}

const ModalImageCors = ({ imageUrl }: ModalImageCorsProps) => {
  const classes = useStyles();
  const [fetching, setFetching] = useState(true);
  const [blobUrl, setBlobUrl] = useState("");

  useEffect(() => {
    if (!imageUrl) return;
    const fetchImage = async () => {
      const { data, headers } = await api.get(imageUrl, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(
        new Blob([data], { type: headers["content-type"] })
      );
      setBlobUrl(url);
      setFetching(false);
    };
    fetchImage();
  }, [imageUrl]);

  return (
    <ModalImage
      className={classes.messageMedia}
      small={fetching ? imageUrl : blobUrl}
      medium={fetching ? imageUrl : blobUrl}
      large={fetching ? imageUrl : blobUrl}
      alt="image"
    />
  );
};

export default ModalImageCors;
