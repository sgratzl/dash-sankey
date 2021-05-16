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
import { classNames, OverlapHelper } from '../utils';

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

declare type SankeyInternalNode = SankeyNodeImpl<
  SankeyNode & { fixedValue: number; overlap: OverlapHelper<SankeyID> },
  { id: string; name: string; overlap: OverlapHelper<SankeyID> }
>;
declare type SankeyInternalLink = SankeyLinkImpl<
  SankeyNode & { fixedValue: number; overlap: OverlapHelper<SankeyID> },
  { id: string; name: string; overlap: OverlapHelper<SankeyID> }
>;

function extractGraph(levels: readonly SankeyLevel[]) {
  const nodes: SankeyInternalNode[] = [];
  const transformedLevels = levels.map((level) => {
    return level.nodes.map((d) => {
      const n: SankeyInternalNode = {
        ...d,
        overlap: new OverlapHelper(d.ids),
        fixedValue: d.ids.length,
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

function pathGen(link: SankeyInternalLink, fraction = 1) {
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
        x: (link.target as SankeyInternalNode).x0!,
        y0: link.y1! + base,
        y1: link.y1! + base + height,
      },
    ]) ?? ''
  );
}

function dummy() {
  // dummy
}

const DashSankey: FC<DashSankeyProps> = ({
  id,
  setProps = dummy,
  height = 300,
  padding = 5,
  iterations = 6,
  nodeAlign = 'justify',
  nodePadding = 8,
  nodeWidth = 24,
  nodeSort = 'auto',
  levels,
  children,
  selection,
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

  const selectionOverlap = useMemo(() => new OverlapHelper(selection ?? []), [selection]);

  const graph = useMemo(() => extractGraph(levels), [levels]);
  const layoutGraph = useMemo(
    () =>
      sankeyGen({
        // work on copy since manipulated in place
        nodes: graph.nodes.map((d) => ({ ...d })),
        links: graph.links.map((d) => ({ ...d })),
      }),
    [graph, sankeyGen]
  );
  // TODO level labels
  // TODO link labels?
  const maxDepth = layoutGraph.nodes.reduce((acc, v) => Math.max(acc, v.depth ?? 0), 0);

  const select = useCallback(
    (ids: readonly SankeyID[] | OverlapHelper<SankeyID>) => {
      return () => {
        setProps({ selection: ids instanceof OverlapHelper ? ids.elems : ids });
      };
    },
    [setProps]
  );
  return (
    <div ref={ref} id={id}>
      <svg width={width} height={height} className="dash-sankey">
        <g className="dash-sankey-links">
          {layoutGraph.links.map((link) => {
            const overlap = selectionOverlap.intersect(link.overlap);
            return (
              <g key={link.id} onClick={select(link.overlap.elems)}>
                <path d={pathGen(link, 1)} className="dash-sankey-link" />
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
  padding: 5,
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

  selection: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.number.isRequired]).isRequired
  ),
};

export default DashSankey;
