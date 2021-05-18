/* eslint-disable react/prop-types */
import React, { FC } from 'react';
import { classNames } from '../../utils';
import type { SankeySelections } from './hooks';
import type { SankeyInternalLink } from './model';
import { pathGen } from './renderUtils';

const SankeyLink: FC<{
  link: SankeyInternalLink;
  lineOffset: number;
  selections: SankeySelections;
}> = ({ link, lineOffset, selections }) => {
  const overlap = selections.overlap.intersect(link.overlap);
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
        const o = s.overlap.intersect(link.overlap);
        if (o.isEmpty) {
          return null;
        }
        return (
          <path
            key={s.color}
            d={pathGen(link, lineOffset, o.size / link.overlap.size)}
            className="dash-sankey-link"
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
