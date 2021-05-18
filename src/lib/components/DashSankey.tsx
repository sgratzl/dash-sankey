/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import React, { FC, useCallback, useMemo } from 'react';
import PropTypes from 'prop-types';
import useResizeObserver from 'use-resize-observer';
import { sankey, sankeyCenter, sankeyJustify, sankeyLeft, sankeyRight } from 'd3-sankey';
import './DashSankey.css';
import { classNames, deriveBox, IBox, isArray, noop, OverlapHelper, PADDING_PROP_TYPES } from '../utils';
import {
  extractGraph,
  extractLayers,
  isSelected,
  SankeyID,
  SankeyInternalLink,
  SankeyInternalNode,
  SankeyLevel,
  SankeySelection,
} from './model';
import { missingPath, pathGen } from './renderUtils';

export type { SankeyID, SankeyLevel, SankeyNode, SankeyLink, SankeySelection } from './model';

export interface DashChangeAbleSankeyProps {
  selection?: SankeySelection | readonly SankeyID[];
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
  selections?: { color: string; ids: readonly SankeyID[] }[];
}

export type DashSankeyProps = DashReadOnlyLayoutSankeyProps &
  DashReadOnlySankeyProps &
  DashChangeAbleSankeyProps & {
    id?: string;
    setProps?(props: DashChangeAbleSankeyProps): void;
    children?: React.ReactNode;
  };

function useSankeyLayout({
  levels,
  height = 300,
  padding = DEFAULT_PADDING,
  iterations = 6,
  nodeAlign = 'justify',
  nodePadding = 8,
  nodeWidth = 24,
  nodeSort = 'auto',
}: Omit<DashReadOnlyLayoutSankeyProps, 'lineOffset'> & { levels: SankeyLevel[] }) {
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

  return { ref, layoutGraph, width, height, maxDepth, maxLayerY1, nodeWidth };
}

/**
 * DashSankey shows an interactive parallel set / sankey diagram
 */
const DashSankey: FC<DashSankeyProps> = (props) => {
  const { id, setProps = noop, lineOffset = 5, children, selection, selections } = props;
  const { ref, width, height, layoutGraph, maxDepth, maxLayerY1, nodeWidth } = useSankeyLayout({
    levels: props.levels,
    height: props.height,
    iterations: props.iterations,
    nodeAlign: props.nodeAlign,
    nodePadding: props.nodePadding,
    nodeSort: props.nodeSort,
    nodeWidth: props.nodeWidth,
    padding: props.padding,
  });

  const selectionOverlap = useMemo(
    () => new OverlapHelper(isArray(selection) ? selection : selection?.ids ?? []),
    [selection]
  );
  const selectionsOverlaps = useMemo(
    () => (selections ?? []).map((s) => ({ ...s, overlap: new OverlapHelper(s.ids) })),
    [selections]
  );

  const select = useCallback(
    (type: SankeySelection['type'], selectionId: string, ids: readonly SankeyID[] | OverlapHelper<SankeyID>) => {
      return (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const s: SankeySelection = {
          id: selectionId,
          type,
          ids: ids instanceof OverlapHelper ? ids.elems : ids,
        };
        setProps({ selection: s });
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
              <g key={link.id} onClick={select('link', link.id, link.overlap.elems)}>
                <path
                  d={pathGen(link, lineOffset, 1)}
                  className={classNames(
                    'dash-sankey-link',
                    isSelected(selection, 'link', link.id) && 'dash-sankey-link__picked'
                  )}
                />
                <title>
                  {link.name}: {link.value.toLocaleString()}
                </title>
                {selectionsOverlaps.map((s) => {
                  const o = s.overlap.intersect(link.overlap);
                  if (o.isEmpty) {
                    return null;
                  }
                  return (
                    <path
                      key={s.color}
                      d={pathGen(link, lineOffset, o.size / link.overlap.size)}
                      className="dash-sankey-link"
                      style={{ fill: s.color }}
                    />
                  );
                })}
                {overlap.isNotEmpty && (
                  <path
                    d={pathGen(link, lineOffset, overlap.size / link.overlap.size)}
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
              <g key={node.id} onClick={select('missing', node.id, node.missing)}>
                <path
                  d={missingPath(node, lineOffset, 1)}
                  className={classNames(
                    'dash-sankey-link dash-sankey-link__missing',
                    isSelected(selection, 'missing', node.id) && 'dash-sankey-link__picked'
                  )}
                />
                <title>
                  {node.name} → ?: {node.missing.length.toLocaleString()}
                </title>
                {selectionsOverlaps.map((s) => {
                  const o = s.overlap.intersect(node.missing);
                  if (o.isEmpty) {
                    return null;
                  }
                  return (
                    <path
                      key={s.color}
                      d={missingPath(node, lineOffset, o.size / node.missing.size)}
                      className="dash-sankey-link dash-sankey-link__missing"
                      style={{ fill: s.color }}
                    />
                  );
                })}
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
              <g
                key={layer.id}
                transform={`translate(${layer.x0!},${layer.y0!})`}
                onClick={select('layer', layer.id, layer.overlap)}
                className={classNames(isSelected(selection, 'layer', layer.id) && 'dash-sankey-layer__picked')}
              >
                <text
                  x={x}
                  y={layerHeight}
                  dy={lineOffset + 2}
                  className={classNames(
                    'dash-sankey-layer-name',
                    i === 0 && 'dash-sankey-layer-name__first',
                    i === layoutGraph.layers.length - 1 && 'dash-sankey-layer-name__last'
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
              <g
                key={node.id}
                transform={`translate(${node.x0!},${node.y0!})`}
                onClick={select('node', node.id, node.ids)}
              >
                <rect
                  width={nodeWidth}
                  height={nodeHeight}
                  className={classNames(
                    'dash-sankey-node',
                    isSelected(selection, 'node', node.id) && 'dash-sankey-node__picked'
                  )}
                />
                {selectionsOverlaps.map((s) => {
                  const o = s.overlap.intersect(node.overlap);
                  if (o.isEmpty) {
                    return null;
                  }
                  return (
                    <rect
                      key={s.color}
                      width={nodeWidth}
                      height={nodeHeight * (o.size / node.overlap.size)}
                      className="dash-sankey-node"
                      style={{ fill: s.color }}
                    />
                  );
                })}
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
  selections: undefined,
};

const ID_ARRAY = PropTypes.arrayOf(
  PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.number.isRequired]).isRequired
).isRequired;

const SELECTION_PROP_TYPE = PropTypes.oneOfType([
  ID_ARRAY,
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf<'node' | 'link' | 'missing' | 'layer'>(['node', 'link', 'missing', 'layer']).isRequired,
    ids: ID_ARRAY,
  }),
]);

DashSankey.propTypes = {
  /**
   * The ID used to identify this component in Dash callbacks.
   */
  id: PropTypes.string,
  /**
   * set props helper for dash
   */
  setProps: PropTypes.func,
  /**
   * children helper for dash
   */
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
  padding: PADDING_PROP_TYPES,

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
          ids: ID_ARRAY,
        }).isRequired
      ).isRequired,
    }).isRequired
  ).isRequired,

  /**
   * the selection to highlight
   */
  selection: SELECTION_PROP_TYPE,
  /**
   * additional selections to highlight in their given color
   */
  selections: PropTypes.arrayOf(
    PropTypes.shape({
      color: PropTypes.string.isRequired,
      ids: ID_ARRAY,
    }).isRequired
  ),
};

export default DashSankey;
