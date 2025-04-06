import { v4 as uuidv4 } from "uuid";

// Define the calculation history item type
export interface CalculationHistoryItem {
  id: string;
  date: string; // ISO string
  driverName: string;
  driverCallSign: string;
  vehicleNumber: string;
  shiftStartTime: string;
  shiftEndTime: string;
  shiftDuration: number;
  bookings: {
    id: string;
    bookingId: string;
    fareAmount: number;
  }[];
  totalFare: number;
  topUpAmount: number;
  createdAt: string; // ISO string
}

// Local storage key
const STORAGE_KEY = "driverPay_calculationHistory";

/**
 * Get all calculation history items from local storage
 */
export function getCalculationHistory(): CalculationHistoryItem[] {
  try {
    const historyJson = localStorage.getItem(STORAGE_KEY);
    if (!historyJson) return [];
    return JSON.parse(historyJson);
  } catch (error) {
    console.error("Error loading calculation history:", error);
    return [];
  }
}

/**
 * Add a new calculation to history
 */
export function addCalculationToHistory(calculation: Omit<CalculationHistoryItem, "id" | "createdAt">): CalculationHistoryItem {
  const newItem: CalculationHistoryItem = {
    ...calculation,
    id: uuidv4(),
    createdAt: new Date().toISOString(),
  };

  try {
    const history = getCalculationHistory();
    const updatedHistory = [newItem, ...history];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    return newItem;
  } catch (error) {
    console.error("Error saving calculation to history:", error);
    return newItem;
  }
}

/**
 * Delete a calculation from history by ID
 */
export function deleteCalculationFromHistory(id: string): boolean {
  try {
    const history = getCalculationHistory();
    const updatedHistory = history.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
    return true;
  } catch (error) {
    console.error("Error deleting calculation from history:", error);
    return false;
  }
}

/**
 * Clear all calculation history
 */
export function clearCalculationHistory(): boolean {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (error) {
    console.error("Error clearing calculation history:", error);
    return false;
  }
}

/**
 * Get a sorted calculation history
 */
export function getSortedCalculationHistory(
  sortBy: keyof CalculationHistoryItem = "createdAt",
  sortDirection: "asc" | "desc" = "desc"
): CalculationHistoryItem[] {
  const history = getCalculationHistory();
  
  return history.sort((a, b) => {
    let valueA: any = a[sortBy];
    let valueB: any = b[sortBy];
    
    // Handle string comparisons (case-insensitive)
    if (typeof valueA === "string" && typeof valueB === "string") {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }
    
    if (valueA < valueB) return sortDirection === "asc" ? -1 : 1;
    if (valueA > valueB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });
}