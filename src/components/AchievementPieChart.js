import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as d3 from "d3";

const AchievementPieChart = () => {
  const [data, setData] = useState([]);
  const [provinceNames, setProvinceNames] = useState({}); // State to store province names

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/count-achievement-percentage");
        const formattedData = Object.entries(response.data).map(([provinceCode, percentage]) => ({
          provinceCode,
          percentage,
        }));
        setData(formattedData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();

    // Fetch province names from the API endpoint
    const fetchProvinceNames = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/get-province-names");
        setProvinceNames(response.data);
      } catch (error) {
        console.error("Error fetching province names:", error);
      }
    };
    fetchProvinceNames();
  }, []);

  const svgRef = useRef();

  useEffect(() => {
    if (data.length > 0 && Object.keys(provinceNames).length > 0) {
      drawChart();
    }
  }, [data, provinceNames]);

  const drawChart = () => {
    const width = 300;
    const height = 300;
    const radius = Math.min(width, height) / 2;

    const color = d3.scaleOrdinal().domain(data.map((item) => item.provinceCode)).range(d3.schemeCategory10);

    const svg = d3.select(svgRef.current).attr("width", width).attr("height", height);

    const g = svg.append("g").attr("transform", `translate(${width / 2},${height / 2})`);

    const pie = d3.pie().value((d) => d.percentage);

    const arc = d3.arc().innerRadius(0).outerRadius(radius);

    const arcs = g.selectAll(".arc").data(pie(data)).enter().append("g").attr("class", "arc");

    arcs
      .append("path")
      .attr("d", arc)
      .attr("fill", (d) => color(d.data.provinceCode))
      .attr("stroke", "white")
      .style("stroke-width", "2px");

    // Add text labels for each slice
    arcs
      .append("text")
      .attr("transform", (d) => `translate(${arc.centroid(d)})`)
      .attr("text-anchor", "middle")
      .text((d) => provinceNames[d.data.provinceCode]); // Use province name instead of province code

    // Add tooltip
    arcs
      .append("title")
      .text((d) => `${provinceNames[d.data.provinceCode]}: ${d.data.percentage.toFixed(2)}%`);
  };

  return <svg ref={svgRef} />;
};

export default AchievementPieChart;
