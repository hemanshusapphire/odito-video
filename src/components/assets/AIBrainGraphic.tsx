interface AIBrainGraphicProps {
  size?: number;
  color?: string;
  opacity?: number;
}

export const AIBrainGraphic: React.FC<AIBrainGraphicProps> = ({
  size = 200,
  color = "#A855F7",
  opacity = 0.3,
}) => {
  const nodes: Array<{ cx: number; cy: number; r: number }> = [
    { cx: 100, cy: 40,  r: 6 },
    { cx: 40,  cy: 80,  r: 5 },
    { cx: 160, cy: 80,  r: 5 },
    { cx: 70,  cy: 130, r: 7 },
    { cx: 130, cy: 130, r: 7 },
    { cx: 100, cy: 170, r: 6 },
    { cx: 30,  cy: 150, r: 4 },
    { cx: 170, cy: 150, r: 4 },
    { cx: 55,  cy: 55,  r: 3 },
    { cx: 145, cy: 55,  r: 3 },
    { cx: 100, cy: 100, r: 8 },
  ];

  const edges: Array<[number, number]> = [
    [0, 2],  [0, 1],  [0, 10],
    [1, 3],  [1, 8],  [1, 10],
    [2, 4],  [2, 9],  [2, 10],
    [3, 5],  [3, 6],  [3, 10],
    [4, 5],  [4, 7],  [4, 10],
    [5, 10], [6, 10], [7, 10],
    [8, 10], [9, 10],
  ];

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity }}
    >
      {/* Edges */}
      {edges.map(([a, b], i) => (
        <line
          key={i}
          x1={nodes[a].cx} y1={nodes[a].cy}
          x2={nodes[b].cx} y2={nodes[b].cy}
          stroke={color}
          strokeWidth="1"
          strokeOpacity="0.4"
        />
      ))}
      {/* Nodes */}
      {nodes.map((n, i) => (
        <circle
          key={i}
          cx={n.cx}
          cy={n.cy}
          r={n.r}
          fill={color}
          fillOpacity={i === 10 ? 0.9 : 0.6}
          style={
            i === 10
              ? { filter: `drop-shadow(0 0 6px ${color})` }
              : undefined
          }
        />
      ))}
    </svg>
  );
};
