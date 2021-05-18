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
  layer?: number;
}

export interface SankeyLayer {
  name: string;
  nodes: SankeyNode[];
}

export interface SankeyLink {
  source: string;
  target: string;
  ids?: readonly SankeyID[];
}

export interface SankeySelection {
  type: 'node' | 'link' | 'layer' | 'missing_in' | 'missing_out';
  id: string;
  ids: readonly SankeyID[];
}

export const DEFAULT_PADDING: IBox = { left: 5, top: 5, right: 5, bottom: 20 };

export declare interface SankeyInternalNodeExtras extends SankeyNode {
  id: string;
  fixedValue: number;
  overlap: OverlapHelper<SankeyID>;
  /**
   * ids that are not part of any incoming link
   */
  missingIn: OverlapHelper<SankeyID>;
  /**
   * ids that are not part of any outgoing link
   */
  missingOut: OverlapHelper<SankeyID>;
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

// eslint-disable-next-line prettier/prettier
export function extractLayers(
  nodes: readonly SankeyInternalNode[],
  layers?: readonly SankeyLayer[]
): SankeyInternalLayer[] {
  const internalLayers: SankeyInternalLayer[] = [];

  // depth is not a good indicator for layer -> x positions is
  const xPositions = [...new Set(nodes.map((d) => d.x0!))].sort((a, b) => a - b);
  const xPositionToLayer = new Map(xPositions.map((x, i) => [x, i]));

  for (const node of nodes) {
    const layer = node.layer ?? xPositionToLayer.get(node.x0!) ?? 0;
    node.layer = layer; // save layer

    const l = internalLayers[layer];
    if (l == null) {
      internalLayers[layer] = {
        id: layer.toString(),
        name: layers?.[layer]?.name ?? `Layer ${layer}`,
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
  return internalLayers;
}

export function extractGraph(data: {
  layers?: readonly SankeyLayer[];
  nodes?: readonly SankeyNode[];
  links?: readonly SankeyLink[];
}): {
  nodes: SankeyInternalNode[];
  links: SankeyInternalLink[];
  layers: SankeyInternalLayer[];
  getOverlap(type: SankeySelection['type'], id: string): OverlapHelper<SankeyID>;
} {
  const lookup = new Map<string, OverlapHelper<SankeyID>>();
  const nodes: SankeyInternalNode[] = [];
  const links: SankeyInternalLink[] = [];

  function asNode(d: SankeyNode, layer?: number) {
    const overlap = new OverlapHelper(d.ids);
    lookup.set(`node:${d.id}`, overlap);
    const missingIn = overlap.copy();
    const missingOut = overlap.copy();
    lookup.set(`missing_in:${d.id}`, missingIn);
    lookup.set(`missing_out:${d.id}`, missingOut);
    const n: SankeyInternalNode = {
      layer,
      ...d,
      overlap,
      fixedValue: d.ids.length,
      missingIn,
      missingOut,
    };
    nodes.push(n);
    return n;
  }

  function asLink(source: SankeyInternalNode, target: SankeyInternalNode, overlap: OverlapHelper<SankeyID>) {
    if (overlap.isEmpty) {
      return undefined;
    }
    source.missingOut.withoutUpdate(overlap);
    target.missingIn.withoutUpdate(overlap);
    lookup.set(`link:${source.id}-${target.id}`, overlap);
    const l: SankeyInternalLink = {
      id: `${source.id}-${target.id}`,
      name: `${source.name} → ${target.name}`,
      value: overlap.size,
      overlap,
      source: source.id,
      target: target.id,
    };
    links.push(l);
    return l;
  }

  if (data.layers) {
    const transformedLevels = data.layers.map((layer, i) => {
      return layer.nodes.map((d) => asNode(d, i));
    });

    for (let i = 0; i < transformedLevels.length - 1; i += 1) {
      const left = transformedLevels[i];
      const right = transformedLevels[i + 1];
      for (const source of left) {
        for (const target of right) {
          asLink(source, target, source.overlap.intersect(target.overlap));
        }
      }
    }
  }

  if (data.nodes) {
    for (const node of data.nodes) {
      asNode(node);
    }
  }
  if (data.links) {
    const lookupNode = new Map(nodes.map((d) => [d.id, d]));
    for (const link of data.links) {
      const source = lookupNode.get(link.source)!;
      const target = lookupNode.get(link.target)!;
      const overlap = link.ids ? new OverlapHelper(link.ids) : source.overlap.intersect(target.overlap);
      asLink(source, target, overlap);
    }
  }
  const layers = extractLayers(nodes, data.layers);
  for (const layer of layers) {
    lookup.set(`layer:${layer.id}`, layer.overlap);
  }
  return {
    nodes,
    links,
    layers,
    getOverlap: (type, id) => {
      return lookup.get(`${type}:${id}`) ?? new OverlapHelper<SankeyID>([]);
    },
  };
}

export function isSelected(
  selection: readonly SankeyID[] | SankeySelection | undefined,
  type: SankeySelection['type'],
  id: string
): boolean {
  return selection != null && !isArray(selection) && selection.type === type && selection.id === id;
}
