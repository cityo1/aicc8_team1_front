import React from 'react';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  LineChart,
  Line,
} from 'recharts';

// 1. 방사형 차트
export const NutrientRadarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
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

// 2. 목표 달성률
export const GoalBarChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
      <CartesianGrid
        strokeDasharray="3 3"
        vertical={false}
        margin={{ bottom: 30 }}
      />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip cursor={{ fill: 'transparent' }} />
      <ReferenceLine y={0} stroke="#000" />
      <Bar dataKey="diff" fill="#FF8243" radius={[4, 4, 0, 0]} />
    </BarChart>
  </ResponsiveContainer>
);

// 3. 7일간 변화 추이
export const WeeklyLineChart = ({ data }) => (
  <ResponsiveContainer width="100%" height={300}>
    <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
      <XAxis dataKey="day" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Line
        type="monotone"
        dataKey="kcal"
        stroke="#FF8243"
        strokeWidth={3}
        dot={{ r: 6 }}
        activeDot={{ r: 8 }}
      />
      <Line
        type="monotone"
        dataKey="carbohydrate"
        stroke="#ecd100"
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
      <Line
        type="monotone"
        dataKey="vitamin"
        stroke="#12cee7"
        strokeWidth={2}
      />
    </LineChart>
  </ResponsiveContainer>
);
