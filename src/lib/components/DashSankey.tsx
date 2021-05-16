/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FC, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import useResizeObserver from 'use-resize-observer';
import {
  sankey,
  sankeyCenter,
  sankeyJustify,
  sankeyLeft,
  sankeyRight,
  SankeyLink as SankeyLinkImpl,
  SankeyNode as SankeyNodeImpl,
} from 'd3-sankey';
import { area, curveMonotoneX } from 'd3-shape';
import './DashSankey.css';
import { classNames, deriveBox, IBox, OverlapHelper } from '../utils';

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

export interface DashChangeAbleSankeyProps {
  selection?: readonly SankeyID[];
}

const DEFAULT_PADDING: IBox = { left: 5, top: 5, right: 5, bottom: 20 };

export interface DashReadOnlyLayoutSankeyProps {
  /**
   * @default 300
   */
  height?: number;
  /**
   * padding around SVG
   * @default ({left: 5, top: 5, right: 5, bottom: 20})
   */
  padding?: number | IBox;
  /**
   * offset around line before bending
   * @default 5
   */
  lineOffset?: number;
  /**
   * sets the number of relaxation iterations when generating the layout and returns this Sankey generator.
   * @default 6
   */
  iterations?: number;
  /**
   * sets the node width to the specified number and returns this Sankey generator.
   * @default 24
   */
  nodeWidth?: number;
  /**
   *  sets the vertical separation between nodes at each column to the specified number and returns this Sankey generator.
   * @default 8
   */
  nodePadding?: number;
  /**
   * justify method
   * @default 'justify';
   */
  nodeAlign?: 'left' | 'right' | 'center' | 'justify';
  /**
   * node sort order
   * @default 'auto'
   */
  nodeSort?: 'auto' | 'fixed';
}

export interface DashReadOnlySankeyProps {
  levels: SankeyLevel[];
}

export type DashSankeyProps = DashReadOnlyLayoutSankeyProps &
  DashReadOnlySankeyProps &
  DashChangeAbleSankeyProps & {
    id?: string;
    setProps?(props: DashChangeAbleSankeyProps): void;
    children?: React.ReactNode;
  };

declare interface SankeyInternalNodeExtras extends SankeyNode {
  fixedValue: number;
  overlap: OverlapHelper<SankeyID>;
  /**
   * ids that are not part of any outgoing link
   */
  missing: OverlapHelper<SankeyID>;
}
declare interface SankeyInternalLinkExtras {
  id: string;
  name: string;
  overlap: OverlapHelper<SankeyID>;
}
declare type SankeyInternalNode = SankeyNodeImpl<SankeyInternalNodeExtras, SankeyInternalLinkExtras>;
declare type SankeyInternalLink = SankeyLinkImpl<SankeyInternalNodeExtras, SankeyInternalLinkExtras>;

function extractGraph(levels: readonly SankeyLevel[]) {
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
  };
}

