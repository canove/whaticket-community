import React, { useContext, useEffect, useState } from "react";
import openSocket from "../../services/socket-io";
import toastError from "../../errors/toastError";

import { AuthContext } from "../../context/Auth/AuthContext";
import { Dialog, DialogContent, Paper, Typography } from "@material-ui/core";
import api from "../../services/api";
import { useTranslation } from "react-i18next";

const QrcodeModal = ({ open, onClose, whatsAppId }) => {
	const { i18n } = useTranslation();
	const [qrCode, setQrCode] = useState("");
	const { user } = useContext(AuthContext);

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;

			try {
				const { data } = await api.get(`/whatsapp/${whatsAppId}`);
				setQrCode(data.qrcode);
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId]);

	useEffect(() => {
		if (!whatsAppId) return;
		const socket = openSocket();

		socket.on(`whatsappSession${user.companyId}`, data => {
			if (data.action === "update" && data.session.id === whatsAppId) {
				setQrCode(data.session.qrcode);
			}

			if (data.action === "update" && data.session.qrcode === "") {
				onClose();
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [whatsAppId, onClose]);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="lg" scroll="paper">
			<DialogContent>
				<Paper elevation={0}>
					<Typography color="primary" gutterBottom>
						{i18n.t("qrCode.message")}
					</Typography>
					<img
						src={`${qrCode}`} alt="QR Code"
					/>
				</Paper>
			</DialogContent>
		</Dialog>
	);
};

export default React.memo(QrcodeModal);
