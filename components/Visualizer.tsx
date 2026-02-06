import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { formatTime } from '../lib/utils';

interface VisualizerProps {
  isPlaying: boolean;
  currentTime?: number;
  duration?: number;
  volume?: number;
  onSeek?: (e: React.MouseEvent<HTMLDivElement>) => void;
  onVolumeChange?: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const Visualizer: React.FC<VisualizerProps> = ({ isPlaying, currentTime = 0, duration = 0, volume = 0.8 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current) return;

    // Clean up previous SVG elements to avoid duplication on re-renders
    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = containerRef.current.clientWidth;
    const height = 150;
    const barPadding = 2;
    const barsCount = 64;
    const barWidth = (width / barsCount) - barPadding;

    svg.attr('width', width).attr('height', height);

    // Initial bars
    const data = Array.from({ length: barsCount }, () => Math.random() * height * 0.2);
    
    const x = d3.scaleLinear()
      .domain([0, barsCount])
      .range([0, width]);

    const bars = svg.selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', (d, i) => x(i))
      .attr('y', d => height - d)
      .attr('width', barWidth)
      .attr('height', d => d)
      .attr('fill', 'url(#barGradient)')
      .attr('rx', 2);

    // Add gradient
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient')
      .attr('id', 'barGradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');

    gradient.append('stop')
      .attr('offset', '0%')
      .attr('stop-color', '#a855f7');
    gradient.append('stop')
      .attr('offset', '100%')
      .attr('stop-color', '#3b82f6');

    let animationId: number;

    const update = () => {
      if (isPlaying) {
        // Simulate frequency data
        const newData = data.map(() => Math.random() * height * 0.8 + 10);
        bars.data(newData)
          .transition()
          .duration(100)
          .attr('y', d => height - d)
          .attr('height', d => d);
      } else {
        bars.data(data.map(d => d * 0.5))
          .transition()
          .duration(300)
          .attr('y', d => height - d)
          .attr('height', d => d);
      }
      animationId = requestAnimationFrame(update);
    };

    update();

    return () => cancelAnimationFrame(animationId);
  }, [isPlaying]);

  return (
    <div ref={containerRef} className="w-full h-40 bg-dark-soft rounded-xl overflow-hidden glass p-4 mb-6 relative group">
      <div className="flex items-center justify-between mb-2 relative z-10">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">Master Output - Frequency Spectrum</span>
        <div className="flex gap-4 items-center">
            {/* Real Time Display */}
            <span className="text-[10px] font-mono text-primary font-bold">
                {formatTime(currentTime)} / {formatTime(duration)}
            </span>
            <div className="flex gap-1">
                <div className={`w-1.5 h-1.5 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="text-[10px] font-mono text-gray-400 uppercase">{isPlaying ? 'Live' : 'Stopped'}</span>
            </div>
        </div>
      </div>
      <svg ref={svgRef} className="w-full relative z-0"></svg>
    </div>
  );
};

export default Visualizer;