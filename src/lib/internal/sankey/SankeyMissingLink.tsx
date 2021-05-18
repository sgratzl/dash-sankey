/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { classNames } from '../../utils';
import type { SankeySelections } from './hooks';
import type { SankeyInternalNode } from './model';
import { missingPath } from './renderUtils';

const SankeyMissingLink: FC<{
  node: SankeyInternalNode;
  maxDepth: number;
  selections: SankeySelections;
  lineOffset: number;
}> = ({ node, maxDepth, selections, lineOffset }) => {
  if (node.missing.isEmpty || node.depth! >= maxDepth) {
    return null;
  }
  const overlap = selections.overlap.intersect(node.missing);
  return (
    <g
      key={node.id}
      data-type="missing"
      data-id={node.id}
      onClick={selections.onClick}
      onMouseEnter={selections.onMouseEnter}
      onMouseLeave={selections.onMouseLeave}
    >
      <path
        d={missingPath(node, lineOffset, 1)}
        className={classNames(
          'dash-sankey-link dash-sankey-link__missing',
          selections.isSelected('missing', node.id) && 'dash-sankey-link__picked'
        )}
      />
      <title>
        {node.name} → ?: {node.missing.length.toLocaleString()}
      </title>
      {selections.others.map((s) => {
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
};

export default SankeyMissingLink;
