import React, { useState } from 'react';
import { DashSankey } from '../lib';

const App: React.FC = () => {
  const [state, setState] = useState({ value: '' });
  return (
    <div>
      <DashSankey label="Test" setProps={setState} value={state.value} />
    </div>
  );
};

export default App;
