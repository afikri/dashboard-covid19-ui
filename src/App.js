import React from "react";
import PieChart from "./components/PieChart";
import AchievementPieChart from "./components/AchievementPieChart";
import AchievementStackedBarChart from "./components/AchievementStackedBarChart";
import "./style.css"; // Import the CSS file

const App = () => {
  return (
    <>
      <div className="heading">
        <h1>Covid-19 Data Vaksinasi</h1>
      </div>
      <div className="container">
        <div className="pie-chart">
          <PieChart />
        </div>
        <div className="pie-chart">
          <AchievementPieChart />
        </div>
        <div className="stacked-chart">
          <AchievementStackedBarChart />
        </div>
      </div>
    </>
  );
};

export default App;
