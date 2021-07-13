/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { classNames, OverlapHelper } from '../../utils';
import type { SankeyID, SankeyInternalNode } from './model';
import type { SankeySelections } from './hooks';

const SankeyNode: FC<{
  node: SankeyInternalNode;
  selections: SankeySelections;
  nodeWidth: number;
  nLayers: number;
}> = ({ node, selections, nodeWidth, nLayers }) => {
  const overlap = selections.overlap.intersect(node.overlap);
  const nodeHeight = node.y1! - node.y0!;
  const isLastLayer = node.layer! >= nLayers - 1;
  const total = node.overlap.size;
  let selectionShift = 0;
  let prevOverlap: OverlapHelper<SankeyID> | null = null;
  const shiftSelections = selections.others.length < 3;
  return (
    <g
      key={node.id}
      data-type="node"
      data-id={node.id}
      transform={`translate(${node.x0!},${node.y0!})`}
      onClick={selections.onClick}
      onMouseEnter={selections.onMouseEnter}
      onMouseLeave={selections.onMouseLeave}
    >
      <rect
        width={nodeWidth}
        height={nodeHeight}
        className={classNames('dash-sankey-node', selections.isSelected('node', node.id) && 'dash-sankey-node__picked')}
      />
      {selections.others.map((s) => {
        if (prevOverlap != null && !prevOverlap.isEmpty && shiftSelections) {
          selectionShift += prevOverlap.without(s.overlap).size;
        }
        const o = s.overlap.intersect(node.overlap);
        prevOverlap = o;
        if (o.isEmpty || !s.matchLayer(node.layer ?? 0)) {
          return null;
        }
        return (
          <rect
            key={s.color}
            y={nodeHeight * (selectionShift / total)}
            width={nodeWidth}
            height={nodeHeight * (o.size / total)}
            className="dash-sankey-node dash-sankey-selection"
            style={{ fill: s.color }}
          />
        );
      })}
      {overlap.isNotEmpty && (
        <rect
          width={nodeWidth}
          height={nodeHeight * (overlap.size / total)}
          className="dash-sankey-node dash-sankey-node__selected"
        />
      )}
      <text
        x={!isLastLayer ? nodeWidth : 0}
        y={nodeHeight / 2}
        dx={!isLastLayer ? 2 : -2}
        className={classNames('dash-sankey-node-name', isLastLayer && 'dash-sankey-node-name__last')}
      >
        {node.name}
      </text>
      <title>
        {node.name}: {node.value!.toLocaleString()}
      </title>
    </g>
  );
};

export default SankeyNode;
