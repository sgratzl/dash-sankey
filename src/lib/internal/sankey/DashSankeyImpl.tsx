/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/prop-types */
import React, { FC, Fragment } from 'react';
import { SankeyLayoutOptions, useSankeyLayout, useSelections } from './hooks';
import type { SankeyExtraSelection, SankeyID, SankeyLayer, SankeyLink, SankeyNode, SankeySelection } from './model';
import SankeyLayerC from './SankeyLayer';
import SankeyLinkC from './SankeyLink';
import SankeyMissingInLink from './SankeyMissingInLink';
import SankeyMissingOutLink from './SankeyMissingOutLink';
import SankeyNodeC from './SankeyNode';

export interface DashSankeyImplProps extends SankeyLayoutOptions {
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
  width: number;
  height: number;

  layers?: readonly SankeyLayer[];
  nodes?: readonly SankeyNode[];
  links?: readonly SankeyLink[];

  selections?: SankeyExtraSelection[];

  selection?: SankeySelection | readonly SankeyID[];
  setProps?(props: { selection?: SankeySelection | readonly SankeyID[] }): void;
}

const DashSankeyImpl: FC<DashSankeyImplProps> = (props) => {
  const { lineOffset = 5, layers, nodes, links, showLayers = true } = props;

  const { layoutGraph, maxLayerY1, nodeWidth, graph } = useSankeyLayout(
    { layers, nodes, links },
    {
      width: props.width,
      height: props.height,
      iterations: props.iterations,
      nodeAlign: props.nodeAlign,
      nodePadding: props.nodePadding,
      nodeSort: props.nodeSort,
      nodeWidth: props.nodeWidth,
      padding: props.padding,
    }
  );
  const selections = useSelections(graph, {
    selection: props.selection,
    selections: props.selections,
    setProps: props.setProps,
  });

  return (
    <>
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
              nLayers={layoutGraph.layers.length}
              lineOffset={lineOffset}
            />
          </Fragment>
        ))}
      </g>
      {showLayers && (
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
      )}
      <g className="dash-sankey-nodes">
        {layoutGraph.nodes.map((node) => (
          <SankeyNodeC
            key={node.id}
            selections={selections}
            node={node}
            nLayers={layoutGraph.layers.length}
            nodeWidth={nodeWidth}
          />
        ))}
      </g>
    </>
  );
};

export default DashSankeyImpl;
