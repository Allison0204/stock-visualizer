import React, { Component } from "react";
import * as d3 from "d3";
import './Child1.css';

class Child1 extends Component {
  state = { 
    company: "Apple", // Default Company
    selectedMonth: 'November' // Default Month
  };

  componentDidMount() {
    this.renderChart();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.csv_data !== this.props.csv_data || 
        prevState.company !== this.state.company || 
        prevState.selectedMonth !== this.state.selectedMonth) {
      this.renderChart();
    }
  }

  handleCompanyChange = (event) => {
    this.setState({ company: event.target.value });
  };

  handleMonthChange = (event) => {
    this.setState({ selectedMonth: event.target.value });
  };

 
  renderChart = () => {
    const { csv_data } = this.props;
    const { company, selectedMonth } = this.state;

    // Filter data based on selected company and month
    const filteredData = csv_data
      .filter(
        (d) =>
          d.Company === company &&
          d.Date.toLocaleString("default", { month: "long" }) === selectedMonth
      )
      .filter((d) => d.Date && d.Open && d.Close);

    // Set dimensions and margins
    const margin = { top: 20, right: 90, bottom: 60, left: 40 };
    const width = 500 - margin.left - margin.right;
    const height = 320 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select("#chart").selectAll("*").remove();

    const svg = d3
      .select("#chart")
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Tooltip
    const tooltip = d3
        .select("#chart")
        .append("div")
        .style("opacity", 0)
        .attr("class", "tooltip");

    // scales
    const x = d3
      .scaleTime()
      .domain(d3.extent(filteredData, (d) => d.Date))
      .range([0, width]);

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(filteredData, (d) => Math.min(d.Open, d.Close)),
        d3.max(filteredData, (d) => Math.max(d.Open, d.Close)),
      ])
      .range([height, 0]);

    // Add axes
    svg
      .append("g")
      .attr("class", "x-axis")
      .attr("transform", `translate(2,${height+5})`)
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(45)") 
      .style("text-anchor", "start");


    svg
        .append("g")
        .attr("class", "y-axis")
        .attr("transform", `translate(-6, 0)`)
        .call(d3.axisLeft(y));

    // Add lines
    const lineOpen = d3
      .line()
      .x((d) => x(d.Date))
      .y((d) => y(d.Open))
      .curve(d3.curveCardinal); 

    const lineClose = d3
      .line()
      .x((d) => x(d.Date))
      .y((d) => y(d.Close))
      .curve(d3.curveCardinal); 

    svg
      .append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", "#b2df8a")
      .attr("stroke-width", 1.5)
      .attr("d", lineOpen);

    svg
      .append("path")
      .datum(filteredData)
      .attr("fill", "none")
      .attr("stroke", "#e41a1c")
      .attr("stroke-width", 1.5)
      .attr("d", lineClose);

    // Add circles
    svg
      .selectAll("circle.open")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("class", "open")
      .attr("cx", (d) => x(d.Date))
      .attr("cy", (d) => y(d.Open))
      .attr("r", 4)
      .style("fill", "#b2df8a")
      .on("mouseover", (event, d) => {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 1);
        tooltip
          .html(
            `<strong>Date:</strong> ${d.Date.toLocaleDateString()}<br/>
             <strong>Open:</strong> ${d.Open.toFixed(2)}<br/>
             <strong>Close:</strong> ${d.Close.toFixed(2)}<br/>
             <strong>Difference:</strong> ${(d.Close - d.Open).toFixed(2)}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 210 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });

    svg
      .selectAll("circle.close")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("class", "close")
      .attr("cx", (d) => x(d.Date))
      .attr("cy", (d) => y(d.Close))
      .attr("r", 4)
      .style("fill", "#e41a1c")
      .on("mouseover", (event, d) => {
        tooltip
          .transition()
          .duration(200)
          .style("opacity", 1);
        tooltip
          .html(
            `<strong>Date:</strong> ${d.Date.toLocaleDateString()}<br/>
             <strong>Open:</strong> ${d.Open.toFixed(2)}<br/>
             <strong>Close:</strong> ${d.Close.toFixed(2)}<br/>
             <strong>Difference:</strong> ${(d.Close - d.Open).toFixed(2)}`
          )
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY - 210 + "px");
      })
      .on("mouseout", () => {
        tooltip.transition().duration(500).style("opacity", 0);
      });
    const legend = svg.append("g").attr("transform", `translate(${width + 20}, 50)`);

    legend
        .append("rect")
        .attr("x", 0)
        .attr("y", -60)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", "#b2df8a");
  
      legend
        .append("text")
        .attr("x", 23)
        .attr("y", -48)
        .text("Open")
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
  
      legend
        .append("rect")
        .attr("x", 0)
        .attr("y", -35)
        .attr("width", 20)
        .attr("height", 20)
        .style("fill", "#e41a1c");
  
      legend
        .append("text")
        .attr("x", 23)
        .attr("y", -23)
        .text("Close")
        .style("font-size", "12px")
        .attr("alignment-baseline", "middle");
  };

  render() {
    const options = ['Apple', 'Microsoft', 'Amazon', 'Google', 'Meta'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return (
      <div>
        <div class="company">
          Company: {options.map(option => (
            <label key={option}
            style={{
                display: "inline-block",
                marginRight: "10px", // Add spacing between options
              }}
            >
              <input 
                type="radio" 
                value={option} 
                checked={this.state.company === option} 
                onChange={this.handleCompanyChange} 
              />
              {option}
            </label>
          ))}
        </div>
        <div class="month">
          Month: <select value={this.state.selectedMonth} onChange={this.handleMonthChange}>
            {months.map(month => (
              <option key={month} value={month}>{month}</option>
            ))}
          </select>
        </div>
        <div id="chart"></div>
      </div>
    );
  }
}

export default Child1;