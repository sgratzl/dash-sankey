/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { classNames, OverlapHelper } from '../../utils';
import type { SankeySelections } from './hooks';
import type { SankeyID, SankeyInternalNode } from './model';
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
  const total = node.missingIn.size;
  let selectionShift = 0;
  let prevOverlap: OverlapHelper<SankeyID> | null = null;
  const shiftSelections = selections.others.length < 3;
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
        if (prevOverlap != null && !prevOverlap.isEmpty && shiftSelections) {
          selectionShift += prevOverlap.without(s.overlap).size;
        }
        const o = s.overlap.intersect(node.missingIn);
        prevOverlap = o;
        if (o.isEmpty || !s.matchLayer(node.layer ?? 0)) {
          return null;
        }
        return (
          <path
            key={s.color}
            d={missingInPath(node, lineOffset, o.size / total, selectionShift / total)}
            className="dash-sankey-link dash-sankey-link__missing"
            style={{ fill: s.color }}
          />
        );
      })}
      {overlap.isNotEmpty && (
        <path
          d={missingInPath(node, lineOffset, overlap.size / total, selectionShift / total)}
          className="dash-sankey-link dash-sankey-link__missing dash-sankey-link__selected"
        />
      )}
    </g>
  );
};

export default SankeyMissingInLink;
