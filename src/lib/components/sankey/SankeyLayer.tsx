/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { classNames } from '../../utils';
import type { SankeyInternalLayer } from './model';
import type { SankeySelections } from './renderUtils';

const SankeyLayer: FC<{
  i: number;
  layer: SankeyInternalLayer;
  maxLayerY1: number;
  nodeWidth: number;
  nLayers: number;
  selections: SankeySelections;
  lineOffset: number;
}> = ({ layer, i, lineOffset, maxLayerY1, nLayers, nodeWidth, selections }) => {
  const layerHeight = maxLayerY1 - layer.y0;
  let x = i > 0 ? nodeWidth / 2 : 0;
  if (i === nLayers - 1) {
    x = nodeWidth;
  }
  return (
    <g
      key={layer.id}
      transform={`translate(${layer.x0 ?? 0},${layer.y0 ?? 0})`}
      onClick={selections.select('layer', layer.id, layer.overlap)}
      className={classNames(selections.isSelected('layer', layer.id) && 'dash-sankey-layer__picked')}
    >
      <text
        x={x}
        y={layerHeight}
        dy={lineOffset + 2}
        className={classNames(
          'dash-sankey-layer-name',
          i === 0 && 'dash-sankey-layer-name__first',
          i === nLayers - 1 && 'dash-sankey-layer-name__last'
        )}
      >
        {layer.name}
      </text>
      <title>
        {layer.name}: {layer.overlap.length.toLocaleString()}
      </title>
    </g>
  );
};

export default SankeyLayer;
