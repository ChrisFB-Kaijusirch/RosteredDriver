import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpCircle, Clock, DollarSign, FileText, Save, FileDown } from "lucide-react";
import { formatHours } from "utils/date-utils";
import { toast } from "sonner";
import { addCalculationToHistory } from "utils/history-storage";
import { exportAsCSV, exportAsPDF } from "utils/export-utils";

interface PaymentSummaryProps {
  shiftDuration: number | null;
  totalFare: number;
  shiftData: {
    date: string;
    timeStarted: string;
    timeFinished: string;
    driverCallSign: string;
    driverName: string;
    vehicleNumber: string;
  } | null;
  bookings: {
    id: string;
    bookingId: string;
    fareAmount: string;
  }[];
  onBack: () => void;
  onReset: () => void;
}

export function PaymentSummary({
  shiftDuration,
  totalFare,
  shiftData,
  bookings,
  onBack,
  onReset,
}: PaymentSummaryProps) {
  const hourlyRate = 70; // $70/hour
  
  // Calculate shift earnings
  const shiftEarnings = shiftDuration !== null ? shiftDuration * hourlyRate : 0;
  
  // Calculate top-up amount
  const topUp = shiftDuration !== null ? Math.max(0, shiftEarnings - totalFare) : 0;
  
  // Save calculation to history
  const handleSaveCalculation = () => {
    if (!shiftData || shiftDuration === null) {
      toast.error("Cannot save calculation: missing shift data");
      return;
    }
    
    const mappedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingId: booking.bookingId,
      fareAmount: parseFloat(booking.fareAmount) || 0,
    }));
    
    addCalculationToHistory({
      date: shiftData.date,
      driverName: shiftData.driverName,
      driverCallSign: shiftData.driverCallSign,
      vehicleNumber: shiftData.vehicleNumber,
      shiftStartTime: shiftData.timeStarted,
      shiftEndTime: shiftData.timeFinished,
      shiftDuration,
      bookings: mappedBookings,
      totalFare,
      topUpAmount: topUp,
    });
    
    toast.success("Calculation saved to history");
  };

  // Export as CSV
  const handleExportCSV = () => {
    if (!shiftData || shiftDuration === null) {
      toast.error("Cannot export: missing shift data");
      return;
    }

    const mappedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingId: booking.bookingId,
      fareAmount: parseFloat(booking.fareAmount) || 0,
    }));

    try {
      exportAsCSV({
        date: shiftData.date,
        driverName: shiftData.driverName,
        driverCallSign: shiftData.driverCallSign,
        vehicleNumber: shiftData.vehicleNumber,
        shiftStartTime: shiftData.timeStarted,
        shiftEndTime: shiftData.timeFinished,
        shiftDuration,
        bookings: mappedBookings,
        totalFare,
        topUpAmount: topUp,
      });
      toast.success("CSV file downloaded successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV file");
    }
  };

  // Export as PDF
  const handleExportPDF = () => {
    if (!shiftData || shiftDuration === null) {
      toast.error("Cannot export: missing shift data");
      return;
    }

    const mappedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingId: booking.bookingId,
      fareAmount: parseFloat(booking.fareAmount) || 0,
    }));

    try {
      exportAsPDF({
        date: shiftData.date,
        driverName: shiftData.driverName,
        driverCallSign: shiftData.driverCallSign,
        vehicleNumber: shiftData.vehicleNumber,
        shiftStartTime: shiftData.timeStarted,
        shiftEndTime: shiftData.timeFinished,
        shiftDuration,
        bookings: mappedBookings,
        totalFare,
        topUpAmount: topUp,
      });
      toast.success("PDF file downloaded successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF file");
    }
  };
  
  return (
    <Card className="mb-8 border-t-4 border-t-primary shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-2xl">
          <ArrowUpCircle className="mr-2 h-6 w-6 text-primary" />
          Payment Summary
        </CardTitle>
        <CardDescription>
          Review the calculated payment details and top-up amount
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Detailed breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-3 flex items-center">
                <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                Shift Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm">Shift Duration:</div>
                  <div className="font-medium">
                    {shiftDuration !== null ? `${formatHours(shiftDuration)} hours` : "--"}
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm">Hourly Rate:</div>
                  <div className="font-medium">${hourlyRate.toFixed(2)}</div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium">Shift Earnings:</div>
                  <div className="font-medium">
                    ${shiftDuration !== null ? shiftEarnings.toFixed(2) : "0.00"}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="text-sm font-semibold mb-3 flex items-center">
                <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                Booking Details
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="text-sm">Total Fares Collected:</div>
                  <div className="font-medium">${totalFare.toFixed(2)}</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Calculation formula */}
          <div className="bg-primary/5 border border-primary/20 p-4 rounded-lg text-sm">
            <p className="font-medium text-primary mb-2">Calculation Method:</p>
            <div className="space-y-1">
              <p>1. Shift Earnings = Duration (hours) × Hourly Rate ($70.00)</p>
              <p>2. Top-up Amount = Shift Earnings - Total Fares Collected</p>
            </div>
          </div>
          
          {/* Top-up amount prominently displayed */}
          <div className="mt-6 bg-primary/10 border-2 border-primary rounded-lg p-6 md:p-8 flex flex-col md:flex-row justify-between items-center">
            <div>
              <h3 className="text-base font-bold flex items-center">
                <DollarSign className="mr-1 h-5 w-5 text-primary" />
                Driver Top-up Amount:
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Additional payment needed
              </p>
            </div>
            <div className="text-3xl md:text-4xl font-bold text-primary mt-4 md:mt-0">
              ${topUp.toFixed(2)}
            </div>
          </div>

          {/* Export options */}
          <div className="mt-3 flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={handleExportCSV}
            >
              <FileDown className="h-4 w-4" />
              Export as CSV
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2" 
              onClick={handleExportPDF}
            >
              <FileText className="h-4 w-4" />
              Export as PDF
            </Button>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="flex flex-col md:flex-row justify-between pt-4 gap-4">
        <Button type="button" variant="outline" className="flex items-center gap-2 w-full md:w-auto" onClick={handleSaveCalculation}>
          <Save className="h-4 w-4" />
          Save to History
        </Button>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 w-full md:w-auto">
          <Button type="button" variant="outline" className="w-full md:w-auto" onClick={onBack}>
            Back to Booking Details
          </Button>
          <Button type="button" className="w-full md:w-auto" onClick={onReset}>
            Calculate New Payment
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}