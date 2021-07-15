/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import PropTypes from 'prop-types';
import React, { FC, useCallback, useMemo } from 'react';
import useResizeObserver from 'use-resize-observer';
import DashSankeyImpl from '../internal/sankey/DashSankeyImpl';
import type { SankeyLayoutOptions } from '../internal/sankey/hooks';
import {
  DEFAULT_PADDING,
  SankeyExtraSelection,
  SankeyID,
  SankeyLayer,
  SankeyLink,
  SankeyNode,
  SankeySelection,
} from '../internal/sankey/model';
import { ID_ARRAY, LINK_ARR, NODE_ARR, SELECTION_PROP_TYPE } from '../internal/sankey/propTypes';
import { deriveBox, PADDING_PROP_TYPES } from '../utils';
import './DashSankey.css';

export type {
  SankeyExtraSelection,
  SankeyID,
  SankeyLayer,
  SankeyLink,
  SankeyNode,
  SankeySelection,
} from '../internal/sankey/model';

export interface DashChangeAbleSankeyProps {
  selection?: SankeySelection | readonly SankeyID[];
}

export interface DashReadOnlyLayoutSankeyProps extends SankeyLayoutOptions {
  /**
   * offset around line before bending
   * @default 5
   */
  lineOffset?: number;

  /**
   * render layers
   * @default true
   */
  showLayers?: boolean;

  /**
   * total number of ids to show percentages
   */
  total?: number;
}

export type DashSankeyProps = DashReadOnlyLayoutSankeyProps & {
  layers?: readonly SankeyLayer[];
  nodes?: readonly SankeyNode[];
  links?: readonly SankeyLink[];
} & DashChangeAbleSankeyProps & {
    selections?: SankeyExtraSelection[];
    id?: string;
    setProps?(props: DashChangeAbleSankeyProps): void;
    children?: React.ReactNode;
  };

/**
 * DashSankey shows an interactive parallel set / sankey diagram
 */
const DashSankey: FC<DashSankeyProps> = (props) => {
  const { id, children, height = 300, setProps } = props;

  const resetSelection = useCallback(() => {
    if (setProps) {
      setProps({ selection: [] });
    }
  }, [setProps]);

  const p = useMemo(() => deriveBox(props.padding ?? DEFAULT_PADDING, DEFAULT_PADDING), [props.padding]);
  const { ref, width: computedWidth = p.left + p.right + 10 } = useResizeObserver<HTMLDivElement>();
  const fixedWidth = props.width ?? computedWidth;

  return (
    <div ref={ref} id={id}>
      <svg width={fixedWidth} height={height} className="dash-sankey" onClick={resetSelection}>
        <DashSankeyImpl {...props} width={fixedWidth} height={height} />
        {children}
      </svg>
    </div>
  );
};

DashSankey.defaultProps = {
  id: undefined,
  setProps: undefined,
  width: undefined,
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
  layers: undefined,
  nodes: undefined,
  links: undefined,
  showLayers: true,
  total: undefined,
};

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
   * width of the resulting chart
   */
  width: PropTypes.number,
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
   * show layer names
   * @default true
   */
  showLayers: PropTypes.bool,

  /**
   * total number of ids to show percentages
   */
  total: PropTypes.number,
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
  nodeAlign: PropTypes.oneOf<DashReadOnlyLayoutSankeyProps['nodeAlign']>([
    'left',
    'right',
    'center',
    'justify',
    'layer',
  ]),
  /**
   * node sort order
   * @default 'auto'
   */
  nodeSort: PropTypes.oneOf<DashReadOnlyLayoutSankeyProps['nodeSort']>(['auto', 'fixed']),

  /**
   * level sankey data
   */
  layers: PropTypes.arrayOf(
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
  /**
   * nodes data as an alternative to layers
   */
  nodes: NODE_ARR as React.Validator<readonly SankeyNode[]> | undefined,
  /**
   * link data as an alternative to layers
   */
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
