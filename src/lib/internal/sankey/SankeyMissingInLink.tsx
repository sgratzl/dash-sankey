/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { classNames } from '../../utils';
import type { SankeySelections } from './hooks';
import type { SankeyInternalNode } from './model';
import { missingInPath } from './renderUtils';

const SankeyMissingInLink: FC<{
  node: SankeyInternalNode;
  selections: SankeySelections;
  lineOffset: number;
}> = ({ node, selections, lineOffset }) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (node.missingIn.isEmpty || node.layer! <= 0) {
    return null;
  }
  const overlap = selections.overlap.intersect(node.missingIn);
  return (
    <g
      key={node.id}
      data-type="missing_in"
      data-id={node.id}
      onClick={selections.onClick}
      onMouseEnter={selections.onMouseEnter}
      onMouseLeave={selections.onMouseLeave}
    >
      <path
        d={missingInPath(node, lineOffset, 1)}
        className={classNames(
          'dash-sankey-link dash-sankey-link__missing',
          selections.isSelected('missing_in', node.id) && 'dash-sankey-link__picked'
        )}
      />
      <title>
        ? → {node.name}: {node.missingIn.length.toLocaleString()}
      </title>
      {selections.others.map((s) => {
        const o = s.overlap.intersect(node.missingIn);
        if (o.isEmpty) {
          return null;
        }
        return (
          <path
            key={s.color}
            d={missingInPath(node, lineOffset, o.size / node.missingIn.size)}
            className="dash-sankey-link dash-sankey-link__missing"
            style={{ fill: s.color }}
          />
        );
      })}
      {overlap.isNotEmpty && (
        <path
          d={missingInPath(node, lineOffset, overlap.size / node.missingIn.size)}
          className="dash-sankey-link dash-sankey-link__missing dash-sankey-link__selected"
        />
      )}
    </g>
  );
};

export default SankeyMissingInLink;
