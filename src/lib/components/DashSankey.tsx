/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import PropTypes from 'prop-types';
import React, { FC, Fragment, useMemo } from 'react';
import { EMPTY_ARR, PADDING_PROP_TYPES } from '../utils';
import './DashSankey.css';
import { SankeyLayoutOptions, useSankeyLayout, useSelections } from '../internal/sankey/hooks';
import {
  DEFAULT_PADDING,
  SankeyID,
  SankeyLevel,
  SankeySelection,
  SankeyLink,
  SankeyNode,
} from '../internal/sankey/model';
import SankeyLayerC from '../internal/sankey/SankeyLayer';
import SankeyLinkC from '../internal/sankey/SankeyLink';
import SankeyMissingInLink from '../internal/sankey/SankeyMissingInLink';
import SankeyMissingOutLink from '../internal/sankey/SankeyMissingOutLink';
import SankeyNodeC from '../internal/sankey/SankeyNode';

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
export type DashSankeyProps = DashReadOnlyLayoutSankeyProps & {
  levels?: readonly SankeyLevel[];
  nodes?: readonly SankeyNode[];
  links?: readonly SankeyLink[];
} & DashChangeAbleSankeyProps & {
    selections?: { color: string; ids: readonly SankeyID[] }[];
    id?: string;
    setProps?(props: DashChangeAbleSankeyProps): void;
    children?: React.ReactNode;
  };

/**
 * DashSankey shows an interactive parallel set / sankey diagram
 */
const DashSankey: FC<DashSankeyProps> = (props) => {
  const { id, lineOffset = 5, children, levels, nodes, links } = props;
  const resolvedData = useMemo(
    () => levels ?? { nodes: nodes ?? EMPTY_ARR, links: links ?? EMPTY_ARR },
    [levels, nodes, links]
  );

  const { ref, width, height, layoutGraph, maxDepth, maxLayerY1, nodeWidth, graph } = useSankeyLayout(resolvedData, {
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
            <SankeyLinkC key={link.id} selections={selections} link={link} lineOffset={lineOffset} />
          ))}
          {layoutGraph.nodes.map((node) => (
            <Fragment key={node.id}>
              <SankeyMissingInLink selections={selections} node={node} lineOffset={lineOffset} />
              <SankeyMissingOutLink
                key={node.id}
                selections={selections}
                node={node}
                maxDepth={maxDepth}
                lineOffset={lineOffset}
              />
            </Fragment>
          ))}
        </g>
        <g className="dash-sankey-layers">
          {layoutGraph.layers.map((layer, i) => (
            <SankeyLayerC
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
            <SankeyNodeC key={node.id} selections={selections} node={node} maxDepth={maxDepth} nodeWidth={nodeWidth} />
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
  levels: undefined,
  nodes: undefined,
  links: undefined,
};

const ID_ARRAY = PropTypes.arrayOf(
  PropTypes.oneOfType([PropTypes.string.isRequired, PropTypes.number.isRequired]).isRequired
).isRequired;

const NODE_ARR = PropTypes.arrayOf(
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    ids: ID_ARRAY,
  }).isRequired
);
const LINK_ARR = PropTypes.arrayOf(
  PropTypes.shape({
    source: PropTypes.string.isRequired,
    target: PropTypes.string.isRequired,
    ids: ID_ARRAY,
  }).isRequired
);

const SELECTION_PROP_TYPE = PropTypes.oneOfType([
  ID_ARRAY,
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf<SankeySelection['type']>(['node', 'link', 'missing_in', 'missing_out', 'layer']).isRequired,
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
  ),
  nodes: NODE_ARR as React.Validator<readonly SankeyNode[]> | undefined,
  links: LINK_ARR as React.Validator<readonly SankeyLink[]> | undefined,

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
