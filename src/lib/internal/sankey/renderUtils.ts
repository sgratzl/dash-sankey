/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { area, curveMonotoneX } from 'd3-shape';
import type { SankeyInternalLink, SankeyInternalNode } from './model';

function missingInOffset(node: SankeyInternalNode): number {
  const y0 = node.y0!;
  const y1 = y0 + (node.y1! - y0) * (node.missingIn.size / node.overlap.size);
  return y1 - y0;
}

export function pathGen(link: SankeyInternalLink, lineOffset: number, fraction: number, shift = 0): string {
  const base = -link.width! / 2 + link.width! * shift;
  const height = link.width! * fraction;

  const targetOffset = missingInOffset(link.target as SankeyInternalNode);

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
        y0: link.y1! + targetOffset + base,
        y1: link.y1! + targetOffset + base + height,
      },
      {
        x: (link.target as SankeyInternalNode).x0!,
        y0: link.y1! + targetOffset + base,
        y1: link.y1! + targetOffset + base + height,
      },
    ]) ?? ''
  );
}

export function missingOutPath(node: SankeyInternalNode, off: number, fraction = 1, shift = 0): string {
  const x = node.x1!;
  const y1 = node.y1!;
  let y0 = y1 - (y1 - node.y0!) * (node.missingOut.size / node.overlap.size);
  const height = (y1 - y0) * fraction;
  y0 += (y1 - y0) * shift;
  const width = height;
  const x1 = x + width;

  const curve1 = `L${x + off},${y0} C${x + off + width / 2},${y0} ${x1},${y1 - off - height / 2} ${x1},${y1 + off}`;
  const curve2 = `L${x + off},${y1 + off} C${x + off},${y1 + off * 0.5} ${x + off * 0.5},${y1} ${x},${y1}`;
  return `M${x},${y0} ${curve1} ${curve2} Z`;
}

export function missingInPath(node: SankeyInternalNode, off: number, fraction = 1, shift = 0): string {
  const x = node.x0!;
  let y0 = node.y0!;
  const y1 = y0 + (node.y1! - y0) * (node.missingIn.size / node.overlap.size);
  const height = (y1 - y0) * fraction;
  y0 += (y1 - y0) * shift;
  const width = height;
  const x1 = x - width;

  const curve1 = `L${x - off},${y1} C${x - off - width / 2},${y1} ${x1},${y0 + off + height / 2} ${x1},${y0 - off}`;
  const curve2 = `L${x - off},${y0 - off} C${x - off},${y0 - off * 0.5} ${x + off * 0.5},${y0} ${x},${y0}`;
  return `M${x},${y1} ${curve1} ${curve2} Z`;
}

export function toValue(value: number, total?: number): string {
  if (total == null) {
    return value.toLocaleString();
  }
  const percentage = Math.round((value * 1000) / total) / 10;
  return `${percentage.toLocaleString()}% (${value.toLocaleString()}/${total.toLocaleString()})`;
}

export function toPercentageSuffix(value: number, total?: number): string {
  if (total == null) {
    return '';
  }
  const percentage = Math.round((value * 1000) / total) / 10;
  return ` (${percentage.toLocaleString()}%)`;
}
