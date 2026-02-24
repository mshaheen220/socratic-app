import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';

const WordCloud = ({ words, font = '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }) => {
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  // Handle resizing
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Draw word cloud
  useEffect(() => {
    if (!words || words.length === 0 || dimensions.width === 0) return;

    const { width, height } = dimensions;
    
    // Clear previous SVG content
    const container = d3.select(containerRef.current);
    container.selectAll("*").remove();

    const svg = container.append("svg")
      .attr("width", width)
      .attr("height", height);
    
    const g = svg.append("g")
      .attr("transform", `translate(${width / 2},${height / 2})`);

    // Scale for font size
    const maxVal = Math.max(...words.map(w => w.value));
    const sizeScale = d3.scaleLinear()
      .domain([0, maxVal])
      .range([1, 40]); // Font size range

    const layout = cloud()
      .size([width, height])
      .words(words.map(d => ({ text: d.text, size: d.value, value: d.value })))
      .padding(2)
      .rotate(() => (Math.floor(Math.random() * 9) * 24) - 60)
      .font(font)
      .fontSize(d => sizeScale(d.size))
      .on("end", draw);

    layout.start();

    function draw(drawnWords) {
      const textNodes = g.selectAll("text")
        .data(drawnWords)
        .enter().append("text")
        .style("font-size", "1px")
        .style("font-family", font)
        .style("fill", (d, i) => d3.schemeCategory10[i % 10])
        .attr("text-anchor", "middle")
        .attr("transform", d => `translate(${d.x},${d.y})rotate(${d.rotate})`)
        .text(d => d.text);

      // Add tooltip
      textNodes.append("title").text(d => `${d.text}: ${d.value}`);

      // Add hover effects
      textNodes.on("mouseover", function(event, d) {
        d3.select(this).transition().duration(200).style("font-size", (d.size * 1.1) + "px").style("opacity", 0.7).style("cursor", "default");
      })
      .on("mouseout", function(event, d) {
        d3.select(this).transition().duration(200).style("font-size", d.size + "px").style("opacity", 1);
      });

      // Initial animation
      textNodes.transition()
        .duration(600)
        .style("font-size", d => d.size + "px");
    }
  }, [words, dimensions]);

  return (
    <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
  );
};

export default WordCloud;
