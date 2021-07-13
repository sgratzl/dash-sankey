/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { classNames, OverlapHelper } from '../../utils';
import type { SankeySelections } from './hooks';
import type { SankeyID, SankeyInternalLink, SankeyInternalNode } from './model';
import { pathGen } from './renderUtils';

const SankeyLink: FC<{
  link: SankeyInternalLink;
  lineOffset: number;
  selections: SankeySelections;
}> = ({ link, lineOffset, selections }) => {
  const overlap = selections.overlap.intersect(link.overlap);
  const total = link.overlap.size;
  let selectionShift = 0;
  let prevOverlap: OverlapHelper<SankeyID> | null = null;
  const shiftSelections = selections.others.length < 3;
  return (
    <g
      key={link.id}
      data-type="link"
      data-id={link.id}
      onClick={selections.onClick}
      onMouseEnter={selections.onMouseEnter}
      onMouseLeave={selections.onMouseLeave}
    >
      <path
        d={pathGen(link, lineOffset, 1)}
        className={classNames('dash-sankey-link', selections.isSelected('link', link.id) && 'dash-sankey-link__picked')}
      />
      <title>
        {link.name}: {link.value.toLocaleString()}
      </title>
      {selections.others.map((s) => {
        if (prevOverlap != null && !prevOverlap.isEmpty && shiftSelections) {
          selectionShift += prevOverlap.without(s.overlap).size;
        }
        const o = s.overlap.intersect(link.overlap);
        prevOverlap = o;
        if (
          o.isEmpty ||
          (!s.matchLayer((link.source as SankeyInternalNode).layer ?? 0) &&
            !s.matchLayer((link.target as SankeyInternalNode).layer ?? 0))
        ) {
          return null;
        }
        return (
          <path
            key={s.color}
            d={pathGen(link, lineOffset, o.size / total, selectionShift / link.overlap.size)}
            className="dash-sankey-link dash-sankey-selection"
            style={{ fill: s.color }}
          />
        );
      })}
      {overlap.isNotEmpty && (
        <path
          d={pathGen(link, lineOffset, overlap.size / link.overlap.size)}
          className="dash-sankey-link dash-sankey-link__selected"
        />
      )}
    </g>
  );
};

export default SankeyLink;
