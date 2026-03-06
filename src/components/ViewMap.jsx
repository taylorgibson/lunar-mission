import { memo, useRef, useEffect, useState } from 'react';
import { R_MOON, ROT_T_MOON } from '../lib/constants.js';
import { orbitPoint } from '../lib/orbit.js';
import { pxmap, haversine } from '../lib/projection.js';

function ViewMap({ oparams, params, craters, timestamps }) {
  const canvasRef = useRef(null);
  const [moonImg, setMoonImg] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setMoonImg(img);
    img.src = '/moon_texture.png';
  }, []);

  useEffect(() => {
    if (!moonImg || !oparams || !craters) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(moonImg, 0, 0, W, H);

    // Equator line
    ctx.strokeStyle = 'yellow';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, H / 2);
    ctx.lineTo(W, H / 2);
    ctx.stroke();

    // Draw orbit ground tracks
    const steps = Math.floor(oparams.T / (60 * params.timeInc));

    for (const orbFlag of [0, 1]) {
      const lats = [], lons = [];
      for (let i = 0; i <= steps; i++) {
        const t = (i / steps) * oparams.T;
        const tPlus = orbFlag * params.numOrbits * oparams.T + t;
        const op = orbitPoint(oparams, ROT_T_MOON, tPlus);
        lats.push(op.lat);
        lons.push(op.lon);
      }

      ctx.strokeStyle = orbFlag === 0 ? 'orange' : '#965c0b';
      ctx.lineWidth = 2;

      // Draw with wrap-around handling
      ctx.beginPath();
      let started = false;
      for (let i = 0; i < lons.length; i++) {
        const [px, py] = pxmap(W, H, lats[i], lons[i]);
        if (i > 0 && Math.abs(lons[i] - lons[i - 1]) > Math.PI) {
          ctx.stroke();
          ctx.beginPath();
          started = false;
        }
        if (!started) { ctx.moveTo(px, py); started = true; }
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Snapshot positions & deviation calculation
    const inputTimes = [0, ...timestamps, params.satTime];
    const opList = [];

    for (let tidx = 0; tidx < inputTimes.length; tidx++) {
      const t = inputTimes[tidx] * 60;
      const op = orbitPoint(oparams, ROT_T_MOON, t);
      const [px, py] = pxmap(W, H, op.lat, op.lon);

      if (tidx === 0) {
        // Launch point
        drawCross(ctx, px, py, 8, 'lime');
      } else if (tidx === inputTimes.length - 1) {
        // Satellite position
        ctx.fillStyle = 'lime';
        ctx.beginPath(); ctx.arc(px, py, 6, 0, 2 * Math.PI); ctx.fill();
        ctx.fillStyle = 'red';
        ctx.beginPath(); ctx.arc(px, py, 3, 0, 2 * Math.PI); ctx.fill();
        // Coordinates
        ctx.fillStyle = 'white';
        ctx.font = '10px monospace';
        ctx.fillText(`${(op.lon * 180 / Math.PI).toFixed(1)} lon, ${(op.lat * 180 / Math.PI).toFixed(1)} lat`, 10, H - 10);
      } else {
        drawCross(ctx, px, py, 6, 'lime');
        opList.push({ lat: op.lat, lon: op.lon });
      }

      ctx.fillStyle = 'lime';
      ctx.font = '9px monospace';
      ctx.fillText(`${inputTimes[tidx]}m`, px + 5, py - 5);
    }

    // Crater markers and deviation
    let satDevSum = 0;
    for (let i = 0; i < craters.length; i++) {
      const c = craters[i];
      const cLatRad = c.lat * Math.PI / 180;
      const cLonRad = ((c.lon * Math.PI / 180) + Math.PI) % (2 * Math.PI) - Math.PI;
      const [cx, cy] = pxmap(W, H, cLatRad, cLonRad);

      // Crater dot
      ctx.fillStyle = 'black';
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = 'white';
      ctx.beginPath(); ctx.arc(cx, cy, 4, 0, 2 * Math.PI); ctx.fill();

      ctx.fillStyle = 'black';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`${i + 1}. ${c.name}`, cx + 8, cy + 4);

      if (opList[i]) {
        satDevSum += haversine(cLatRad, cLonRad, opList[i].lat, opList[i].lon);
      }
    }

    // Total deviation
    ctx.fillStyle = 'white';
    ctx.font = 'bold 13px sans-serif';
    ctx.fillText(`Total Satellite Deviation = ${satDevSum.toFixed(2)}`, W / 2 - 140, 20);

    // Axis labels
    ctx.fillStyle = 'white';
    ctx.font = '10px monospace';
    const lonLabels = [-180, -135, -90, -45, 0, 45, 90, 135, 180];
    lonLabels.forEach(deg => {
      const px = ((deg + 180) / 360) * W;
      ctx.fillText(`${deg}`, px - 10, H - 2);
    });
    const latLabels = [90, 60, 30, 0, -30, -60, -90];
    latLabels.forEach(deg => {
      const py = ((90 - deg) / 180) * H;
      ctx.fillText(`${deg}`, 2, py + 3);
    });

  }, [moonImg, oparams, params, craters, timestamps]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black p-2">
      <canvas ref={canvasRef} width={1000} height={500} className="max-w-full max-h-full" />
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

export default memo(ViewMap);
