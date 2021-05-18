/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import PropTypes from 'prop-types';
import React, { FC } from 'react';
import { PADDING_PROP_TYPES } from '../utils';
import './DashSankey.css';
import { SankeyLayoutOptions, useSankeyLayout, useSelections } from '../internal/sankey/hooks';
import { DEFAULT_PADDING, SankeyID, SankeyLevel, SankeySelection } from '../internal/sankey/model';
import SankeyLayer from '../internal/sankey/SankeyLayer';
import SankeyLink from '../internal/sankey/SankeyLink';
import SankeyMissingLink from '../internal/sankey/SankeyMissingLink';
import SankeyNode from '../internal/sankey/SankeyNode';

export type { SankeyID, SankeyLevel, SankeyLink, SankeyNode, SankeySelection } from '../internal/sankey/model';

export interface DashChangeAbleSankeyProps {
  selection?: SankeySelection | readonly SankeyID[];
}

export interface DashReadOnlyLayoutSankeyProps extends SankeyLayoutOptions {
  /**
   * offset around line before bending
   * @default 5
   */
  lineOffset?: number;
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

/**
 * DashSankey shows an interactive parallel set / sankey diagram
 */
const DashSankey: FC<DashSankeyProps> = (props) => {
  const { id, lineOffset = 5, children, levels } = props;
  const { ref, width, height, layoutGraph, maxDepth, maxLayerY1, nodeWidth, graph } = useSankeyLayout(levels, {
    height: props.height,
    iterations: props.iterations,
    nodeAlign: props.nodeAlign,
    nodePadding: props.nodePadding,
    nodeSort: props.nodeSort,
    nodeWidth: props.nodeWidth,
    padding: props.padding,
  });
  const { resetSelection, selections } = useSelections(graph, {
    selection: props.selection,
    setProps: props.setProps,
    selections: props.selections,
  });

  return (
    <div ref={ref} id={id}>
      <svg width={width} height={height} className="dash-sankey" onClick={resetSelection}>
        <g className="dash-sankey-links">
          {layoutGraph.links.map((link) => (
            <SankeyLink key={link.id} selections={selections} link={link} lineOffset={lineOffset} />
          ))}
          {layoutGraph.nodes.map((node) => (
            <SankeyMissingLink
              key={node.id}
              selections={selections}
              node={node}
              maxDepth={maxDepth}
              lineOffset={lineOffset}
            />
          ))}
        </g>
        <g className="dash-sankey-layers">
          {layoutGraph.layers.map((layer, i) => (
            <SankeyLayer
              key={layer.id}
              selections={selections}
              layer={layer}
              maxLayerY1={maxLayerY1}
              i={i}
              nLayers={layoutGraph.layers.length}
              nodeWidth={nodeWidth}
              lineOffset={lineOffset}
            />
          ))}
        </g>

        <g className="dash-sankey-nodes">
          {layoutGraph.nodes.map((node) => (
            <SankeyNode key={node.id} selections={selections} node={node} maxDepth={maxDepth} nodeWidth={nodeWidth} />
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
