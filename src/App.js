import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { geoAlbersUsa, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';

const USMap = () => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [tooltipContent, setTooltipContent] = useState('');
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.clientWidth,
          height: containerRef.current.clientHeight
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const projection = geoAlbersUsa()
      .scale(dimensions.width)
      .translate([dimensions.width / 2, dimensions.height / 2]);
    const path = geoPath().projection(projection);

    svg.attr('width', dimensions.width).attr('height', dimensions.height);

    d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json').then((us) => {
      const states = feature(us, us.objects.states);

      svg.selectAll('path')
        .data(states.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('fill', () => Math.random() < 0.5 ? '#ff0000' : '#0000ff')
        .attr('stroke', '#fff')
        .on('mouseover', (event, d) => {
          d3.select(event.target).attr('fill', d3.select(event.target).attr('fill') === '#ff0000' ? '#ff6666' : '#6666ff');
        })
        .on('mouseout', (event) => {
          d3.select(event.target).attr('fill', d3.select(event.target).attr('fill') === '#ff6666' ? '#ff0000' : '#0000ff');
        })
        .on('click', (event, d) => {
          event.stopPropagation();
          setTooltipContent(d.properties.name);
          setTooltipPosition({ x: event.clientX, y: event.clientY });
        });

      svg.on('click', () => {
        setTooltipContent('');
      });
    });
  }, [dimensions]);

  const handleContainerClick = () => {
    setTooltipContent('');
  };

  return (
    <div 
      ref={containerRef} 
      style={{ position: 'relative', width: '100%', height: '100vh' }}
      onClick={handleContainerClick}
    >
      <svg ref={svgRef}></svg>
      {tooltipContent && (
        <div
          style={{
            position: 'absolute',
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            background: 'white',
            border: '1px solid black',
            padding: '5px',
            pointerEvents: 'none',
          }}
        >
          <p>{tooltipContent}</p>
          <p>Vote % : 50%</p>
          <p>Nombre de votant : 100000</p>
          <p>Depouillement : 100%</p>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <USMap />
    </div>
  );
}

export default App;
