/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { classNames, OverlapHelper } from '../../utils';
import type { SankeySelections } from './hooks';
import type { SankeyID, SankeyInternalNode } from './model';
import { missingOutPath, toValue } from './renderUtils';

const SankeyMissingOutLink: FC<{
  node: SankeyInternalNode;
  nLayers: number;
  selections: SankeySelections;
  lineOffset: number;
  total?: number;
}> = ({ node, nLayers, selections, lineOffset, total: allIds }) => {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const isLastLayer = node.layer! >= nLayers - 1;
  if (node.missingOut.isEmpty || isLastLayer) {
    return null;
  }
  const overlap = selections.overlap.intersect(node.missingOut);
  const total = node.missingOut.size;
  let selectionShift = 0;
  let prevOverlap: OverlapHelper<SankeyID> | null = null;
  const shiftSelections = selections.others.length < 3;
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
        {node.name} → ?: {toValue(node.missingOut.length, allIds)}
      </title>
      {selections.others.map((s) => {
        if (prevOverlap != null && !prevOverlap.isEmpty && shiftSelections) {
          selectionShift += prevOverlap.without(s.overlap).size;
        }
        const o = s.overlap.intersect(node.missingOut);
        prevOverlap = o;
        if (o.isEmpty || !s.matchLayer(node.layer ?? 0)) {
          return null;
        }
        return (
          <path
            key={s.color}
            d={missingOutPath(node, lineOffset, o.size / total, selectionShift / total)}
            className="dash-sankey-link dash-sankey-link__missing dash-sankey-selection"
            style={{ fill: s.color }}
          />
        );
      })}
      {overlap.isNotEmpty && (
        <path
          d={missingOutPath(node, lineOffset, overlap.size / total)}
          className="dash-sankey-link dash-sankey-link__missing dash-sankey-link__selected"
        />
      )}
    </g>
  );
};

export default SankeyMissingOutLink;
