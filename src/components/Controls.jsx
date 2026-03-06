import { memo } from 'react';

const SliderControl = ({ label, min, max, step, value, onChange }) => (
  <div className="flex flex-col gap-1">
    <label className="text-xs text-gray-300 flex justify-between">
      <span>{label}</span>
      <span className="text-yellow-400 font-mono">{typeof value === 'number' && value % 1 !== 0 ? value.toFixed(1) : value}</span>
    </label>
    <input
      type="range"
      min={min} max={max} step={step || 1}
      value={value}
      onChange={e => onChange(step && step < 1 ? parseFloat(e.target.value) : parseInt(e.target.value))}
      className="w-full accent-yellow-500"
    />
  </div>
);

function Controls({ params, setParam, view, setView }) {
  return (
    <div className="flex flex-col gap-3 p-3 text-sm">
      <div className="flex gap-2 items-center">
        <label className="text-xs text-gray-300">View:</label>
        <select
          value={view}
          onChange={e => setView(e.target.value)}
          className="bg-gray-700 text-white text-xs rounded px-2 py-1 flex-1"
        >
          <option value="3d">3D Orbital</option>
          <option value="map">Map Projection</option>
          <option value="ellipse">2D Elliptical</option>
        </select>
      </div>

      <div className="border-t border-gray-700 pt-2 text-xs text-gray-500 uppercase tracking-wide">Orbit Sampling</div>
      <SliderControl label="Time increment (min)" min={1} max={15} value={params.timeInc} onChange={v => setParam('timeInc', v)} />
      <SliderControl label="# of orbits" min={1} max={100} value={params.numOrbits} onChange={v => setParam('numOrbits', v)} />

      <div className="border-t border-gray-700 pt-2 text-xs text-gray-500 uppercase tracking-wide">Orbit Geometry</div>
      <SliderControl label="Ascending Node (deg)" min={-180} max={180} value={params.OmegaDeg} onChange={v => setParam('OmegaDeg', v)} />
      <SliderControl label="Periapsis (deg)" min={0} max={360} value={params.omegaDeg} onChange={v => setParam('omegaDeg', v)} />

      <div className="border-t border-gray-700 pt-2 text-xs text-gray-500 uppercase tracking-wide">Delta-V Burns</div>
      <SliderControl label="dV Incline (m/s)" min={0} max={2300} step={10} value={params.dVi} onChange={v => setParam('dVi', v)} />
      <SliderControl label="dV Apoapsis (m/s)" min={0} max={1000} step={10} value={params.dVa} onChange={v => setParam('dVa', v)} />
      <SliderControl label="dV Periapsis (m/s)" min={0} max={1000} step={10} value={params.dVp} onChange={v => setParam('dVp', v)} />

      <div className="border-t border-gray-700 pt-2 text-xs text-gray-500 uppercase tracking-wide">Camera & Satellite</div>
      <SliderControl label="Aperture angle (deg)" min={0.1} max={30} step={0.1} value={params.apertureDeg} onChange={v => setParam('apertureDeg', v)} />
      <SliderControl label="Initial facing angle (deg)" min={-180} max={180} value={params.facingAngleDeg} onChange={v => setParam('facingAngleDeg', v)} />
      <SliderControl label="Sat rot speed (rot/hr)" min={-720} max={720} step={0.1} value={params.satRotPerHr} onChange={v => setParam('satRotPerHr', v)} />
      <SliderControl label="Test satellite time (min)" min={0} max={50000} value={params.satTime} onChange={v => setParam('satTime', v)} />
    </div>
  );
}

export default memo(Controls);
