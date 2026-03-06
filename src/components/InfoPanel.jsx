import { memo, useMemo } from 'react';
import { R_MOON } from '../lib/constants.js';

function InfoPanel({ oparams, params, craters, timestamps }) {
  const text = useMemo(() => {
    if (!oparams) return '';
    const { a, ecc, i_deg, T, Rp, Ra } = oparams;
    const perilune = ((1 - ecc) * a - R_MOON) / 1000;
    const apolune = ((1 + ecc) * a - R_MOON) / 1000;
    const dVtot = params.dVi + params.dVa + params.dVp;

    let msg = `Orbital Parameters:\n`;
    msg += `Semi-major axis: ${(a/1000).toFixed(0)} km\n`;
    msg += `Eccentricity: ${ecc.toFixed(3)}\n`;
    msg += `Inclination: ${i_deg.toFixed(3)} deg\n`;
    msg += `Period: ${T.toFixed(0)} s = ${(T/60).toFixed(2)} min = ${(T/3600).toFixed(3)} hr\n`;
    msg += `Perilune: ${perilune.toFixed(0)} km | Apolune: ${apolune.toFixed(0)} km\n`;
    msg += `Total dV: ${dVtot.toFixed(2)} m/s\n\n`;

    msg += `# Initialization code\n`;
    msg += `Paramslist = [${params.timeInc}, ${params.numOrbits}, ${params.OmegaDeg}, ${params.omegaDeg}, ${params.dVi}, ${params.dVa}, ${params.dVp}, ${params.satTime}, ${params.facingAngleDeg}, ${params.satRotPerHr.toFixed(2)}, ${params.apertureDeg}]\n`;
    msg += `TSlist = [${timestamps.join(', ')}]\n`;
    msg += `cd_min = 100\nuseTSlist = True\n`;

    return msg;
  }, [oparams, params, timestamps]);

  return (
    <div className="p-3">
      <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Info / Export</div>
      <textarea
        readOnly
        value={text}
        className="w-full h-40 bg-gray-800 text-gray-300 text-xs font-mono p-2 rounded border border-gray-700 resize-y"
        onClick={e => e.target.select()}
      />
    </div>
  );
}

export default memo(InfoPanel);
