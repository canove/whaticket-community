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
import { TextField } from "@material-ui/core";

const RegisterChart = () => {
	const theme = useTheme();
	const { i18n } = useTranslation();

	const date = useRef(new Date().toISOString());
	const [selectedDate, setSelectedDate] = useState("");
	const [registers, setRegisters] = useState([]);

	const initialChart = [
		{ time: "08:00", total: 0, sent: 0 },
		{ time: "09:00", total: 0, sent: 0 },
		{ time: "10:00", total: 0, sent: 0 },
		{ time: "11:00", total: 0, sent: 0 },
		{ time: "12:00", total: 0, sent: 0 },
		{ time: "13:00", total: 0, sent: 0 },
		{ time: "14:00", total: 0, sent: 0 },
		{ time: "15:00", total: 0, sent: 0 },
		{ time: "16:00", total: 0, sent: 0 },
		{ time: "17:00", total: 0, sent: 0 },
		{ time: "18:00", total: 0, sent: 0 },
		{ time: "19:00", total: 0, sent: 0 },
	];
	const [chartData, setChartData] = useState(initialChart);

	useEffect(() => {
		const fetchRegisters = async () => {
			try {
				const { data } = await api.get("/registers/chart", {
					params: { date: date.current, selectedDate },
				})
				setRegisters(data.reports);
			} catch (err) {
				toastError(err);
			}
		}

		fetchRegisters();
		setChartData(initialChart);
	}, [date, selectedDate]);

	useEffect(() => {
		if (registers) {
			setChartData(prevState => {
				let aux = [...prevState];
	
				aux.forEach(a => {
					registers.forEach(reg => {
						format(startOfHour(parseISO(reg.createdAt)), "HH:mm") === a.time && a.total++;
						
						if (reg.sentAt) {
							format(startOfHour(parseISO(reg.sentAt)), "HH:mm") === a.time && a.sent++;
						}
					});
				});
	
				return aux;
			});
		}
	}, [registers]);

	return (
		<React.Fragment>
			<div style={{ display: "flex", justifyContent: "space-between" }}>
				<div>
					<Title>
						{`Disparos no dia: ${registers.length}`}
					</Title>
					<Title>
						{`Enviados no dia: ${registers.reduce((accumulator, reg) => {
							const num = reg.sentAt ? 1 : 0
							return accumulator + num;
						}, 0)}`}
					</Title>
				</div>
				<div>
					<TextField
						onChange={(e) => {
							setSelectedDate(e.target.value);
						}}
						value={selectedDate}
						label={i18n.t("dashboard.date")}
						InputLabelProps={{ shrink: true, required: true }}
						type="date"
					/>
				</div>
			</div>
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
					<Bar dataKey="total" fill={theme.palette.primary.main} />
					<Bar dataKey="sent" fill="#82ca9d" />
				</BarChart>
			</ResponsiveContainer>
		</React.Fragment>
	);
};

export default RegisterChart;
