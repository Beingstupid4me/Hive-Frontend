"use client";

import { useMemo } from "react";

interface DendrogramNode {
  id: string;
  label: string;
  level: number;
  weight: number;
  risk_contribution?: number;
}

interface DendrogramLink {
  source: string;
  target: string;
  distance: number;
}

interface DendrogramData {
  root: string;
  nodes: DendrogramNode[];
  links: DendrogramLink[];
}

interface DendrogramChartProps {
  data: DendrogramData;
}

interface PositionedNode extends DendrogramNode {
  x: number;
  y: number;
}

export function DendrogramChart({ data }: DendrogramChartProps) {
  const layout = useMemo(() => {
    const root = data.nodes.find((node) => node.level === 0);
    const clusters = data.nodes.filter((node) => node.level === 1);
    const assets = data.nodes.filter((node) => node.level === 2);

    const positions = new Map<string, PositionedNode>();
    const height = Math.max(320, Math.max(clusters.length * 42, assets.length * 18));
    const width = 920;

    if (root) {
      positions.set(root.id, { ...root, x: 90, y: height / 2 });
    }

    clusters.forEach((cluster, idx) => {
      const y = 40 + idx * ((height - 80) / Math.max(clusters.length - 1, 1));
      positions.set(cluster.id, { ...cluster, x: 360, y });
    });

    const childrenByCluster = new Map<string, DendrogramNode[]>();
    data.links.forEach((link) => {
      const source = positions.get(link.source) ?? data.nodes.find((node) => node.id === link.source);
      const target = data.nodes.find((node) => node.id === link.target);
      if (!source || !target || target.level !== 2) {
        return;
      }
      const list = childrenByCluster.get(link.source) ?? [];
      list.push(target);
      childrenByCluster.set(link.source, list);
    });

    let leafCounter = 0;
    clusters.forEach((cluster) => {
      const leaves = childrenByCluster.get(cluster.id) ?? [];
      leaves.forEach((leaf) => {
        const y = 30 + leafCounter * 18;
        leafCounter += 1;
        positions.set(leaf.id, {
          ...leaf,
          x: 730,
          y: Math.min(height - 30, y),
        });
      });
    });

    const positionedLinks = data.links
      .map((link) => {
        const source = positions.get(link.source);
        const target = positions.get(link.target);
        if (!source || !target) {
          return null;
        }
        return {
          ...link,
          source,
          target,
        };
      })
      .filter((entry): entry is NonNullable<typeof entry> => entry !== null);

    return {
      width,
      height,
      positions,
      links: positionedLinks,
      clusters,
    };
  }, [data]);

  if (!data.nodes.length) {
    return (
      <div className="h-80 rounded-lg border border-border bg-surface-hover/40 flex items-center justify-center">
        <span className="text-xs text-text-tertiary text-mono">No clustering tree available</span>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <svg viewBox={`0 0 ${layout.width} ${layout.height}`} className="w-full min-w-190 h-90 rounded-lg bg-surface-hover/20 border border-border/50">
        {layout.links.map((link, idx) => {
          const bendX = (link.source.x + link.target.x) / 2;
          const path = `M ${link.source.x} ${link.source.y} C ${bendX} ${link.source.y}, ${bendX} ${link.target.y}, ${link.target.x} ${link.target.y}`;
          const opacity = Math.max(0.2, 1 - link.distance);
          return (
            <path
              key={`${link.source.id}:${link.target.id}:${idx}`}
              d={path}
              fill="none"
              stroke="var(--accent-primary)"
              strokeOpacity={opacity}
              strokeWidth={link.target.level === 1 ? 2.4 : 1.4}
            />
          );
        })}

        {Array.from(layout.positions.values()).map((node) => {
          const isRoot = node.level === 0;
          const isCluster = node.level === 1;
          const radius = isRoot ? 8 : isCluster ? 6 : 4;
          const color = isRoot ? "var(--color-gold)" : isCluster ? "var(--accent-primary)" : "var(--color-magenta)";

          return (
            <g key={node.id}>
              <circle cx={node.x} cy={node.y} r={radius} fill={color} fillOpacity={isRoot ? 0.9 : 0.8} />
              <text
                x={node.x + (isRoot ? 14 : 10)}
                y={node.y + 4}
                fill="var(--text-secondary)"
                fontSize={isCluster ? 11 : 9}
                fontFamily="var(--font-mono)"
                fontWeight={isCluster ? 700 : 500}
              >
                {node.label}
                {isCluster ? `  ${(node.weight * 100).toFixed(1)}%` : ""}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
