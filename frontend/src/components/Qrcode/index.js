import React from "react";
import QRCode from "qrcode.react";
import Typography from "@material-ui/core/Typography";

import { i18n } from "../../translate/i18n";

const Qrcode = ({ qrCode }) => {
	return (
		<div>
			<Typography color="primary" gutterBottom>
				{i18n.t("qrCode.message")}
			</Typography>
			<QRCode value={qrCode} size={256} />
		</div>
	);
};

export default Qrcode;
