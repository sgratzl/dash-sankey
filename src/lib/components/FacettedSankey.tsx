/* eslint-disable react/require-default-props */
/* eslint-disable react/jsx-props-no-spreading */
/* eslint-disable react/destructuring-assignment */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import PropTypes from 'prop-types';
import React, { FC, useCallback, useMemo } from 'react';
import useResizeObserver from 'use-resize-observer';
import { deriveBox, PADDING_PROP_TYPES } from '../utils';
import './DashSankey.css';
import type { DashChangeAbleSankeyProps, DashReadOnlyLayoutSankeyProps } from './DashSankey';
import DashSankey from './DashSankey';
import { ID_ARRAY, LINK_ARR, NODE_ARR } from '../internal/sankey/propTypes';
import {
  DEFAULT_PADDING,
  FacettedSankeySelection,
  SankeyExtraSelection,
  SankeyID,
  SankeyLayer,
  SankeyLink,
  SankeyNode,
  SankeySelection,
} from '../internal/sankey/model';
import DashSankeyImpl from '../internal/sankey/DashSankeyImpl';

export type { FacettedSankeySelection } from '../internal/sankey/model';

export interface FacettedSankeyChangeAbleProps {
  selection?: FacettedSankeySelection | readonly SankeyID[];
}

export type FacettedSankeyProps = DashReadOnlyLayoutSankeyProps & {
  facets: readonly {
    name: string;
    layers?: readonly SankeyLayer[];
    nodes?: readonly SankeyNode[];
    links?: readonly SankeyLink[];
  }[];
} & FacettedSankeyChangeAbleProps & {
    selections?: SankeyExtraSelection[];
    id?: string;
    setProps?(props: FacettedSankeyChangeAbleProps): void;
    children?: React.ReactNode;
  };

/**
 * FacettedSankey shows an interactive parallel set / sankey diagram
 */
const FacettedSankey: FC<FacettedSankeyProps> = (props) => {
  const { id, children, height = 300, setProps, facets, selection } = props;

  const resetSelection = useCallback(() => {
    if (setProps) {
      setProps({ selection: [] });
    }
  }, [setProps]);

  const p = useMemo(() => deriveBox(props.padding ?? DEFAULT_PADDING, DEFAULT_PADDING), [props.padding]);

  const { ref, width: computedWidth = p.left + p.right + 10 } = useResizeObserver<HTMLDivElement>();
  const width = props.width ?? computedWidth;
  const facetHeight = facets.length > 0 ? height / facets.length : height;

  const facetObjects = useMemo(
    () =>
      facets.map((f) => ({
        ...f,
        setProps: (changed: DashChangeAbleSankeyProps) => {
          if (!setProps) {
            return;
          }
          if (changed.selection == null || Array.isArray(changed.selection)) {
            setProps(changed as { selection: readonly SankeyID[] | undefined });
            return;
          }
          const s = {
            ...changed.selection,
            facet: f.name,
          };
          setProps({ selection: s });
        },
        selection:
          Array.isArray(selection) || selection == null || (selection as FacettedSankeySelection).facet === f.name
            ? selection
            : undefined,
      })),
    [facets, setProps, selection]
  );

  return (
    <div ref={ref} id={id}>
      <svg width={width} height={height} className="dash-sankey" onClick={resetSelection}>
        {facetObjects.map((facet, i) => (
          <g key={facet.name} transform={`translate(0, ${i * facetHeight})`}>
            <text x={width - 12} y={facetHeight / 2} className="dash-sankey-facet-name">
              {facet.name}
            </text>
            <DashSankeyImpl {...props} {...facet} width={width - 16} height={facetHeight} />
          </g>
        ))}
        {children}
      </svg>
    </div>
  );
};

const SELECTION_PROP_TYPE = PropTypes.oneOfType([
  ID_ARRAY,
  PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.oneOf<SankeySelection['type']>(['node', 'link', 'missing_in', 'missing_out', 'layer']).isRequired,
    ids: ID_ARRAY,
    facet: PropTypes.string.isRequired,
  }),
]);

FacettedSankey.propTypes = {
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
  nodeAlign: DashSankey.propTypes!.nodeAlign,
  /**
   * node sort order
   * @default 'auto'
   */
  nodeSort: DashSankey.propTypes!.nodeSort,

  /**
   * the selection to highlight
   */
  selection: SELECTION_PROP_TYPE,
  /**
   * additional selections to highlight in their given color
   */
  selections: DashSankey.propTypes!.selections,
  /**
   * the facets sankey to render
   */
  facets: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
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
      ).isRequired,
      /**
       * nodes data as an alternative to layers
       */
      nodes: NODE_ARR as React.Validator<readonly SankeyNode[]> | undefined,
      /**
       * link data as an alternative to layers
       */
      links: LINK_ARR as React.Validator<readonly SankeyLink[]> | undefined,
    }).isRequired
  ).isRequired,
};

export default FacettedSankey;
