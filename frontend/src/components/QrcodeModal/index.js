import React from "react";
import QRCode from "qrcode.react";

import {
	Dialog,
	DialogContent,
	Paper,
	Typography,
	DialogTitle,
} from "@material-ui/core";
import { i18n } from "../../translate/i18n";

const QrcodeModal = ({ open, onClose, session }) => {
	if (session) {
		return (
			<Dialog open={open} onClose={onClose} maxWidth="lg" scroll="paper">
				<DialogTitle>{session.name}</DialogTitle>
				<DialogContent>
					<Paper elevation={0}>
						<Typography color="primary" gutterBottom>
							{i18n.t("qrCode.message")}
						</Typography>
						{session.qrcode ? (
							<QRCode value={session.qrcode} size={256} />
						) : (
							<span>loading</span>
						)}
					</Paper>
				</DialogContent>
			</Dialog>
		);
	} else {
		return null;
	}
};

export default QrcodeModal;
