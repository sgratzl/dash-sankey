/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { SankeyLink as SankeyLinkImpl, SankeyNode as SankeyNodeImpl } from 'd3-sankey';
import { IBox, isArray, OverlapHelper } from '../../utils';

export type SankeyID = string | number;

export interface HasIds {
  ids: readonly SankeyID[];
}
export interface SankeyNode extends HasIds {
  id: string;
  name: string;
}

export interface SankeyLevel {
  name: string;
  nodes: SankeyNode[];
}

export interface SankeyLink extends HasIds {
  source: string;
  target: string;
}

export interface SankeySelection {
  type: 'node' | 'link' | 'missing' | 'layer';
  id: string;
  ids: readonly SankeyID[];
}

export const DEFAULT_PADDING: IBox = { left: 5, top: 5, right: 5, bottom: 20 };

export declare interface SankeyInternalNodeExtras extends SankeyNode {
  id: string;
  fixedValue: number;
  overlap: OverlapHelper<SankeyID>;
  /**
   * ids that are not part of any outgoing link
   */
  missing: OverlapHelper<SankeyID>;
}

export declare interface SankeyInternalLinkExtras {
  id: string;
  name: string;
  overlap: OverlapHelper<SankeyID>;
}
export declare type SankeyInternalNode = SankeyNodeImpl<SankeyInternalNodeExtras, SankeyInternalLinkExtras>;
export declare type SankeyInternalLink = SankeyLinkImpl<SankeyInternalNodeExtras, SankeyInternalLinkExtras>;

export interface SankeyInternalLayer {
  id: string;
  nodes: SankeyInternalNode[];
  name: string;
  overlap: OverlapHelper<SankeyID>;

  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

export function extractLayers(
  nodes: readonly SankeyInternalNode[],
  levels: readonly SankeyLevel[]
): SankeyInternalLayer[] {
  const layers: SankeyInternalLayer[] = [];
  for (const node of nodes) {
    const layer = node.depth ?? 0;
    const l = layers[layer];
    if (l == null) {
      layers[layer] = {
        id: layer.toString(),
        name: levels[layer]?.name ?? `Layer ${layer}`,
        overlap: node.overlap.copy(),
        x0: node.x0!,
        x1: node.x1!,
        y0: node.y0!,
        y1: node.y1!,
        nodes: [node],
      };
    } else {
      l.overlap.addUpdate(node.overlap);
      l.y0 = Math.min(l.y0, node.y0!);
      l.y1 = Math.max(l.y1, node.y1!);
      l.nodes.push(node);
    }
  }
  return layers;
}

export function extractGraph(levels: readonly SankeyLevel[]): {
  nodes: SankeyInternalNode[];
  links: SankeyInternalLink[];
  layers: SankeyInternalLayer[];
} {
  const nodes: SankeyInternalNode[] = [];
  const transformedLevels = levels.map((level) => {
    return level.nodes.map((d) => {
      const overlap = new OverlapHelper(d.ids);
      const n: SankeyInternalNode = {
        ...d,
        overlap,
        fixedValue: d.ids.length,
        missing: overlap.copy(),
      };
      nodes.push(n);
      return n;
    });
  });

  const links: SankeyInternalLink[] = [];

  for (let i = 0; i < transformedLevels.length - 1; i += 1) {
    const left = transformedLevels[i];
    const right = transformedLevels[i + 1];
    for (const lNode of left) {
      for (const rNode of right) {
        const overlap = lNode.overlap.intersect(rNode.overlap);
        lNode.missing.withoutUpdate(overlap);

        if (overlap.isNotEmpty) {
          links.push({
            id: `${lNode.id}-${rNode.id}`,
            name: `${lNode.name} → ${rNode.name}`,
            value: overlap.size,
            overlap,
            source: lNode.id,
            target: rNode.id,
          });
        }
      }
    }
  }
  return {
    nodes,
    links,
    layers: extractLayers(nodes, levels),
  };
}

export function isSelected(
  selection: readonly SankeyID[] | SankeySelection | undefined,
  type: SankeySelection['type'],
  id: string
): boolean {
  return selection != null && !isArray(selection) && selection.type === type && selection.id === id;
}
