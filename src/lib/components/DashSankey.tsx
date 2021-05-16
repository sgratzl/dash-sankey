/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FC, useMemo } from 'react';
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

export interface DashReadOnlyLayoutSankeyProps {
  /**
   * @default 300
   */
  height?: number;
  /**
   * padding around SVG
   * @default 5
   */
  padding?: number;
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

declare type SankeyInternalNode = SankeyNodeImpl<SankeyNode & { fixedValue?: number }, HasIds & { id: string }>;
declare type SankeyInternalLink = SankeyLinkImpl<SankeyNode & { fixedValue?: number }, HasIds & { id: string }>;

function extractGraph(levels: readonly SankeyLevel[]) {
  const nodes: SankeyInternalNode[] = [];
  const transformedLevels = levels.map((level) => {
    return level.nodes.map((d) => {
      const n: SankeyInternalNode = {
        ...d,
        // fixedValue: d.ids.length,
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
      const lNodeIds = new Set(lNode.ids);
      for (const rNode of right) {
        const overlap = rNode.ids.filter((v) => lNodeIds.has(v));
        if (overlap.length > 0) {
          links.push({
            id: `${lNode.id}-${rNode.id}`,
            value: overlap.length,
            ids: [...overlap],
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

function pathGen(link: SankeyInternalLink) {
  const w2 = link.width! / 2;
  const p = area<{ x: number; y0: number; y1: number }>()
    .curve(curveMonotoneX)
    .x((d) => d.x)
    .y0((d) => d.y0)
    .y1((d) => d.y1);

  return (
    p([
      {
        x: (link.source as SankeyInternalNode).x1!,
        y0: link.y0! - w2,
        y1: link.y0! + w2,
      },
      {
        x: (link.target as SankeyInternalNode).x0!,
        y0: link.y1! - w2,
        y1: link.y1! + w2,
      },
    ]) ?? ''
  );
}

const DashSankey: FC<DashSankeyProps> = ({
  id,
  height = 300,
  padding = 5,
  iterations = 6,
  nodeAlign = 'justify',
  nodePadding = 8,
  nodeWidth = 24,
  nodeSort = 'auto',
  levels,
  children,
}) => {
  const { ref, width = padding * 3 } = useResizeObserver<HTMLDivElement>();
  const sankeyGen = useMemo(() => {
    const s = sankey<SankeyInternalNode, SankeyInternalLink>();
    s.extent([
      [padding, padding],
      [width - padding, height - padding],
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
  }, [padding, width, height, iterations, nodeAlign, nodeWidth, nodePadding, nodeSort]);

  const graph = useMemo(() => extractGraph(levels), [levels]);
  const data = useMemo(
    () =>
      sankeyGen({
        // work on copy since manipulated in place
        nodes: graph.nodes.map((d) => ({ ...d })),
        links: graph.links.map((d) => ({ ...d })),
      }),
    [graph, sankeyGen]
  );
  // TODO level labels
  // TODO node labels
  // TODO link labels?
  // TODO selections
  return (
    <div ref={ref} id={id}>
      <svg width={width} height={height} className="dash-sankey">
        <g className="dash-sankey-nodes">
          {data.nodes.map((node) => (
            <g key={node.id} transform={`translate(${node.x0 ?? 0},${node.y0 ?? 0})`}>
              <rect width={nodeWidth} height={(node.y1 ?? 0) - (node.y0 ?? 0)} className="dash-sankey-node" />
            </g>
          ))}
        </g>
        <g className="dash-sankey-links">
          {data.links.map((link) => (
            <path key={link.id} d={pathGen(link) ?? ''} className="dash-sankey-link" />
          ))}
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
  padding: 5,
  iterations: 6,
  nodeWidth: 24,
  nodePadding: 8,
  nodeAlign: 'justify',
  nodeSort: 'auto',
  children: [],
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
  padding: PropTypes.number,
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
};

export default DashSankey;
