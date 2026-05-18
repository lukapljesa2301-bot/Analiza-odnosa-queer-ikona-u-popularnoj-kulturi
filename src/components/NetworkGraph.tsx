import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { QueerIcon, GraphNode, GraphLink } from '../types';
import { CATEGORY_COLORS } from '../constants';

interface Props {
  icons: QueerIcon[];
  onSelectIcon: (icon: QueerIcon) => void;
  selectedIconId?: string;
}

const NetworkGraph: React.FC<Props> = ({ icons, onSelectIcon, selectedIconId }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredNode, setHoveredNode] = useState<GraphNode | null>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current || !Array.isArray(icons) || icons.length === 0) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI screens
    const dpr = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Create unique list of nodes and links
    const nodes: GraphNode[] = icons.map(icon => ({ ...icon }));
    const links: GraphLink[] = [];
    icons.forEach(icon => {
      icon.connections.forEach(conn => {
        if (icons.some(i => i.id === conn.targetId)) {
          links.push({
            source: icon.id,
            target: conn.targetId,
            reason: conn.reason,
            strength: conn.strength || 0.5
          });
        }
      });
    });

    // Force simulation optimization:
    // 1. theta(0.8) - Barnes-Hut optimization for ManyBody force
    // 2. distanceMax(500) - Limits calculation to nearby nodes to maintain O(N) rather than O(N^2) for distant interactions
    const simulation = d3.forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(180))
      .force('charge', d3.forceManyBody().strength(-400).theta(0.8).distanceMax(600))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(65));

    let transform = d3.zoomIdentity;

    const render = () => {
      ctx.save();
      ctx.clearRect(0, 0, width, height);
      ctx.translate(transform.x, transform.y);
      ctx.scale(transform.k, transform.k);

      // Viewport Culling Bounds (Data Space)
      const xMin = -transform.x / transform.k - 100;
      const xMax = (width - transform.x) / transform.k + 100;
      const yMin = -transform.y / transform.k - 100;
      const yMax = (height - transform.y) / transform.k + 100;

      // Draw Links
      ctx.beginPath();
      ctx.strokeStyle = '#333';
      ctx.globalAlpha = 0.4;
      links.forEach(l => {
        const s = l.source as any;
        const t = l.target as any;
        
        // Culling: only draw if either endpoint is in or near viewport
        const sIn = s.x >= xMin && s.x <= xMax && s.y >= yMin && s.y <= yMax;
        const tIn = t.x >= xMin && t.x <= xMax && t.y >= yMin && t.y <= yMax;
        
        if (sIn || tIn) {
          // Weighted links by strength
          ctx.lineWidth = (l.strength * 3) / transform.k;
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(t.x, t.y);
          ctx.stroke();
        }
      });

      // Draw Nodes
      nodes.forEach(n => {
        const isVisible = n.x! >= xMin && n.x! <= xMax && n.y! >= yMin && n.y! <= yMax;
        if (!isVisible) return;

        const isSelected = n.id === selectedIconId;
        const isHovered = hoveredNode?.id === n.id;
        const categoryColor = CATEGORY_COLORS[n.category] || '#444';

        // Sentiment-aware glow
        if (n.sentimentScore > 0.8) {
          ctx.shadowColor = 'rgba(255,255,255,0.4)';
          ctx.shadowBlur = 15;
        }

        // Draw node circle
        ctx.beginPath();
        const baseRadius = 24;
        const radius = (isSelected || isHovered) ? baseRadius * 1.1 : baseRadius;
        ctx.arc(n.x!, n.y!, radius, 0, 2 * Math.PI);
        ctx.fillStyle = categoryColor;
        ctx.fill();
        
        ctx.shadowBlur = 0; // reset glow

        if (isSelected) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 3 / transform.k;
          ctx.stroke();
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.2)';
          ctx.lineWidth = 1 / transform.k;
          ctx.stroke();
        }

        // Draw text
        ctx.font = `${600} ${11 / transform.k}px JetBrains Mono, monospace`;
        ctx.fillStyle = isSelected ? '#fff' : '#fafafa';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.globalAlpha = 1;
        
        // Only draw labels if zoomed in enough for readability
        if (transform.k > 0.4 || isSelected) {
          ctx.shadowColor = 'rgba(0,0,0,0.8)';
          ctx.shadowBlur = 4;
          // Add decade to label for temporal context
          const label = `${n.name.toUpperCase()} (${n.decade}s)`;
          ctx.fillText(label, n.x!, n.y! + radius + 10);
        }
        
        ctx.shadowColor = 'transparent';
        ctx.shadowBlur = 0;
      });

      ctx.restore();
    };

    simulation.on('tick', render);

    // Zoom setup
    const zoomBehavior = d3.zoom<HTMLCanvasElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        transform = event.transform;
        render();
      });

    d3.select(canvas).call(zoomBehavior);

    // Mouse movement/click handling
    const handleMouseMove = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      
      // Transform mouse coordinates back to data space
      const dataX = (mouseX - transform.x) / transform.k;
      const dataY = (mouseY - transform.y) / transform.k;
      
      // simulation.find uses spatial partitioning (quadtree) internally
      const found = simulation.find(dataX, dataY, 30);
      if (found !== hoveredNode) {
        // We set it in a way that doesn't trigger simulation tick if possible
        // but for simplicity we use state
        setHoveredNode(found || null);
        render();
      }
      
      canvas.style.cursor = found ? 'pointer' : 'grab';
    };

    const handleClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      const dataX = (mouseX - transform.x) / transform.k;
      const dataY = (mouseY - transform.y) / transform.k;
      
      const found = simulation.find(dataX, dataY, 30);
      if (found) {
        onSelectIcon(found as QueerIcon);
      }
    };

    // Drag behavior for Canvas
    const dragBehavior = d3.drag<HTMLCanvasElement, unknown>()
      .subject((event) => {
        const dataX = (event.x - transform.x) / transform.k;
        const dataY = (event.y - transform.y) / transform.k;
        return simulation.find(dataX, dataY, 40);
      })
      .on('start', (event) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        event.subject.fx = event.subject.x;
        event.subject.fy = event.subject.y;
      })
      .on('drag', (event) => {
        // Drag coordinates need adjustment for current zoom/pan
        event.subject.fx = (event.x - transform.x) / transform.k;
        event.subject.fy = (event.y - transform.y) / transform.k;
      })
      .on('end', (event) => {
        if (!event.active) simulation.alphaTarget(0);
        event.subject.fx = null;
        event.subject.fy = null;
      });

    d3.select(canvas).call(dragBehavior as any);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('click', handleClick);

    return () => {
      simulation.stop();
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('click', handleClick);
    };

  }, [icons, onSelectIcon, selectedIconId, hoveredNode]);

  return (
    <div ref={containerRef} className="w-full h-full bg-transparent relative overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
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

