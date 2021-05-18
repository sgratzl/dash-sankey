/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { classNames } from '../../utils';
import type { SankeySelections } from './hooks';
import type { SankeyInternalNode } from './model';
import { missingOutPath } from './renderUtils';

const SankeyMissingOutLink: FC<{
  node: SankeyInternalNode;
  maxDepth: number;
  selections: SankeySelections;
  lineOffset: number;
}> = ({ node, maxDepth, selections, lineOffset }) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (node.missingOut.isEmpty || node.depth! >= maxDepth) {
    return null;
  }
  const overlap = selections.overlap.intersect(node.missingOut);
  return (
    <g
      key={node.id}
      data-type="missing_out"
      data-id={node.id}
      onClick={selections.onClick}
      onMouseEnter={selections.onMouseEnter}
      onMouseLeave={selections.onMouseLeave}
    >
      <path
        d={missingOutPath(node, lineOffset, 1)}
        className={classNames(
          'dash-sankey-link dash-sankey-link__missing',
          selections.isSelected('missing_out', node.id) && 'dash-sankey-link__picked'
        )}
      />
      <title>
        {node.name} → ?: {node.missingOut.length.toLocaleString()}
      </title>
      {selections.others.map((s) => {
        const o = s.overlap.intersect(node.missingOut);
        if (o.isEmpty) {
          return null;
        }
        return (
          <path
            key={s.color}
            d={missingOutPath(node, lineOffset, o.size / node.missingOut.size)}
            className="dash-sankey-link dash-sankey-link__missing"
            style={{ fill: s.color }}
          />
        );
      })}
      {overlap.isNotEmpty && (
        <path
          d={missingOutPath(node, lineOffset, overlap.size / node.missingOut.size)}
          className="dash-sankey-link dash-sankey-link__missing dash-sankey-link__selected"
        />
      )}
    </g>
  );
};

export default SankeyMissingOutLink;
