/**
 * Utility functions for the Smart Parking System
 */

/**
 * Generates a random license plate number.
 * @returns {string} A random license plate (e.g., "ABC-1234").
 */
export const generateLicensePlate = (): string => {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  let plate = '';
  for (let i = 0; i < 3; i++) {
    plate += letters.charAt(Math.floor(Math.random() * letters.length));
  }
  plate += '-';
  for (let i = 0; i < 4; i++) {
    plate += numbers.charAt(Math.floor(Math.random() * numbers.length));
  }
  return plate;
};

/**
 * Generates placeholder image URLs for a vehicle and its plate.
 * @param {string} plate - The license plate number.
 * @returns {{vehicleImageUrl: string, plateImageUrl: string}}
 */
export const generateVehicleImages = (plate: string) => {
  const vehicleColor = '334155'; // dark slate
  const textColor = '94a3b8'; // light slate
  return {
    vehicleImageUrl: `https://placehold.co/600x400/${vehicleColor}/${textColor}?text=Vehicle+View`,
    plateImageUrl: `https://placehold.co/300x100/${textColor}/${vehicleColor}?font=montserrat&text=${plate}`,
  };
};

/**
 * Formats a Date object into a readable time string.
 * @param {Date} date - The date to format.
 * @returns {string} Formatted time (e.g., "10:30:05 AM").
 */
export const formatTime = (date: Date | null): string => {
  if (!date) return 'N/A';
  return date.toLocaleTimeString();
};

/**
 * Calculates the parking duration and cost.
 * @param {Date} checkInTime - The time the vehicle checked in.
 * @param {Date} checkOutTime - The time the vehicle checked out.
 * @returns {{duration: string, cost: number}} An object with duration string and cost.
 */
export const calculateParkingDetails = (
  checkInTime: Date | null,
  checkOutTime: Date | null
): { duration: string; cost: number } => {
  if (!checkInTime || !checkOutTime) {
    return { duration: 'N/A', cost: 0 };
  }
  
  const diffMs = checkOutTime.getTime() - checkInTime.getTime();
  // For demo, ensure minimum 15 mins
  const diffMins = Math.max(15, Math.ceil(diffMs / (1000 * 60))); 
  
  const hours = Math.floor(diffMins / 60);
  const minutes = diffMins % 60;
  
  const duration = `${hours}h ${minutes}m`;
  
  // Simple cost: $5 per hour
  const cost = (diffMins / 60) * 5;
  
  return {
    duration,
    cost: parseFloat(cost.toFixed(2)),
  };
};
