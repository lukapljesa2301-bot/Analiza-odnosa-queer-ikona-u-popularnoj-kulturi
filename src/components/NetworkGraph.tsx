import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { QueerIcon, GraphNode, GraphLink } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface Props {
  icons: QueerIcon[];
  onSelectIcon: (icon: QueerIcon) => void;
  selectedIconId?: string;
}

const NetworkGraph: React.FC<Props> = ({ icons, onSelectIcon, selectedIconId }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !Array.isArray(icons) || icons.length === 0) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const g = svg.append('g');

    // Create unique list of nodes
    const nodes: GraphNode[] = icons.map(icon => ({ ...icon }));
    
    // Create links
    const links: GraphLink[] = [];
    icons.forEach(icon => {
      icon.connections.forEach(conn => {
        // Only link if target exists in our list
        if (icons.some(i => i.id === conn.targetId)) {
          links.push({
            source: icon.id,
            target: conn.targetId,
            reason: conn.reason
          });
        }
      });
    });

    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(150))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(60));

    const link = g.append('g')
      .attr('stroke', '#444')
      .attr('stroke-opacity', 0.6)
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke-width', 2);

    const node = g.append('g')
      .selectAll('.node')
      .data(nodes)
      .join('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, GraphNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended))
      .on('click', (event, d) => {
        const icon = icons.find(i => i.id === d.id);
        if (icon) onSelectIcon(icon);
      });

    // Category colors mapped to the Artistic Flair theme
    const themeColors = Object.values(CATEGORY_COLORS);
    const categories = Object.keys(CATEGORY_COLORS);
    const colorScale = d3.scaleOrdinal(themeColors).domain(categories);

    node.append('circle')
      .attr('r', 25)
      .attr('fill', d => colorScale(d.category) as string)
      .attr('stroke', d => d.id === selectedIconId ? '#fff' : 'rgba(255,255,255,0.1)')
      .attr('stroke-width', d => d.id === selectedIconId ? 3 : 1)
      .attr('class', 'transition-all duration-300 hover:scale-110');

    node.append('text')
      .text(d => d.name)
      .attr('dy', 40)
      .attr('text-anchor', 'middle')
      .attr('fill', '#fafafa')
      .style('font-size', '11px')
      .style('font-weight', '600')
      .style('letter-spacing', '0.05em')
      .style('text-transform', 'uppercase')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 2px 4px rgba(0,0,0,0.8)');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as any).x)
        .attr('y1', d => (d.source as any).y)
        .attr('x2', d => (d.target as any).x)
        .attr('y2', d => (d.target as any).y);

      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    });

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }

    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }

    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }

  }, [icons, onSelectIcon, selectedIconId]);

  return (
    <div ref={containerRef} className="w-full h-full bg-transparent relative overflow-hidden">
      <svg ref={svgRef} className="w-full h-full" />
      <footer className="absolute bottom-0 left-0 w-full p-6 bg-zinc-900/50 border-t border-zinc-800 flex justify-between items-center z-10 backdrop-blur-md">
        <div className="flex gap-8 items-center overflow-x-auto no-scrollbar">
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-2 shrink-0">
              <div 
                className="w-2.5 h-2.5 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]" 
                style={{ backgroundColor: color }} 
              />
              <span className="text-[10px] uppercase font-bold tracking-tighter text-zinc-400">{cat}</span>
            </div>
          ))}
        </div>
        
        <div className="hidden md:flex px-4 py-2 border border-zinc-700/50 rounded-full gap-4 text-[10px] uppercase font-bold tracking-widest bg-zinc-950/50 shadow-inner">
          <button className="text-zinc-500 hover:text-zinc-200 cursor-help transition-colors">Kronologija</button>
          <button className="text-zinc-50 transition-colors">Mreža Veza</button>
        </div>
      </footer>
    </div>
  );
};

export default NetworkGraph;
