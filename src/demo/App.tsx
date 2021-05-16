import React from 'react';
import { DashSankey } from '../lib';

const App: React.FC = () => {
  // const [state, setState] = useState({ value: '' });
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
          ids: [4, 5],
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
      <DashSankey levels={levels} />
    </div>
  );
};

export default App;
