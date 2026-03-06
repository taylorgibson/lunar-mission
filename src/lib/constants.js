export const G = 6.67430e-11;       // m^3 kg^-1 s^-2
export const M_MOON = 7.3459e22;    // kg
export const R_MOON = 1.7374e6;     // m
export const MU_MOON = G * M_MOON;  // m^3 s^-2
export const H_0 = 100.0e3;         // m - initial circular orbit altitude
export const ROT_T_MOON = 2360591.5; // s - Moon's sidereal rotation period

// Sun direction endpoints (10-day arc, Sep 22-Oct 2 2021, radians)
export const SUN_ANGLE_ENDPOINTS = [
  [90.000 * Math.PI / 180, -0.009 * Math.PI / 180],
  [80.132 * Math.PI / 180,  0.013 * Math.PI / 180]
];

export const DEFAULT_PARAMS = {
  timeInc: 5, numOrbits: 50,
  OmegaDeg: -2, omegaDeg: 0,
  dVi: 1900, dVa: 515, dVp: 0,
  satTime: 130,
  facingAngleDeg: 0, satRotPerHr: 10.0,
  apertureDeg: 3
};

export const DEFAULT_TIMESTAMPS = [
  20325, 7049, 320, 325, 16805, 6250, 13201, 73, 11418, 4652,
  130, 5565, 365, 3667, 9243, 8212, 5772, 2208, 350, 8612, 1728
];

// Fallback crater data (21 craters >= 100km, sorted alphabetically)
export const FALLBACK_CRATERS = [
  { name: "Amundsen", lat: -84.44, lon: 83.07, diameter: 103.32 },
  { name: "Bolyai", lat: -33.85, lon: 126.12, diameter: 102.19 },
  { name: "Cabeus", lat: -85.33, lon: 317.87, diameter: 100.58 },
  { name: "Casatus", lat: -72.70, lon: 329.25, diameter: 102.84 },
  { name: "Doppler", lat: -12.58, lon: 200.16, diameter: 101.71 },
  { name: "Eotvos", lat: -35.61, lon: 134.43, diameter: 101.87 },
  { name: "FridmanFriedmann", lat: -12.48, lon: 233.12, diameter: 101.39 },
  { name: "Gartner", lat: 59.24, lon: 34.76, diameter: 101.71 },
  { name: "Gilbert", lat: -3.20, lon: 76.16, diameter: 100.26 },
  { name: "Milankovicv", lat: 77.20, lon: 168.80, diameter: 101.07 },
  { name: "Piazzi", lat: -36.16, lon: 291.99, diameter: 102.51 },
  { name: "Pitatus", lat: -29.88, lon: 346.47, diameter: 100.58 },
  { name: "Plato", lat: 51.62, lon: 350.62, diameter: 100.74 },
  { name: "Russell", lat: 26.51, lon: 284.45, diameter: 103.32 },
  { name: "Saha", lat: -1.69, lon: 103.04, diameter: 103.32 },
  { name: "Seyfert", lat: 29.26, lon: 114.34, diameter: 102.68 },
  { name: "Ventris", lat: -4.77, lon: 157.97, diameter: 100.74 },
  { name: "Wilhelm", lat: -43.21, lon: 339.06, diameter: 100.91 },
  { name: "Wyld", lat: -1.42, lon: 98.10, diameter: 103.32 },
  { name: "Yablochkov", lat: 60.78, lon: 127.58, diameter: 101.55 },
  { name: "Lundmark", lat: -38.87, lon: 152.56, diameter: 103.48 },
];

export const CD_MIN = 100; // km minimum crater diameter
