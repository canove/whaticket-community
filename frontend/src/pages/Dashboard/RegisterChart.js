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
	Tooltip
} from "recharts";
import { startOfHour, parseISO, format } from "date-fns";

import Title from "./Title";
import { useTranslation } from "react-i18next";
import toastError from "../../errors/toastError";
import api from "../../services/api";

const RegisterChart = () => {
	const theme = useTheme();
	const { i18n } = useTranslation();

	const date = useRef(new Date().toISOString());
	const [registers, setRegisters] = useState([]);

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
		const fetchRegisters = async () => {
			try {
				const { data } = await api.get("/registers/chart", {
					params: { date: date.current },
				})
				setRegisters(data.reports);
			} catch (err) {
				toastError(err);
			}
		}
		fetchRegisters();
	}, []);

	useEffect(() => {
		if (registers) {
			setChartData(prevState => {
				let aux = [...prevState];
	
				aux.forEach(a => {
					registers.forEach(reg => {
						format(startOfHour(parseISO(reg.createdAt)), "HH:mm") === a.time &&
							a.amount++;
					});
				});
	
				return aux;
			});
		}
	}, [registers]);

	return (
		<React.Fragment>
			<Title>
				{`Disparos por dia: ${registers.length}`}
			</Title>
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
							Disparos
						</Label>
					</YAxis>
					<Tooltip />
					<Bar dataKey="amount" fill={theme.palette.primary.main} />
				</BarChart>
			</ResponsiveContainer>
		</React.Fragment>
	);
};

export default RegisterChart;
