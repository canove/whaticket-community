import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "@material-ui/core/styles";
import {
	BarChart,
	CartesianGrid,
	Bar,
	XAxis,
	YAxis,
	Label,
	ResponsiveContainer,
} from "recharts";
import { startOfHour, parseISO, format } from "date-fns";

import { i18n } from "../../translate/i18n";

import Title from "./Title";
import useTickets from "../../hooks/useTickets";

const Chart = () => {
	const theme = useTheme();

	const date = useRef(new Date().toISOString());
	const { tickets } = useTickets({ date: date.current });

	const [chartData, setChartData] = useState([
		{ time: "08:00", amount: 0 },
		{ time: "09:00", amount: 0 },
		{ time: "10:00", amount: 0 },
		{ time: "11:00", amount: 0 },
		{ time: "12:00", amount: 0 },
		{ time: "13:00", amount: 0 },
		{ time: "14:00", amount: 0 },
		{ time: "15:00", amount: 0 },
		{ time: "16:00", amount: 0 },
		{ time: "17:00", amount: 0 },
		{ time: "18:00", amount: 0 },
		{ time: "19:00", amount: 0 },
	]);

	useEffect(() => {
		setChartData(prevState => {
			let aux = [...prevState];

			aux.forEach(a => {
				tickets.forEach(ticket => {
					format(startOfHour(parseISO(ticket.createdAt)), "HH:mm") === a.time &&
						a.amount++;
				});
			});

			return aux;
		});
	}, [tickets]);

	return (
		<React.Fragment>
			<Title>{`${i18n.t("dashboard.charts.perDay.title")}${
				tickets.length
			}`}</Title>
			<ResponsiveContainer>
				<BarChart
					data={chartData}
					barSize={40}
					width={730}
					height={250}
					margin={{
						top: 16,
						right: 16,
						bottom: 0,
						left: 24,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis dataKey="time" stroke={theme.palette.text.secondary} />
					<YAxis
						type="number"
						allowDecimals={false}
						stroke={theme.palette.text.secondary}
					>
						<Label
							angle={270}
							position="left"
							style={{ textAnchor: "middle", fill: theme.palette.text.primary }}
						>
							Tickets
						</Label>
					</YAxis>
					<Bar dataKey="amount" fill={theme.palette.primary.main} />
				</BarChart>
			</ResponsiveContainer>
		</React.Fragment>
	);
};

export default Chart;
