/*=================================================================
 * Project: AIVA-WEB
 * File: Chart.jsx
 * Author: Mohitraj Jadeja
 * Date Created: February 28, 2024
 * Last Modified: February 28, 2024
 *=================================================================
 * Description:
 * Chart component for displaying a bar chart.
 *=================================================================
 * Copyright (c) 2024 Mohitraj Jadeja. All rights reserved.
 *=================================================================*/
import React, { useEffect } from "react";
import { ResponsiveBar } from "@nivo/bar";
import PropTypes from "prop-types";

// Wrapper component to handle warning suppression
const BarChart = (props) => {
  useEffect(() => {
    // Suppress the specific warning only while this component is mounted
    const originalError = console.error;
    //console.error = (...args) => {
    //  if (args[0]?.includes?.('defaultProps')) return;
    //  originalError.call(console, ...args);
    // };

    return () => {
      //console.error = originalError;
    };
  }, []);

  return <ResponsiveBar {...props} />;
};

const Chart = React.memo(function Chart(props) {
  const {
    data = [],
    keys = ["value"],
    indexBy = "name",
    colors = { scheme: "nivo" },
    height = 400,
  } = props;

  // Ensure data is in the correct format and has values
  const validData = React.useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(
      (item) =>
        item &&
        typeof item === "object" &&
        "name" in item &&
        "value" in item &&
        item.value > 0,
    );
  }, [data]);

  if (!validData || validData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-500 dark:text-gray-400">No data available</p>
      </div>
    );
  }

  const defaultTheme = {
    axis: {
      ticks: {
        text: {
          fill: "var(--color-gray-600)",
          fontSize: 12,
        },
      },
      legend: {
        text: {
          fill: "var(--color-gray-600)",
          fontSize: 12,
        },
      },
    },
    grid: {
      line: {
        stroke: "var(--color-gray-200)",
        strokeWidth: 1,
      },
    },
    tooltip: {
      container: {
        background: "var(--color-gray-800)",
        color: "var(--color-gray-100)",
        fontSize: 12,
        borderRadius: 4,
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      },
    },
  };

  const chartProps = {
    data: validData,
    keys,
    indexBy,
    margin: { top: 30, right: 50, bottom: 50, left: 50 },
    padding: 0.3,
    valueScale: { type: "linear" },
    indexScale: { type: "band", round: true },
    colors,
    borderRadius: 4,
    borderColor: { from: "color", modifiers: [["darker", 0.6]] },
    axisTop: null,
    axisRight: null,
    axisBottom: {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "Stage",
      legendPosition: "middle",
      legendOffset: 40,
    },
    axisLeft: {
      tickSize: 5,
      tickPadding: 5,
      tickRotation: 0,
      legend: "Count",
      legendPosition: "middle",
      legendOffset: -40,
    },
    enableLabel: true,
    label: (d) => d.value,
    labelSkipWidth: 12,
    labelSkipHeight: 12,
    labelTextColor: { from: "color", modifiers: [["darker", 3]] },
    animate: true,
    motionConfig: "gentle",
    theme: defaultTheme,
    role: "application",
    ariaLabel: "Task distribution chart",
    barAriaLabel: (e) => `${e.indexValue}: ${e.value} tasks`,
  };

  return (
    <div style={{ height }}>
      <BarChart {...chartProps} />
    </div>
  );
});

Chart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }),
  ),
  keys: PropTypes.arrayOf(PropTypes.string),
  indexBy: PropTypes.string,
  colors: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  height: PropTypes.number,
};

Chart.displayName = "Chart";

export default Chart;
