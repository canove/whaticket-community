import React from "react";
import QRCode from "qrcode.react";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";

const useStyles = makeStyles({
	main: {
		flex: 1,
	},
});

const Qrcode = ({ qrCode }) => {
	const classes = useStyles();

	return (
		<div>
			<Typography component="h2" variant="h6" color="primary" gutterBottom>
				Leia o QrCode para iniciar a sessão
			</Typography>
			<QRCode value={qrCode} size={256} />
		</div>
	);
};

export default Qrcode;
