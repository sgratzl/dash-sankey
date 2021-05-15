import React, { useState } from 'react';
import { DashSankey } from '../lib';

export default function App() {
    const [state, setState] = useState({ value: '' });
    return <div>
        <DashSankey
            label="Test"
            setProps={setState}
            {...state}
        />
    </div>;
}

