/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { classNames } from '../../utils';
import type { SankeyInternalNode } from './model';
import type { SankeySelections } from './hooks';

const SankeyNode: FC<{
  node: SankeyInternalNode;
  selections: SankeySelections;
  nodeWidth: number;
  maxDepth: number;
}> = ({ node, selections, nodeWidth, maxDepth }) => {
  const overlap = selections.overlap.intersect(node.overlap);
  const nodeHeight = node.y1! - node.y0!;
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
        className={classNames('dash-sankey-node-name', node.depth! >= maxDepth && 'dash-sankey-node-name__last')}
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
