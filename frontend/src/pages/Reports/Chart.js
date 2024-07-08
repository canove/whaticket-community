import { useTheme } from "@material-ui/core/styles";
import React from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import Title from "./Title";

const Chart = ({ title, total, chartData }) => {
  const theme = useTheme();

  return (
    <React.Fragment>
      <Title>
        {title}: {total}
      </Title>
      <ResponsiveContainer>
        <LineChart
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
          <XAxis dataKey="date" stroke={theme.palette.text.secondary} />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Line type="monotone" dataKey="count" stroke="#2576d2" />
        </LineChart>
      </ResponsiveContainer>
    </React.Fragment>
  );
};

export default Chart;
