import React, { useEffect, useState } from "react";

import { Avatar, Box, Chip, Typography } from "@material-ui/core";

import api from "../../services/api";

// For a wame connection, shows the live profile picture + number + a "Meta"
// badge when the account is official. Info is fetched on demand (never stored).
const WameConnectionInfo = ({ whatsApp }) => {
	const [info, setInfo] = useState(null);
	const isWame = Boolean(whatsApp.key);

	useEffect(() => {
		let active = true;
		const fetchInfo = async () => {
			if (!isWame) return;
			try {
				const { data } = await api.get(`/wame/instance/${whatsApp.id}/info`);
				if (active) setInfo(data);
			} catch (err) {
				// ignore — fall back to the plain name
			}
		};
		fetchInfo();
		return () => {
			active = false;
		};
	}, [whatsApp.id, isWame]);

	if (!isWame || !info) {
		return <span>{whatsApp.name}</span>;
	}

	return (
		<Box
			display="flex"
			alignItems="center"
			justifyContent="center"
			style={{ gap: 8 }}
		>
			{info.profilePicUrl ? (
				<Avatar src={info.profilePicUrl} alt={whatsApp.name} />
			) : null}
			<Box textAlign="left">
				<Typography variant="body2">
					<strong>{whatsApp.name}</strong>
				</Typography>
				{info.number ? (
					<Typography variant="caption" color="textSecondary">
						{info.number}
					</Typography>
				) : null}
			</Box>
			{info.official ? (
				<Chip
					size="small"
					label="Meta"
					style={{ backgroundColor: "#1877F2", color: "#fff" }}
				/>
			) : null}
		</Box>
	);
};

export default WameConnectionInfo;
