import React, { useMemo, useState } from 'react';
import {
  DashChangeAbleSankeyProps,
  DashSankey,
  // SankeyNode,
  SankeyLayer,
  // SankeyLink,
  // FacettedSankey,
  // FacettedSankeyChangeAbleProps,
} from '../lib';

const App: React.FC = () => {
  const [state, setState] = useState<DashChangeAbleSankeyProps>({ selection: undefined as string[] | undefined });
  // const [fState, setFState] = useState<FacettedSankeyChangeAbleProps>({ selection: undefined as string[] | undefined });
  const levels: SankeyLayer[] = [
    {
      name: 'A',
      nodes: [
        {
          id: 'A1',
          name: 'A1',
          ids: [1, 2, 3],
        },
        {
          id: 'A2',
          name: 'A2',
          ids: [4, 5, 6],
        },
      ],
    },
    {
      name: 'B',
      nodes: [
        {
          id: 'B1',
          name: 'B1',
          ids: [1, 2],
        },
        {
          id: 'B2',
          name: 'B2',
          ids: [3, 4, 5],
        },
      ],
    },
  ];
  // const nodes: SankeyNode[] = [
  //   {
  //     id: 'A1',
  //     name: 'A1',
  //     ids: [1, 2, 3],
  //     layer: 0,
  //   },
  //   {
  //     id: 'A2',
  //     name: 'A2',
  //     ids: [4, 5, 6, 10],
  //     layer: 0,
  //   },
  //   {
  //     id: 'B1',
  //     name: 'B1',
  //     ids: [1, 2],
  //     layer: 1,
  //   },
  //   {
  //     id: 'B2',
  //     name: 'B2',
  //     ids: [3, 4, 5],
  //     layer: 1,
  //   },
  //   {
  //     id: 'C1',
  //     name: 'C1',
  //     ids: [1, 2],
  //     layer: 2,
  //   },
  //   {
  //     id: 'C2',
  //     name: 'C2',
  //     ids: [9, 10],
  //     layer: 2,
  //   },
  // ];
  // const links: SankeyLink[] = [
  //   {
  //     source: 'A1',
  //     target: 'B1',
  //   },
  //   {
  //     source: 'A1',
  //     target: 'B2',
  //   },
  //   {
  //     source: 'A2',
  //     target: 'B1',
  //   },
  //   {
  //     source: 'A2',
  //     target: 'B2',
  //   },
  //   {
  //     source: 'B1',
  //     target: 'C1',
  //   },
  //   {
  //     source: 'A2',
  //     target: 'C2',
  //   },
  // ];
  const selections = useMemo(
    () => [
      {
        color: 'red',
        ids: [4, 5, 6],
      },
      {
        color: 'blue',
        ids: [1, 2, 4],
        layers: ['A'],
      },
    ],
    []
  );
  return (
    <div>
      <DashSankey layers={levels} setProps={setState} selection={state.selection} selections={selections} />
      {/* <DashSankey
        nodes={nodes}
        links={links}
        setProps={setState}
        selection={state.selection}
        nodeAlign="layer"
        selections={selections}
      />
      <FacettedSankey
        facets={[
          { name: 'A', layers: levels },
          { name: 'B', layers: levels },
        ]}
        setProps={setFState}
        selection={fState.selection}
        nodeAlign="layer"
        selections={selections}
      /> */}
    </div>
  );
};

export default App;
