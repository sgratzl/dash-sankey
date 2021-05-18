import React, { useCallback, useMemo, useState } from 'react';
import useResizeObserver from 'use-resize-observer';
import { sankey, sankeyCenter, sankeyJustify, sankeyLeft, sankeyRight } from 'd3-sankey';
import { deriveBox, IBox, isArray, noop, OverlapHelper } from '../../utils';
import {
  extractGraph,
  extractLayers,
  isSelected,
  SankeyID,
  SankeyInternalLink,
  SankeyInternalNode,
  SankeySelection,
} from './model';

const DEFAULT_PADDING: IBox = { left: 5, top: 5, right: 5, bottom: 20 };

export interface SankeyLayoutOptions {
  /**
   * @default 300
   */
  height?: number;
  /**
   * padding around SVG
   * @default ({left: 5, top: 5, right: 5, bottom: 20})
   */
  padding?: number | IBox;
  /**
   * sets the number of relaxation iterations when generating the layout and returns this Sankey generator.
   * @default 6
   */
  iterations?: number;
  /**
   * sets the node width to the specified number and returns this Sankey generator.
   * @default 24
   */
  nodeWidth?: number;
  /**
   *  sets the vertical separation between nodes at each column to the specified number and returns this Sankey generator.
   * @default 8
   */
  nodePadding?: number;
  /**
   * justify method
   * @default 'justify';
   */
  nodeAlign?: 'left' | 'right' | 'center' | 'justify';
  /**
   * node sort order
   * @default 'auto'
   */
  nodeSort?: 'auto' | 'fixed';
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useSankeyLayout(
  levels: Parameters<typeof extractGraph>[0],
  {
    height = 300,
    padding = DEFAULT_PADDING,
    iterations = 6,
    nodeAlign = 'justify',
    nodePadding = 8,
    nodeWidth = 24,
    nodeSort = 'auto',
  }: SankeyLayoutOptions
) {
  const p = useMemo(() => deriveBox(padding, DEFAULT_PADDING), [padding]);
  const { ref, width = p.left + p.right + 10 } = useResizeObserver<HTMLDivElement>();
  const sankeyGen = useMemo(() => {
    const s = sankey<SankeyInternalNode, SankeyInternalLink>();
    s.extent([
      [p.left, p.top],
      [width - p.left - p.right, height - p.top - p.bottom],
    ]);
    const alignmentsToFunction = {
      left: sankeyLeft,
      right: sankeyRight,
      center: sankeyCenter,
      justify: sankeyJustify,
    };
    s.nodeId((n) => n.id);
    s.iterations(iterations)
      .nodeAlign(alignmentsToFunction[nodeAlign])
      .nodeWidth(nodeWidth)
      .nodePadding(nodePadding)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .nodeSort(nodeSort === 'auto' ? undefined : (null as any));
    return s;
  }, [p, width, height, iterations, nodeAlign, nodeWidth, nodePadding, nodeSort]);

  const graph = useMemo(() => extractGraph(levels), [levels]);
  const layoutGraph = useMemo(() => {
    if (graph.nodes.length === 0) {
      return {
        nodes: [],
        links: [],
        layers: [],
      };
    }
    const g = sankeyGen({
      // work on copy since manipulated in place
      nodes: graph.nodes.map((d) => ({ ...d })),
      links: graph.links.map((d) => ({ ...d })),
    });
    return {
      nodes: g.nodes,
      links: g.links,
      layers: extractLayers(g.nodes, isArray(levels) ? levels : undefined),
    };
  }, [graph, sankeyGen, levels]);

  const maxDepth = layoutGraph.nodes.reduce((acc, v) => Math.max(acc, v.depth ?? 0), 0);
  const maxLayerY1 = layoutGraph.layers.reduce((acc, v) => Math.max(acc, v.y1), 0);

  return { ref, layoutGraph, graph, width, height, maxDepth, maxLayerY1, nodeWidth };
}

const EMPTY_ARR: { color: string; ids: readonly SankeyID[] }[] = [];

export interface SankeySelections {
  overlap: OverlapHelper<SankeyID>;
  isSelected(type: SankeySelection['type'], id: string): boolean;
  onClick(e: React.MouseEvent<HTMLElement | SVGElement>): void;
  onMouseEnter(e: React.MouseEvent<HTMLElement | SVGElement>): void;
  onMouseLeave(e: React.MouseEvent<HTMLElement | SVGElement>): void;
  others: { overlap: OverlapHelper<SankeyID>; color: string }[];
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useSelections(
  graph: ReturnType<typeof extractGraph>,
  {
    selection,
    selections = EMPTY_ARR,
    setProps = noop,
  }: {
    selection?: SankeySelection | readonly SankeyID[];
    selections?: { color: string; ids: readonly SankeyID[] }[];
    setProps?(props: { selection?: SankeySelection | readonly SankeyID[] }): void;
  }
) {
  const selectionsOverlaps = useMemo(
    () => (selections ?? []).map((s) => ({ ...s, overlap: new OverlapHelper(s.ids) })),
    [selections]
  );

  const resetSelection = useCallback(() => {
    setProps({ selection: [] });
  }, [setProps]);

  const selectionOverlap = useMemo(
    () => new OverlapHelper(isArray(selection) ? selection : selection?.ids ?? []),
    [selection]
  );

  const onClick = useCallback(
    (e: React.MouseEvent<HTMLElement | SVGElement>) => {
      e.preventDefault();
      e.stopPropagation();
      const id = e.currentTarget.dataset.id ?? '';
      const type = (e.currentTarget.dataset.type ?? 'node') as SankeySelection['type'];
      const overlap = graph.getOverlap(type, id);
      setProps({ selection: { id, type, ids: overlap.elems } });
    },
    [graph, setProps]
  );
  const [hoveredSelection, setHoveredSelection] =
    useState<{ id: string; type: string; overlap: OverlapHelper<SankeyID> } | null>(null);

  const onMouseEnter = useCallback(
    (e: React.MouseEvent<HTMLElement | SVGElement>) => {
      const id = e.currentTarget.dataset.id ?? '';
      const type = (e.currentTarget.dataset.type ?? 'node') as SankeySelection['type'];
      const overlap = graph.getOverlap(type, id);
      setHoveredSelection({ id, type, overlap });
    },
    [setHoveredSelection, graph]
  );
  const onMouseLeave = useCallback(() => {
    setHoveredSelection(null);
  }, [setHoveredSelection]);

  const selectionContext: SankeySelections = useMemo(
    () => ({
      isSelected: (type, sId) =>
        hoveredSelection
          ? hoveredSelection.id === sId && hoveredSelection.type == type
          : isSelected(selection, type, sId),
      others: selectionsOverlaps,
      overlap: hoveredSelection?.overlap ?? selectionOverlap,
      onClick,
      onMouseEnter,
      onMouseLeave,
    }),
    [onClick, onMouseEnter, onMouseLeave, hoveredSelection, selectionOverlap, selectionsOverlaps, selection]
  );

  return { selections: selectionContext, resetSelection };
}
