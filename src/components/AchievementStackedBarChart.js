import React, { useState, useEffect } from "react";
import axios from "axios";
import { scaleLinear, scaleBand } from "d3-scale";
import { stack, stackOrderAscending } from "d3-shape";
import { max } from "d3-array";
import { axisBottom, axisLeft } from "d3-axis";
import { select } from "d3-selection";
import * as d3 from "d3";

const colors = {
  MODERNA: "#FF7700",
  SINOPHARM: "#ED0000",
  ZIFIVAX: "#9C65BB",
  ASTRAZENECA: "#0079B4",
  PFIZER: "#00A239",
};

const AchievementStackedBarChart = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8000/api/monthly-vaccination"
        );
        console.log("Response data:", response.data);
        setData(response.data);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // Remove any existing SVG element before drawing the chart
    select(".chart").selectAll("svg").remove();

    if (data.length > 0) {
      drawChart();
    }
  }, [data]);

  const drawChart = () => {
    const svgWidth = 800;
    const svgHeight = 400;
    const margin = { top: 20, right: 30, bottom: 60, left: 60 };
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    // Group data by month and vaccine type
    const groupedData = data.reduce((acc, d) => {
      const { month, jenis_vaksin } = d;
      if (!acc[month]) {
        acc[month] = { month };
      }
      acc[month][jenis_vaksin] = (acc[month][jenis_vaksin] || 0) + 1;
      return acc;
    }, {});

    const dataset = Object.values(groupedData);

    // Convert month strings to Date objects for sorting
    const parseTime = d3.timeParse("%Y-%m");
    dataset.forEach((d) => (d.month = parseTime(d.month)));

    // Sort the dataset by month in ascending order
    dataset.sort((a, b) => a.month - b.month);

    // Stack the data
    const keys = ["ASTRAZENECA", "PFIZER", "ZIFIVAX", "MODERNA", "SINOPHARM"];
    const stackedData = stack()
      .keys(keys)
      .order(stackOrderAscending)
      .value((d, key) => d[key] || 0)(dataset);

    const xScale = scaleBand()
      .domain(dataset.map((d) => d.month))
      .range([0, width])
      .paddingInner(0.1);

    const yScale = scaleLinear()
      .domain([0, max(stackedData, (d) => d3.max(d, (entry) => entry[1]))])
      .range([height, 0]);

    const svg = select(".chart")
      .append("svg")
      .attr("width", svgWidth)
      .attr("height", svgHeight)
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const xAxis = axisBottom(xScale).tickFormat(d3.timeFormat("%Y-%m"));
    const yAxis = axisLeft(yScale).tickFormat((d) => `${(d * 10).toFixed(0)}%`);

    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-45)");

    svg.append("g").attr("class", "y-axis").call(yAxis);

    const vaccineGroups = svg
      .selectAll(".vaccineGroup")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("class", "vaccineGroup")
      .style("fill", (d) => colors[d.key]);

    vaccineGroups
      .selectAll("rect")
      .data((d) => d)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.data.month))
      .attr("y", (d) => yScale(d[1]))
      .attr("height", (d) => yScale(d[0]) - yScale(d[1]))
      .attr("width", xScale.bandwidth());

    // Legend
    const legend = svg
      .selectAll(".legend")
      .data(keys)
      .enter()
      .append("g")
      .attr("class", "legend")
      .attr("transform", (_, i) => `translate(0,${i * 20})`);

    legend
      .append("rect")
      .attr("x", width + 10)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", (d) => colors[d]);

    legend
      .append("text")
      .attr("x", width + 32)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")
      .text((d) => d);
  };

  return <div className="chart"></div>;
};

export default AchievementStackedBarChart;
