/**
 * Application constants
 */

export const PARKING_CONSTANTS = {
  DEFAULT_MAX_CAPACITY: 10,
  REFRESH_INTERVAL: 30000, // 30 seconds
  AUTO_CLOSE_DELAY: 2500, // 2.5 seconds
} as const;

export const PARKING_RATES = {
  BASE_RATE: 5, // Base parking fee
  HOURLY_RATE: 3, // Per hour rate
} as const;

export const AI_MESSAGES = {
  SYSTEM_INITIALIZED: '[AI] System initialized.',
  GARAGE_FULL: '[AI] GARAGE FULL. Entry denied.',
  GARAGE_EMPTY: '[AI] GARAGE EMPTY. No vehicle to exit.',
  BACKEND_DISCONNECTED: '[AI] Warning: Could not connect to backend. Using simulation mode.',
} as const;
