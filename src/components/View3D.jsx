import { memo, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { R_MOON, SUN_ANGLE_ENDPOINTS } from '../lib/constants.js';
import { orbitPoint, rotationMatrixEuler } from '../lib/orbit.js';

const SCALE = 1 / R_MOON; // normalize so moon radius = 1

function MoonSphere({ texture }) {
  return (
    <mesh>
      <sphereGeometry args={[1, 64, 64]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  );
}

function EquatorRing() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 360; i++) {
      const a = (i * Math.PI) / 180;
      pts.push(new THREE.Vector3(Math.cos(a) * 1.001, Math.sin(a) * 1.001, 0));
    }
    return pts;
  }, []);
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          count={points.length}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="yellow" />
    </line>
  );
}

function PrimeMeridian() {
  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 180; i++) {
      const a = ((i - 90) * Math.PI) / 180;
      pts.push(new THREE.Vector3(Math.cos(a) * 1.001, 0, Math.sin(a) * 1.001));
    }
    return pts;
  }, []);
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(points.flatMap(p => [p.x, p.y, p.z]))}
          count={points.length}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="red" />
    </line>
  );
}

function PolarAxis() {
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array([0, 0, -1.2, 0, 0, 1.2])}
          count={2}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="blue" />
    </line>
  );
}

function OrbitPath({ oparams, numOrbits }) {
  const { positions, colors, solarExposure } = useMemo(() => {
    const steps = 100;
    const pts = [];
    const cols = [];
    let shadowCount = 0;

    const totalSunDuration = 10 * 24 * 3600;
    const timeFactor = (oparams.T * numOrbits) / totalSunDuration;

    const sunAngles0 = SUN_ANGLE_ENDPOINTS[0];
    const sunAngles1 = [
      sunAngles0[0] + (SUN_ANGLE_ENDPOINTS[1][0] - sunAngles0[0]) * timeFactor,
      sunAngles0[1] + (SUN_ANGLE_ENDPOINTS[1][1] - sunAngles0[1]) * timeFactor
    ];

    const sunVecs = [sunAngles0, sunAngles1].map(angles => [
      Math.cos(angles[1]) * Math.cos(angles[0]),
      Math.cos(angles[1]) * Math.sin(angles[0]),
      Math.sin(angles[1])
    ]);

    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * oparams.T;
      const op = orbitPoint(oparams, 0, t);
      const p = op.pos;
      const r = Math.sqrt(p[0]*p[0] + p[1]*p[1] + p[2]*p[2]);
      const ps = p.map(v => v * SCALE);
      pts.push(ps[0], ps[1], ps[2]);

      const horizonAngle = Math.asin(Math.min(1, R_MOON / r));
      const cosAlphas = sunVecs.map(sv => {
        const dot = p[0]*sv[0] + p[1]*sv[1] + p[2]*sv[2];
        return dot / r;
      });

      const inShadow0 = cosAlphas[0] < -Math.cos(horizonAngle);
      const inShadow1 = cosAlphas[1] < -Math.cos(horizonAngle);

      let color;
      if (inShadow0 && inShadow1) { color = [0, 0, 0]; shadowCount += 2; }
      else if (inShadow0 || inShadow1) { color = [0.59, 0.36, 0.07]; shadowCount += 1; }
      else { color = [1, 0.65, 0]; }
      cols.push(...color);
    }

    return {
      positions: new Float32Array(pts),
      colors: new Float32Array(cols),
      solarExposure: 100 * (1 - shadowCount / (2 * (steps + 1)))
    };
  }, [oparams, numOrbits]);

  return {
    element: (
      <line>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" array={positions} count={positions.length / 3} itemSize={3} />
          <bufferAttribute attach="attributes-color" array={colors} count={colors.length / 3} itemSize={3} />
        </bufferGeometry>
        <lineBasicMaterial vertexColors />
      </line>
    ),
    solarExposure
  };
}

function SunArrows({ oparams, numOrbits }) {
  const arrows = useMemo(() => {
    const totalSunDuration = 10 * 24 * 3600;
    const timeFactor = (oparams.T * numOrbits) / totalSunDuration;

    const sunAngles0 = SUN_ANGLE_ENDPOINTS[0];
    const sunAngles1 = [
      sunAngles0[0] + (SUN_ANGLE_ENDPOINTS[1][0] - sunAngles0[0]) * timeFactor,
      sunAngles0[1] + (SUN_ANGLE_ENDPOINTS[1][1] - sunAngles0[1]) * timeFactor
    ];

    return [sunAngles0, sunAngles1].map(angles => {
      const sv = [
        Math.cos(angles[1]) * Math.cos(angles[0]),
        Math.cos(angles[1]) * Math.sin(angles[0]),
        Math.sin(angles[1])
      ];
      const start = sv.map(v => v * 1.4);
      const end = sv.map((v, i) => start[i] - v * 0.3);
      return { start, end, dir: sv.map(v => -v) };
    });
  }, [oparams, numOrbits]);

  return (
    <>
      {arrows.map((arrow, i) => (
        <group key={i}>
          <line>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                array={new Float32Array([...arrow.start, ...arrow.end])}
                count={2}
                itemSize={3}
              />
            </bufferGeometry>
            <lineBasicMaterial color="black" linewidth={3} />
          </line>
          <mesh position={arrow.end}>
            <coneGeometry args={[0.05, 0.15, 8]} />
            <meshBasicMaterial color="black" />
          </mesh>
        </group>
      ))}
    </>
  );
}

function View3D({ oparams, params }) {
  const textureRef = useRef();

  const texture = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const tex = loader.load('/moon_texture.png');
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);

  const orbitPath = OrbitPath({ oparams, numOrbits: params.numOrbits });

  const perilune = ((1 - oparams.ecc) * oparams.a - R_MOON) / 1000;
  const apolune = ((1 + oparams.ecc) * oparams.a - R_MOON) / 1000;
  const dVtot = params.dVi + params.dVa + params.dVp;

  return (
    <div className="w-full h-full relative">
      <div className="absolute top-2 left-2 right-2 z-10 text-white text-xs font-mono bg-black/60 p-2 rounded pointer-events-none">
        <div className="font-bold text-yellow-400">Lunar Mission Control</div>
        <div>dV: {dVtot} m/s | Perilune: {perilune.toFixed(0)} km | Apolune: {apolune.toFixed(0)} km</div>
        <div>ecc: {oparams.ecc.toFixed(3)} | inc: {oparams.i_deg.toFixed(3)} | a: {(oparams.a/1000).toFixed(0)} km | T: {(oparams.T/60).toFixed(2)} min</div>
        <div>Solar Exposure: {orbitPath.solarExposure.toFixed(2)}%</div>
      </div>
      <Canvas camera={{ position: [3, 1, 2], fov: 45 }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 3, 5]} intensity={1} />
        <MoonSphere texture={texture} />
        <EquatorRing />
        <PrimeMeridian />
        <PolarAxis />
        {orbitPath.element}
        <SunArrows oparams={oparams} numOrbits={params.numOrbits} />
        <OrbitControls enableDamping />
      </Canvas>
    </div>
  );
}

export default memo(View3D);
