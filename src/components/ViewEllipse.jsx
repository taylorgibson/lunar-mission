import { memo, useRef, useEffect } from 'react';
import { R_MOON, CD_MIN } from '../lib/constants.js';
import { solveKepler } from '../lib/orbit.js';

function ViewEllipse({ oparams, params, timestamps }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!oparams) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    ctx.clearRect(0, 0, W, H);

    const { a, ecc, T } = oparams;
    const rp = a * (1 - ecc);
    const ra = a * (1 + ecc);

    // Scale to fit canvas
    const maxR = Math.max(ra, a * Math.sqrt(1 - ecc * ecc)) * 1.2;
    const scale = Math.min(W, H) / (2 * maxR);
    const cx = W / 2;
    const cy = H / 2;

    const toCanvas = (x, y) => [cx + x * scale, cy - y * scale];

    // Draw ellipse orbit path
    ctx.strokeStyle = 'orange';
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let i = 0; i <= 360; i++) {
      const E = (i * Math.PI) / 180;
      const x = a * (Math.cos(E) - ecc);
      const y = a * Math.sqrt(1 - ecc * ecc) * Math.sin(E);
      const [px, py] = toCanvas(x, y);
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Draw Moon
    ctx.fillStyle = '#555';
    ctx.beginPath();
    ctx.arc(cx, cy, R_MOON * scale, 0, 2 * Math.PI);
    ctx.fill();

    // Reference disk at origin
    const refR = CD_MIN * 1000 * scale;
    ctx.strokeStyle = 'purple';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, refR, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fillStyle = 'white';
    ctx.font = '10px monospace';
    ctx.fillText(`${CD_MIN} km diameter`, cx + refR + 5, cy + 3);

    // Camera parameters
    const theta0 = params.facingAngleDeg * Math.PI / 180;
    const thetaDot = (params.satRotPerHr * 360 / 3600) * Math.PI / 180; // rad/s
    const aperture = params.apertureDeg * Math.PI / 180;

    // Snapshot positions
    const inputTimes = [0, ...timestamps, params.satTime];
    const diskSize = a * scale / 10;
    const angleDiffList = [];
    const timedAngles = [];

    for (let tidx = 0; tidx < inputTimes.length; tidx++) {
      const tSec = inputTimes[tidx] * 60;
      const M = (2 * Math.PI * tSec) / T;
      const E = solveKepler(M, ecc);

      const xOrb = a * (Math.cos(E) - ecc);
      const yOrb = a * Math.sqrt(1 - ecc * ecc) * Math.sin(E);
      const [px, py] = toCanvas(xOrb, yOrb);
      const pvec = [xOrb, yOrb];
      const pMag = Math.sqrt(pvec[0]*pvec[0] + pvec[1]*pvec[1]);
      const unitP = [pvec[0]/pMag, pvec[1]/pMag];

      // Marker
      if (tidx === 0) {
        drawCross(ctx, px, py, 8, 'lime');
      } else if (tidx === inputTimes.length - 1) {
        ctx.fillStyle = 'lime';
        ctx.beginPath(); ctx.arc(px, py, 8, 0, 2*Math.PI); ctx.fill();
        ctx.fillStyle = 'yellow';
        ctx.beginPath(); ctx.arc(px, py, 5, 0, 2*Math.PI); ctx.fill();
      } else {
        drawCross(ctx, px, py, 6, 'lime');
      }

      // Time label
      ctx.fillStyle = 'white';
      ctx.font = '9px monospace';
      ctx.fillText(`${inputTimes[tidx]}m`, px + 3, py - 8);

      // Facing vector
      const facingAngle = thetaDot * tSec + theta0;
      const satVec = [Math.cos(facingAngle), Math.sin(facingAngle)];

      // Angle diff (signed)
      const det = unitP[0]*satVec[1] - unitP[1]*satVec[0];
      const dot = unitP[0]*satVec[0] + unitP[1]*satVec[1];
      const angleDiff = Math.atan2(det, dot) * 180 / Math.PI;
      angleDiffList.push(angleDiff);
      timedAngles.push({ time: inputTimes[tidx], angle: angleDiff });

      // Green/red disk
      const dcolor = Math.abs(angleDiff) <= 60 ? 'rgba(0,200,0,0.3)' : 'rgba(200,0,0,0.3)';
      ctx.fillStyle = dcolor;
      ctx.beginPath();
      ctx.arc(px, py, diskSize, 0, 2 * Math.PI);
      ctx.fill();

      // Blue facing arrow (camera direction)
      // satVec points in facing direction; draw arrow from satellite outward
      // Negate and flip y for canvas coords (canvas y is inverted)
      const arrowLen = diskSize;
      const arrowDx = -satVec[0] * arrowLen;
      const arrowDy = satVec[1] * arrowLen; // flip y for canvas
      ctx.strokeStyle = 'blue';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(px + arrowDx, py + arrowDy);
      ctx.stroke();
      // Arrowhead
      const headLen = arrowLen * 0.3;
      const arrowAngle = Math.atan2(arrowDy, arrowDx);
      ctx.beginPath();
      ctx.moveTo(px + arrowDx, py + arrowDy);
      ctx.lineTo(px + arrowDx - headLen * Math.cos(arrowAngle - 0.4), py + arrowDy - headLen * Math.sin(arrowAngle - 0.4));
      ctx.moveTo(px + arrowDx, py + arrowDy);
      ctx.lineTo(px + arrowDx - headLen * Math.cos(arrowAngle + 0.4), py + arrowDy - headLen * Math.sin(arrowAngle + 0.4));
      ctx.stroke();

      // Black arrow to moon surface (nadir)
      const surfX = cx + R_MOON * unitP[0] * scale;
      const surfY = cy - R_MOON * unitP[1] * scale;
      ctx.strokeStyle = 'rgba(0,0,0,0.4)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(surfX, surfY);
      ctx.stroke();

      // Aperture footprint on surface
      const surfDist = pMag - R_MOON;
      const photoDiam = aperture * surfDist;
      const photoR = photoDiam * scale;
      ctx.fillStyle = 'rgba(128,0,255,0.4)';
      ctx.beginPath();
      ctx.arc(surfX, surfY, photoR, 0, 2 * Math.PI);
      ctx.fill();

      // Reference crater circle at surface
      ctx.strokeStyle = 'purple';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(surfX, surfY, CD_MIN * 1000 * scale, 0, 2 * Math.PI);
      ctx.stroke();
    }

    // Total camera rotations
    timedAngles.sort((a, b) => a.time - b.time);
    const sortedAngles = timedAngles.map(ta => ta.angle);
    let shiftSum = 0;
    for (let i = 1; i < sortedAngles.length; i++) {
      let shift = sortedAngles[i] - sortedAngles[i - 1];
      if (Math.abs(shift) > 180) shift -= Math.sign(shift) * 360;
      shiftSum += Math.abs(shift);
    }
    const totalRotations = shiftSum / 360;

    ctx.fillStyle = 'white';
    ctx.font = 'bold 12px sans-serif';
    ctx.fillText(`Total Camera Rotations = ${totalRotations.toFixed(2)}`, 10, 20);

  }, [oparams, params, timestamps]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-900 p-2">
      <canvas ref={canvasRef} width={800} height={800} className="max-w-full max-h-full" />
    </div>
  );
}

function drawCross(ctx, x, y, size, color) {
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - size, y); ctx.lineTo(x + size, y);
  ctx.moveTo(x, y - size); ctx.lineTo(x, y + size);
  ctx.stroke();
}

export default memo(ViewEllipse);
