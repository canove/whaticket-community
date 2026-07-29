import React, { useEffect, useState } from "react";

import { Dialog, DialogContent, DialogTitle, Typography } from "@material-ui/core";

import openSocket from "../../services/socket-io";
import toastError from "../../errors/toastError";
import api from "../../services/api";

// Official (Meta) WhatsApp accounts don't have a QR Code — they connect through
// Meta's Embedded Signup, embedded here as an iframe using the wame instance key.
const WameOfficialModal = ({ open, onClose, whatsAppId }) => {
	const [wameKey, setWameKey] = useState("");

	useEffect(() => {
		const fetchSession = async () => {
			if (!whatsAppId) return;
			try {
				const { data } = await api.get(`/whatsapp/${whatsAppId}`);
				setWameKey(data.key || "");
			} catch (err) {
				toastError(err);
			}
		};
		fetchSession();
	}, [whatsAppId]);

	useEffect(() => {
		if (!whatsAppId) return;
		const socket = openSocket();

		socket.on("whatsappSession", data => {
			if (
				data.action === "update" &&
				data.session.id === whatsAppId &&
				data.session.status === "CONNECTED"
			) {
				onClose();
			}
		});

		return () => {
			socket.disconnect();
		};
	}, [whatsAppId, onClose]);

	return (
		<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth scroll="paper">
			<DialogTitle>Conectar conta oficial (Meta)</DialogTitle>
			<DialogContent>
				<Typography color="textSecondary" gutterBottom>
					Faça login com a Meta para conectar sua conta oficial do WhatsApp.
				</Typography>
				{wameKey ? (
					<iframe
						title="Meta Embedded Signup"
						src={`https://fb.wame.api.br/${wameKey}?compact=1`}
						style={{
							border: 0,
							width: "100%",
							maxWidth: 420,
							minHeight: 100,
							display: "block",
							background: "transparent",
						}}
						scrolling="no"
					/>
				) : (
					<span>Carregando...</span>
				)}
			</DialogContent>
		</Dialog>
	);
};

export default React.memo(WameOfficialModal);