function pathGen(link: SankeyInternalLink, lineOffset: number, fraction = 1) {
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

function missingPath(node: SankeyInternalNode, off: number, fraction = 1) {
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

interface SankeyInternalLayer {
  id: string;
  nodes: SankeyInternalNode[];
  name: string;
  overlap: OverlapHelper<SankeyID>;

  x0: number;
  x1: number;
  y0: number;
  y1: number;
}

function extractLayers(nodes: SankeyInternalNode[], levels: SankeyLevel[]) {
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

function dummy() {
  // dummy
}

const DashSankey: FC<DashSankeyProps> = ({
  id,
  setProps = dummy,
  height = 300,
  padding = DEFAULT_PADDING,
  lineOffset = 5,
  iterations = 6,
  nodeAlign = 'justify',
  nodePadding = 8,
  nodeWidth = 24,
  nodeSort = 'auto',
  levels,
  children,
  selection,
}) => {
  const p = useMemo(() => deriveBox(padding, DEFAULT_PADDING), [padding]);
  const { ref, width = p.left + p.right + 10 } = useResizeObserver<HTMLDivElement>();
  const sankeyGen = useMemo(() => {
    const s = sankey<SankeyInternalNode, SankeyInternalLink>();
    s.extent([
      [p.left, p.top],
      [width - p.left - p.right, height - p.top - p.bottom],
    ]);
    const alignmentsToFunction = {
      left: sankeyLeft,
      right: sankeyRight,
      center: sankeyCenter,
      justify: sankeyJustify,
    };
    s.nodeId((n) => n.id);
    s.iterations(iterations)
      .nodeAlign(alignmentsToFunction[nodeAlign])
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .nodeSort(nodeSort === 'auto' ? undefined : (null as any));
    return s;
  }, [p, width, height, iterations, nodeAlign, nodeWidth, nodePadding, nodeSort]);

  const selectionOverlap = useMemo(() => new OverlapHelper(selection ?? []), [selection]);

  const graph = useMemo(() => extractGraph(levels), [levels]);
  const layoutGraph = useMemo(() => {
    if (levels.length === 0) {
      return {
        nodes: [],
        links: [],
        layers: [],
      };
    }
    const g = sankeyGen({
      // work on copy since manipulated in place
      nodes: graph.nodes.map((d) => ({ ...d })),
      links: graph.links.map((d) => ({ ...d })),
    });
    return {
      nodes: g.nodes,
      links: g.links,
      layers: extractLayers(g.nodes, levels),
    };
  }, [graph, sankeyGen, levels]);

  const maxDepth = layoutGraph.nodes.reduce((acc, v) => Math.max(acc, v.depth ?? 0), 0);
  const maxLayerY1 = layoutGraph.layers.reduce((acc, v) => Math.max(acc, v.y1), 0);

  const select = useCallback(
    (ids: readonly SankeyID[] | OverlapHelper<SankeyID>) => {
      return (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setProps({ selection: ids instanceof OverlapHelper ? ids.elems : ids });
      };
    },
    [setProps]
  );
  const resetSelection = useCallback(() => {
    setProps({ selection: [] });
  }, [setProps]);
  return (
    <div ref={ref} id={id}>
      <svg width={width} height={height} className="dash-sankey" onClick={resetSelection}>
        <g className="dash-sankey-links">
          {layoutGraph.links.map((link) => {
            const overlap = selectionOverlap.intersect(link.overlap);
            return (
              <g key={link.id} onClick={select(link.overlap.elems)}>
                <path d={pathGen(link, lineOffset, 1)} className="dash-sankey-link" />
                <title>
                  {link.name}: {link.value.toLocaleString()}
                </title>
                {overlap.isNotEmpty && (
                  <path
                    d={pathGen(link, overlap.size / link.overlap.size)}
                    className="dash-sankey-link dash-sankey-link__selected"
                  />
                )}
              </g>
            );
          })}
          {layoutGraph.nodes.map((node) => {
            if (node.missing.isEmpty || node.depth! >= maxDepth) {
              return null;
            }
            const overlap = selectionOverlap.intersect(node.missing);
            return (
              <g key={node.id} onClick={select(node.missing)}>
                <path d={missingPath(node, lineOffset, 1)} className="dash-sankey-link dash-sankey-link__missing" />
                <title>
                  {node.name} → ?: {node.missing.length.toLocaleString()}
                </title>
                {overlap.isNotEmpty && (
                  <path
                    d={missingPath(node, lineOffset, overlap.size / node.missing.size)}
                    className="dash-sankey-link dash-sankey-link__missing dash-sankey-link__selected"
                  />
                )}
              </g>
            );
          })}
        </g>
        <g className="dash-sankey-layers">
          {layoutGraph.layers.map((layer, i) => {
            const layerHeight = maxLayerY1 - layer.y0;
            let x = i > 0 ? nodeWidth / 2 : 0;
            if (i === layoutGraph.layers.length - 1) {
              x = nodeWidth;
            }
            return (
              <g key={layer.id} transform={`translate(${layer.x0!},${layer.y0!})`} onClick={select(layer.overlap)}>
                <text
                  x={x}
                  y={layerHeight}
                  dy={lineOffset + 2}
                  className={classNames(
                    'dash-sankey-layer-name',
                    i === 0 && 'dash-sankey-layer-name__first',
                    i === layoutGraph.layers.length && 'dash-sankey-layer-name__last'
                  )}
                >
                  {layer.name}
                </text>
                <title>
                  {layer.name}: {layer.overlap.length.toLocaleString()}
                </title>
              </g>
            );
          })}
        </g>

        <g className="dash-sankey-nodes">
          {layoutGraph.nodes.map((node) => {
            const overlap = selectionOverlap.intersect(node.overlap);
            const nodeHeight = node.y1! - node.y0!;
            return (
              <g key={node.id} transform={`translate(${node.x0!},${node.y0!})`} onClick={select(node.ids)}>
                <rect width={nodeWidth} height={nodeHeight} className="dash-sankey-node" />
                {overlap.isNotEmpty && (
                  <rect
                    width={nodeWidth}
                    height={nodeHeight * (overlap.size / node.overlap.size)}
                    className="dash-sankey-node dash-sankey-node__selected"
                  />
                )}
                <text
                  x={node.depth! < maxDepth ? nodeWidth : 0}
                  y={nodeHeight / 2}
                  dx={node.depth! < maxDepth ? 2 : -2}
                  className={classNames(
                    'dash-sankey-node-name',
                    node.depth! >= maxDepth && 'dash-sankey-node-name__last'
                  )}
                >
                  {node.name}
                </text>
                <title>
                  {node.name}: {node.value!.toLocaleString()}
                </title>
              </g>
            );
          })}
        </g>
        {children}
      </svg>
    </div>
  );
};

DashSankey.defaultProps = {
  id: undefined,
  setProps: undefined,

  height: 300,
  padding: DEFAULT_PADDING,
  lineOffset: 5,
  iterations: 6,
  nodeWidth: 24,
  nodePadding: 8,
  nodeAlign: 'justify',
  nodeSort: 'auto',
  children: [],
  selection: undefined,
};

DashSankey.propTypes = {
  /**
   * The ID used to identify this component in Dash callbacks.
   */
  id: PropTypes.string,
  setProps: PropTypes.func,
  children: PropTypes.node,

  // layout
  /**
   * height of the resulting chart
   * @default 300
   */
  height: PropTypes.number,
  /**
   * padding around SVG
   * @default 5
   */
  padding: PropTypes.oneOfType([
    PropTypes.number.isRequired,
    PropTypes.shape({
      left: PropTypes.number.isRequired,
      top: PropTypes.number.isRequired,
      right: PropTypes.number.isRequired,
      bottom: PropTypes.number.isRequired,
    }).isRequired,
  ]),

  /**
   * offset between lines
   * @default 5
   */
  lineOffset: PropTypes.number,
  /**
   * sets the number of relaxation iterations when generating the layout and returns this Sankey generator.
   * @default 6
   */
  iterations: PropTypes.number,
  /**
   * sets the node width to the specified number and returns this Sankey generator.
   * @default 24
   */
  nodeWidth: PropTypes.number,
  /**
   *  sets the vertical separation between nodes at each column to the specified number and returns this Sankey generator.
   * @default 8
   */
  nodePadding: PropTypes.number,
  /**
   * justify method
   * @default 'justify';
   */
  nodeAlign: PropTypes.oneOf(['left', 'right', 'center', 'justify']),
  /**
   * node sort order
   * @default 'auto'
   */
  nodeSort: PropTypes.oneOf(['auto', 'fixed']),

  /**
   * level sankey data
   */
  levels: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      nodes: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
          ids: PropTypes.arrayOf(
            PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.number.isRequired]).isRequired
          ).isRequired,
        }).isRequired
      ).isRequired,
    }).isRequired
  ).isRequired,

  selection: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.number.isRequired]).isRequired
  ),
};

export default DashSankey;
