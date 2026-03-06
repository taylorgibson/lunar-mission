import { useState, useEffect, useMemo, useCallback } from 'react';
import Controls from './components/Controls.jsx';
import CraterTimeline from './components/CraterTimeline.jsx';
import InfoPanel from './components/InfoPanel.jsx';
import View3D from './components/View3D.jsx';
import ViewMap from './components/ViewMap.jsx';
import ViewEllipse from './components/ViewEllipse.jsx';
import { DEFAULT_PARAMS, DEFAULT_TIMESTAMPS } from './lib/constants.js';
import { computeOrbitParams } from './lib/orbit.js';
import { loadCraters } from './lib/craterLoader.js';

export default function App() {
  const [params, setParams] = useState(DEFAULT_PARAMS);
  const [view, setView] = useState('3d');
  const [craters, setCraters] = useState([]);
  const [timestamps, setTimestamps] = useState([...DEFAULT_TIMESTAMPS]);

  useEffect(() => {
    loadCraters().then(setCraters);
  }, []);

  const setParam = useCallback((key, value) => {
    setParams(p => ({ ...p, [key]: value }));
  }, []);

  const setTimestamp = useCallback((index, value) => {
    setTimestamps(ts => {
      const next = [...ts];
      next[index] = value;
      return next;
    });
  }, []);

  const oparams = useMemo(() => {
    return computeOrbitParams(params.dVi, params.dVa, params.dVp, params.OmegaDeg, params.omegaDeg);
  }, [params.dVi, params.dVa, params.dVp, params.OmegaDeg, params.omegaDeg]);

  return (
    <div className="flex h-screen bg-gray-900 text-white overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 flex-shrink-0 bg-gray-800 overflow-y-auto border-r border-gray-700">
        <div className="p-3 border-b border-gray-700">
          <h1 className="text-lg font-bold text-yellow-400">Lunar Mission Control</h1>
        </div>
        <Controls params={params} setParam={setParam} view={view} setView={setView} />
        <div className="border-t border-gray-700" />
        <CraterTimeline
          craters={craters}
          timestamps={timestamps}
          setTimestamp={setTimestamp}
          satTime={params.satTime}
        />
        <div className="border-t border-gray-700" />
        <InfoPanel oparams={oparams} params={params} craters={craters} timestamps={timestamps} />
      </div>

      {/* Main View */}
      <div className="flex-1 min-w-0">
        {view === '3d' && <View3D oparams={oparams} params={params} />}
        {view === 'map' && <ViewMap oparams={oparams} params={params} craters={craters} timestamps={timestamps} />}
        {view === 'ellipse' && <ViewEllipse oparams={oparams} params={params} timestamps={timestamps} />}
      </div>
    </div>
  );
}
