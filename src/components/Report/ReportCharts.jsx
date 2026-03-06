import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
} from 'recharts';

// 방사형 차트
export const NutrientRadarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={350}>
    <RadarChart
      cx="50%"
      cy="50%"
      outerRadius="90%"
      data={data}
      margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
    >
      <PolarGrid stroke="#e0e0e0" />
      <PolarAngleAxis
        dataKey="subject"
        tick={{ fill: '#1E2923', fontSize: 12 }}
      />
      <PolarRadiusAxis angle={60} domain={[0, 100]} />
      <Radar
        name="영양소"
        dataKey="value"
        stroke="#FF8243"
        fill="#FF8243"
        fillOpacity={0.55}
      />
    </RadarChart>
  </ResponsiveContainer>
);

// 7일간 변화 추이
export const WeeklyLineChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line type="monotone" dataKey="kcal" stroke="#FF8243" strokeWidth={3} />
      <Line
        type="monotone"
        dataKey="carbohydrate"
        stroke="#12cee7"
        strokeWidth={2}
      />
      <Line
        type="monotone"
        dataKey="protein"
        stroke="#ff009c"
        strokeWidth={2}
      />
      <Line type="monotone" dataKey="fat" stroke="#b115ec" strokeWidth={2} />
      <Line type="monotone" dataKey="sugars" stroke="#0854ed" strokeWidth={2} />
    </LineChart>
  </ResponsiveContainer>
);
