import React, { useEffect, useState } from "react";

import { Avatar, Box, Chip, SvgIcon, Typography } from "@material-ui/core";
import Skeleton from "@material-ui/lab/Skeleton";

import api from "../../services/api";

// Material-UI v4 has no "verified"/check-decagram icon, so we render the
// mdi check-decagram path inline to match the desired "Oficial" badge.
const CheckDecagramIcon = props => (
	<SvgIcon viewBox="0 0 24 24" {...props}>
		<path d="m23 12l-2.44-2.78l.34-3.68l-3.61-.82l-1.89-3.18L12 3L8.6 1.54L6.71 4.72l-3.61.81l.34 3.68L1 12l2.44 2.78l-.34 3.69l3.61.82l1.89 3.18L12 21l3.4 1.46l1.89-3.18l3.61-.82l-.34-3.68zm-13 5l-4-4l1.41-1.41L10 14.17l6.59-6.59L18 9z" />
	</SvgIcon>
);

// For a wame connection, shows the live profile picture + number + an "Oficial"
// badge when the account is official. Info is fetched on demand (never stored).
const WameConnectionInfo = ({ whatsApp }) => {
	const [info, setInfo] = useState(null);
	const [loaded, setLoaded] = useState(false);
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
			} finally {
				if (active) setLoaded(true);
			}
		};
		fetchInfo();
		return () => {
			active = false;
		};
	}, [whatsApp.id, isWame]);

	// While the wame info is loading, show a skeleton placeholder.
	if (isWame && !loaded) {
		return (
			<Box
				display="flex"
				alignItems="center"
				justifyContent="center"
				style={{ gap: 8 }}
			>
				<Skeleton animation="wave" variant="circle" width={40} height={40} />
				<Box textAlign="left">
					<Skeleton animation="wave" height={20} width={90} />
					<Skeleton animation="wave" height={16} width={110} />
				</Box>
			</Box>
		);
	}

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
					icon={
						<CheckDecagramIcon style={{ color: "#1D4ED8", fontSize: 16 }} />
					}
					label="Oficial"
					style={{
						backgroundColor: "#DBEAFE",
						color: "#1D4ED8",
						fontWeight: 600,
					}}
				/>
			) : null}
		</Box>
	);
};

export default WameConnectionInfo;
