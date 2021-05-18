import { useCallback, useMemo } from 'react';
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
  SankeyLevel,
  SankeySelection,
} from './model';
import type { SankeySelections } from './renderUtils';

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
export function useSankeyLayout({
  levels,
  height = 300,
  padding = DEFAULT_PADDING,
  iterations = 6,
  nodeAlign = 'justify',
  nodePadding = 8,
  nodeWidth = 24,
  nodeSort = 'auto',
}: SankeyLayoutOptions & { levels: SankeyLevel[] }) {
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
    if (levels.length === 0) {
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
      layers: extractLayers(g.nodes, levels),
    };
  }, [graph, sankeyGen, levels]);

  const maxDepth = layoutGraph.nodes.reduce((acc, v) => Math.max(acc, v.depth ?? 0), 0);
  const maxLayerY1 = layoutGraph.layers.reduce((acc, v) => Math.max(acc, v.y1), 0);

  return { ref, layoutGraph, width, height, maxDepth, maxLayerY1, nodeWidth };
}

const EMPTY_ARR: { color: string; ids: readonly SankeyID[] }[] = [];

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useSelections({
  selection,
  selections = EMPTY_ARR,
  setProps = noop,
}: {
  selection?: SankeySelection | readonly SankeyID[];
  selections?: { color: string; ids: readonly SankeyID[] }[];
  setProps?(props: { selection?: SankeySelection | readonly SankeyID[] }): void;
}) {
  const selectionOverlap = useMemo(
    () => new OverlapHelper(isArray(selection) ? selection : selection?.ids ?? []),
    [selection]
  );
  const selectionsOverlaps = useMemo(
    () => (selections ?? []).map((s) => ({ ...s, overlap: new OverlapHelper(s.ids) })),
    [selections]
  );

  const select = useCallback(
    (type: SankeySelection['type'], selectionId: string, ids: readonly SankeyID[] | OverlapHelper<SankeyID>) => {
      return (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const s: SankeySelection = {
          id: selectionId,
          type,
          ids: ids instanceof OverlapHelper ? ids.elems : ids,
        };
        setProps({ selection: s });
      };
    },
    [setProps]
  );

  const resetSelection = useCallback(() => {
    setProps({ selection: [] });
  }, [setProps]);

  const selectionContext: SankeySelections = useMemo(
    () => ({
      isSelected: (type, sId) => isSelected(selection, type, sId),
      others: selectionsOverlaps,
      overlap: selectionOverlap,
      select,
    }),
    [select, selectionOverlap, selectionsOverlaps, selection]
  );

  return { selections: selectionContext, resetSelection };
}
