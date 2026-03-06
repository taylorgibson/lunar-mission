import { MU_MOON, R_MOON } from './constants.js';

export function solveKepler(M, e) {
  let E = M;
  for (let i = 0; i < 20; i++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-12) break;
  }
  return E;
}

export function dVorbit(R, mu, dVi, dVa, dVp) {
  let Ra = R;
  const v0 = Math.sqrt(mu / R);
  let Rp = (4 * Ra * Ra / mu) * v0 * dVa + Ra;
  const Va = v0 + dVa;
  const Vp = Va * Ra / Rp;
  let a = (Ra + Rp) / 2;
  Ra = (4 * a * a / mu) * Vp * dVp + Rp;
  a = (Ra + Rp) / 2;
  const ecc = (Ra - Rp) / (2 * a);
  const i_rad = 2 * Math.asin(Math.max(-1, Math.min(1, dVi / (2 * v0))));
  const i_deg = (180 * i_rad) / Math.PI;
  return { a, ecc, i_deg, Rp, Ra };
}

function Rz(t) {
  const c = Math.cos(t), s = Math.sin(t);
  return [
    [c, -s, 0],
    [s,  c, 0],
    [0,  0, 1]
  ];
}

function Rx(t) {
  const c = Math.cos(t), s = Math.sin(t);
  return [
    [1, 0,  0],
    [0, c, -s],
    [0, s,  c]
  ];
}

function mat3Mul(A, B) {
  const C = [[0,0,0],[0,0,0],[0,0,0]];
  for (let i = 0; i < 3; i++)
    for (let j = 0; j < 3; j++)
      for (let k = 0; k < 3; k++)
        C[i][j] += A[i][k] * B[k][j];
  return C;
}

function mat3Vec(M, v) {
  return [
    M[0][0]*v[0] + M[0][1]*v[1] + M[0][2]*v[2],
    M[1][0]*v[0] + M[1][1]*v[1] + M[1][2]*v[2],
    M[2][0]*v[0] + M[2][1]*v[1] + M[2][2]*v[2],
  ];
}

export function rotationMatrixEuler(Omega, i, omega) {
  return mat3Mul(mat3Mul(Rz(Omega), Rx(i)), Rz(omega));
}

export function orbitPoint(oparams, moonT, time) {
  const { T, a, ecc, i_deg, Omega_deg, omega_deg } = oparams;
  const M = (2 * Math.PI * time) / T;
  const E = solveKepler(M, ecc);

  const r_mag = a * (1 - ecc * Math.cos(E));
  const nu = 2 * Math.atan2(
    Math.sqrt(1 + ecc) * Math.sin(E / 2),
    Math.sqrt(1 - ecc) * Math.cos(E / 2)
  );

  const rvec = [r_mag * Math.cos(nu), r_mag * Math.sin(nu), 0];

  const R = rotationMatrixEuler(
    Omega_deg * Math.PI / 180,
    i_deg * Math.PI / 180,
    omega_deg * Math.PI / 180
  );
  let pos = mat3Vec(R, rvec);

  if (moonT !== 0) {
    const Rz_moon = rotationMatrixEuler((-2 * Math.PI / moonT) * time, 0, 0);
    pos = mat3Vec(Rz_moon, pos);
  }

  const dist = Math.sqrt(pos[0]*pos[0] + pos[1]*pos[1] + pos[2]*pos[2]);
  const lat = Math.asin(pos[2] / dist);
  const lon = Math.atan2(pos[1], pos[0]);

  return { pos, lat, lon, r_mag };
}

export function computeOrbitParams(dVi, dVa, dVp, OmegaDeg, omegaDeg) {
  const R = R_MOON + 100e3; // H_0
  const result = dVorbit(R, MU_MOON, dVi, dVa, dVp);
  const T = 2 * Math.PI * Math.sqrt(result.a * result.a * result.a / MU_MOON);
  return {
    T, a: result.a, ecc: result.ecc, i_deg: result.i_deg,
    Omega_deg: OmegaDeg, omega_deg: omegaDeg,
    Rp: result.Rp, Ra: result.Ra
  };
}

export function computeOrbitPath(oparams, moonT, steps) {
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * oparams.T;
    points.push(orbitPoint(oparams, moonT, t));
  }
  return points;
}
