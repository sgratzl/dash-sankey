import React, { useState } from 'react';
import { DashChangeAbleSankeyProps, DashSankey } from '../lib';

const App: React.FC = () => {
  const [state, setState] = useState<DashChangeAbleSankeyProps>({ selection: undefined as string[] | undefined });
  const levels = [
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
  return (
    <div>
      <DashSankey levels={levels} setProps={setState} selection={state.selection} />
    </div>
  );
};

export default App;
