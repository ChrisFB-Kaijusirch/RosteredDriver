import { format } from "date-fns";
import jsPDF from "jspdf";
import { CalculationHistoryItem } from "./history-storage";
import { formatHours } from "./date-utils";

/**
 * Format date for display
 */
function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), "dd/MM/yyyy");
  } catch (e) {
    return dateString;
  }
}

/**
 * Generate file name for exports
 */
export function generateExportFileName(prefix: string): string {
  return `${prefix}-${format(new Date(), "yyyy-MM-dd")}`;
}

/**
 * Export calculation data as CSV
 */
export function exportAsCSV(
  calculation: {
    date: string;
    driverName: string;
    driverCallSign: string;
    vehicleNumber: string;
    shiftStartTime: string;
    shiftEndTime: string;
    shiftDuration: number;
    bookings: { bookingId: string; fareAmount: number }[];
    totalFare: number;
    topUpAmount: number;
  },
  fileName = "driver-payment"
): void {
  // Create headers
  const headers = [
    "Date",
    "Driver Name",
    "Call Sign",
    "Vehicle",
    "Shift Start",
    "Shift End",
    "Duration (h)",
    "Total Fare ($)",
    "Top-up ($)",
    "Hourly Rate ($)",
    "Booking IDs",
  ];

  // Format booking IDs as comma-separated list
  const bookingIds = calculation.bookings
    .map((booking) => booking.bookingId)
    .filter(Boolean)
    .join(", ");

  // Create data row
  const row = [
    calculation.date,
    calculation.driverName,
    calculation.driverCallSign,
    calculation.vehicleNumber,
    calculation.shiftStartTime,
    calculation.shiftEndTime,
    calculation.shiftDuration.toFixed(2),
    calculation.totalFare.toFixed(2),
    calculation.topUpAmount.toFixed(2),
    "70.00", // Hourly rate
    bookingIds,
  ];

  // Create CSV content
  const csvContent = [
    headers.join(","),
    row.map(value => `"${value}"`).join(",")
  ].join("\n");

  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}-${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export multiple calculations data as CSV
 */
export function exportHistoryAsCSV(calculations: CalculationHistoryItem[], fileName = "driver-payments"): void {
  // Create headers
  const headers = [
    "Date",
    "Driver Name",
    "Call Sign",
    "Vehicle",
    "Shift Start",
    "Shift End",
    "Duration (h)",
    "Total Fare ($)",
    "Top-up ($)",
    "Hourly Rate ($)"
  ];
  
  // Create rows
  const rows = calculations.map(calc => [
    calc.date,
    calc.driverName,
    calc.driverCallSign,
    calc.vehicleNumber,
    calc.shiftStartTime,
    calc.shiftEndTime,
    calc.shiftDuration.toFixed(2),
    calc.totalFare.toFixed(2),
    calc.topUpAmount.toFixed(2),
    "70.00" // Hourly rate
  ]);
  
  // Create CSV content
  const csvContent = [
    headers.join(","),
    ...rows.map(row => row.map(value => `"${value}"`).join(","))
  ].join("\n");
  
  // Create and download the CSV file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${fileName}-${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Export calculation data as PDF
 */
export function exportAsPDF(
  calculation: {
    date: string;
    driverName: string;
    driverCallSign: string;
    vehicleNumber: string;
    shiftStartTime: string;
    shiftEndTime: string;
    shiftDuration: number;
    bookings: { bookingId: string; fareAmount: number }[];
    totalFare: number;
    topUpAmount: number;
  },
  fileName = "driver-payment"
): void {
  // Create PDF document
  const pdf = new jsPDF();
  
  // Add title
  pdf.setFontSize(20);
  pdf.text("Driver Payment Summary", 105, 15, { align: "center" });
  
  // Add company logo/header
  pdf.setFontSize(12);
  pdf.text("DriverPay", 105, 25, { align: "center" });
  pdf.setDrawColor(0, 0, 0);
  pdf.line(20, 30, 190, 30);
  
  // Add date and time
  pdf.setFontSize(10);
  pdf.text(`Generated: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 195, 35, { align: "right" });
  
  // Add driver information
  pdf.setFontSize(12);
  pdf.text("Driver Information", 20, 45);
  pdf.setFontSize(10);
  
  // Table styling
  const startY = 50;
  const lineHeight = 7;
  
  // Driver info table
  pdf.text("Date:", 20, startY);
  pdf.text(formatDate(calculation.date), 80, startY);
  
  pdf.text("Driver Name:", 20, startY + lineHeight);
  pdf.text(calculation.driverName, 80, startY + lineHeight);
  
  pdf.text("Call Sign:", 20, startY + lineHeight * 2);
  pdf.text(calculation.driverCallSign, 80, startY + lineHeight * 2);
  
  pdf.text("Vehicle Number:", 20, startY + lineHeight * 3);
  pdf.text(calculation.vehicleNumber, 80, startY + lineHeight * 3);
  
  pdf.text("Shift Start:", 20, startY + lineHeight * 4);
  pdf.text(calculation.shiftStartTime, 80, startY + lineHeight * 4);
  
  pdf.text("Shift End:", 20, startY + lineHeight * 5);
  pdf.text(calculation.shiftEndTime, 80, startY + lineHeight * 5);
  
  pdf.text("Shift Duration:", 20, startY + lineHeight * 6);
  pdf.text(formatHours(calculation.shiftDuration) + " hours", 80, startY + lineHeight * 6);
  
  // Line separator
  pdf.line(20, startY + lineHeight * 7, 190, startY + lineHeight * 7);
  
  // Bookings section
  pdf.setFontSize(12);
  pdf.text("Booking Details", 20, startY + lineHeight * 8);
  
  // Bookings table
  if (calculation.bookings.length > 0) {
    const bookingStartY = startY + lineHeight * 9;
    pdf.setFontSize(10);
    pdf.text("Booking ID", 20, bookingStartY);
    pdf.text("Fare Amount", 100, bookingStartY);
    
    calculation.bookings.forEach((booking, i) => {
      const y = bookingStartY + lineHeight * (i + 1);
      pdf.text(booking.bookingId || "--", 20, y);
      pdf.text(`$${booking.fareAmount.toFixed(2)}`, 100, y);
    });
  } else {
    pdf.setFontSize(10);
    pdf.text("No bookings recorded", 20, startY + lineHeight * 9);
  }
  
  // Line separator
  const calculationY = startY + lineHeight * (10 + calculation.bookings.length);
  pdf.line(20, calculationY, 190, calculationY);
  
  // Calculation section
  pdf.setFontSize(12);
  pdf.text("Payment Calculation", 20, calculationY + lineHeight);
  pdf.setFontSize(10);
  
  // Total fares
  pdf.text("Total Fares Collected:", 20, calculationY + lineHeight * 2);
  pdf.text(`$${calculation.totalFare.toFixed(2)}`, 100, calculationY + lineHeight * 2);
  
  // Hourly rate
  pdf.text("Hourly Rate:", 20, calculationY + lineHeight * 3);
  pdf.text("$70.00", 100, calculationY + lineHeight * 3);
  
  // Shift earnings
  const shiftEarnings = calculation.shiftDuration * 70;
  pdf.text("Shift Earnings:", 20, calculationY + lineHeight * 4);
  pdf.text(`$${shiftEarnings.toFixed(2)}`, 100, calculationY + lineHeight * 4);
  
  // Top-up amount
  pdf.text("Top-up Amount:", 20, calculationY + lineHeight * 5);
  pdf.setFontSize(12);
  pdf.setTextColor(0, 100, 0); // Green text for emphasis
  pdf.text(`$${calculation.topUpAmount.toFixed(2)}`, 100, calculationY + lineHeight * 5);
  
  // Formula explanation
  pdf.setTextColor(0, 0, 0); // Reset text color
  pdf.setFontSize(9);
  pdf.text("Calculation Formula: Top-up Amount = Shift Earnings - Total Fares Collected", 20, calculationY + lineHeight * 7);
  
  // Footer
  pdf.setFontSize(8);
  pdf.text("This is an automatically generated document from DriverPay", 105, 280, { align: "center" });
  
  // Save the PDF
  pdf.save(`${fileName}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}

/**
 * Export multiple calculations history as PDF
 * 
 * This creates a PDF with a summary page showing all calculations
 */
export function exportHistoryAsPDF(calculations: CalculationHistoryItem[], fileName = "driver-payments"): void {
  if (calculations.length === 0) return;
  
  // Create PDF document
  const pdf = new jsPDF();
  
  // Add title
  pdf.setFontSize(20);
  pdf.text("Driver Payments History", 105, 15, { align: "center" });
  
  // Add company logo/header
  pdf.setFontSize(12);
  pdf.text("DriverPay", 105, 25, { align: "center" });
  pdf.setDrawColor(0, 0, 0);
  pdf.line(20, 30, 190, 30);
  
  // Add date and time
  pdf.setFontSize(10);
  pdf.text(`Generated: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 195, 35, { align: "right" });
  
  // Add summary information
  pdf.setFontSize(12);
  pdf.text(`Summary of ${calculations.length} payment calculations`, 20, 45);
  
  // Calculate totals
  const totalShiftHours = calculations.reduce((sum, calc) => sum + calc.shiftDuration, 0);
  const totalFares = calculations.reduce((sum, calc) => sum + calc.totalFare, 0);
  const totalTopUps = calculations.reduce((sum, calc) => sum + calc.topUpAmount, 0);
  
  // Add summary table
  pdf.setFontSize(10);
  pdf.text("Total Shift Hours:", 20, 55);
  pdf.text(`${totalShiftHours.toFixed(2)} hours`, 100, 55);
  
  pdf.text("Total Fares Collected:", 20, 62);
  pdf.text(`$${totalFares.toFixed(2)}`, 100, 62);
  
  pdf.text("Total Top-up Amount:", 20, 69);
  pdf.text(`$${totalTopUps.toFixed(2)}`, 100, 69);
  
  // Add table headers
  pdf.setFillColor(240, 240, 240);
  pdf.rect(20, 80, 170, 10, "F");
  pdf.setFontSize(9);
  pdf.text("Date", 22, 86);
  pdf.text("Driver", 46, 86);
  pdf.text("Call Sign", 76, 86);
  pdf.text("Hours", 106, 86);
  pdf.text("Fare ($)", 126, 86);
  pdf.text("Top-up ($)", 156, 86);
  
  // Add table rows
  let y = 90;
  const rowHeight = 8;
  const maxRowsPerPage = 25;
  let rowCount = 0;
  
  calculations.forEach((calc, index) => {
    // Add new page if needed
    if (rowCount >= maxRowsPerPage) {
      pdf.addPage();
      y = 20;
      rowCount = 0;
    }
    
    // Add alternating row background
    if (index % 2 === 1) {
      pdf.setFillColor(248, 248, 248);
      pdf.rect(20, y, 170, rowHeight, "F");
    }
    
    // Add row data
    pdf.setFontSize(8);
    pdf.text(formatDate(calc.date), 22, y + 5);
    pdf.text(calc.driverName.substring(0, 15), 46, y + 5);
    pdf.text(calc.driverCallSign, 76, y + 5);
    pdf.text(calc.shiftDuration.toFixed(2), 106, y + 5);
    pdf.text(calc.totalFare.toFixed(2), 126, y + 5);
    pdf.text(calc.topUpAmount.toFixed(2), 156, y + 5);
    
    y += rowHeight;
    rowCount++;
  });
  
  // Add footer
  pdf.setFontSize(8);
  pdf.text("This is an automatically generated document from DriverPay", 105, 280, { align: "center" });
  
  // Save the PDF
  pdf.save(`${fileName}-${format(new Date(), "yyyy-MM-dd")}.pdf`);
}