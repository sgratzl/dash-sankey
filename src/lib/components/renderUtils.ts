/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { area, curveMonotoneX } from 'd3-shape';
import type { SankeyInternalLink, SankeyInternalNode } from './model';

export function pathGen(link: SankeyInternalLink, lineOffset: number, fraction: number): string {
  const base = -link.width! / 2;
  const height = link.width! * fraction;

  const p = area<{ x: number; y0: number; y1: number }>()
    .curve(curveMonotoneX)
    .x((d) => d.x)
    .y0((d) => d.y0)
    .y1((d) => d.y1);

  return (
    p([
      {
        x: (link.source as SankeyInternalNode).x1!,
        y0: link.y0! + base,
        y1: link.y0! + base + height,
      },
      {
        x: (link.source as SankeyInternalNode).x1! + lineOffset,
        y0: link.y0! + base,
        y1: link.y0! + base + height,
      },
      {
        x: (link.target as SankeyInternalNode).x0! - lineOffset,
        y0: link.y1! + base,
        y1: link.y1! + base + height,
      },
      {
        x: (link.target as SankeyInternalNode).x0!,
        y0: link.y1! + base,
        y1: link.y1! + base + height,
      },
    ]) ?? ''
  );
}

export function missingPath(node: SankeyInternalNode, off: number, fraction = 1): string {
  const x = node.x1!;
  const y1 = node.y1!;
  const y0 = y1 - (y1 - node.y0!) * (node.missing.size / node.overlap.size);
  const height = (y1 - y0) * fraction;
  const width = height;
  const x1 = x + width;

  const curve1 = `L${x + off},${y0} C${x + off + width / 2},${y0} ${x1},${y1 - off - height / 2} ${x1},${y1 + off}`;
  const curve2 = `L${x + off},${y1 + off} C${x + off},${y1 + off * 0.5} ${x + off * 0.5},${y1} ${x},${y1}`;
  return `M${x},${y0} ${curve1} ${curve2} Z`;
}
