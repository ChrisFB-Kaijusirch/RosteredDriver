import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trash2, FileDown, Search, FileText } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { toast } from "sonner";

import { Header } from "components/Header";
import { Footer } from "components/Footer";
import { formatHours } from "utils/date-utils";
import { CalculationHistoryItem, getSortedCalculationHistory, deleteCalculationFromHistory, clearCalculationHistory } from "utils/history-storage";
import { exportAsCSV, exportAsPDF } from "utils/export-utils";

export default function History() {
  const navigate = useNavigate();
  const [calculations, setCalculations] = useState<CalculationHistoryItem[]>([]);
  const [sortBy, setSortBy] = useState<keyof CalculationHistoryItem>("createdAt");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Load calculations from storage
  useEffect(() => {
    const sorted = getSortedCalculationHistory(sortBy, sortDirection);
    setCalculations(sorted);
  }, [sortBy, sortDirection]);
  
  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value as keyof CalculationHistoryItem);
  };
  
  // Handle direction change
  const handleDirectionChange = (value: string) => {
    setSortDirection(value as "asc" | "desc");
  };
  
  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
  };
  
  // Filter calculations based on search query
  const filteredCalculations = calculations.filter(calc => {
    const searchLower = searchQuery.toLowerCase();
    return (
      calc.driverName.toLowerCase().includes(searchLower) ||
      calc.driverCallSign.toLowerCase().includes(searchLower) ||
      calc.vehicleNumber.toLowerCase().includes(searchLower)
    );
  });
  
  // Delete a calculation
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this calculation?")) {
      deleteCalculationFromHistory(id);
      setCalculations(prevCalcs => prevCalcs.filter(calc => calc.id !== id));
    }
  };
  
  // Clear all history
  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all calculation history? This cannot be undone.")) {
      clearCalculationHistory();
      setCalculations([]);
    }
  };
  
  // Export calculations as CSV
  const handleExportCSV = () => {
    if (filteredCalculations.length === 0) {
      toast.error("No data available to export");
      return;
    }
    
    try {
      // Create mapping of calculations with the correct interface
      const mappedCalculations = filteredCalculations.map(calc => ({
        date: calc.date,
        driverName: calc.driverName,
        driverCallSign: calc.driverCallSign,
        vehicleNumber: calc.vehicleNumber,
        shiftStartTime: calc.shiftStartTime,
        shiftEndTime: calc.shiftEndTime,
        shiftDuration: calc.shiftDuration,
        bookings: calc.bookings,
        totalFare: calc.totalFare,
        topUpAmount: calc.topUpAmount
      }));
      
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
      const rows = mappedCalculations.map(calc => [
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
      link.setAttribute("download", `driver-payments-${format(new Date(), "yyyy-MM-dd")}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("CSV file downloaded successfully");
    } catch (error) {
      console.error("Error exporting CSV:", error);
      toast.error("Failed to export CSV file");
    }
  };
  
  // Export calculations as PDF
  const handleExportPDF = () => {
    if (filteredCalculations.length === 0) {
      toast.error("No data available to export");
      return;
    }
    
    try {
      // Export all filtered calculations into a single PDF report
      exportHistoryAsPDF(filteredCalculations, "driver-payments");
      toast.success("PDF file downloaded successfully");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Failed to export PDF file");
    }
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
            <div>
              <h2 className="text-3xl font-bold">Calculation History</h2>
              <p className="text-muted-foreground">
                View and manage previous driver payment calculations
              </p>
            </div>
            <Button onClick={() => navigate("/calculator")} className="md:self-start">
              New Calculation
            </Button>
          </div>
          
          {/* Filters and Actions */}
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by driver or vehicle..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                </div>
                
                <div className="flex space-x-3">
                  <Select value={sortBy} onValueChange={handleSortChange}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="driverName">Driver Name</SelectItem>
                      <SelectItem value="driverCallSign">Call Sign</SelectItem>
                      <SelectItem value="shiftDuration">Shift Duration</SelectItem>
                      <SelectItem value="totalFare">Total Fare</SelectItem>
                      <SelectItem value="topUpAmount">Top-up Amount</SelectItem>
                      <SelectItem value="createdAt">Created</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortDirection} onValueChange={handleDirectionChange}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex space-x-3 justify-end">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="icon"
                        title="Export options"
                      >
                        <FileDown className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-52">
                      <div className="grid gap-2">
                        <Button
                          variant="ghost"
                          className="flex items-center justify-start gap-2 px-2"
                          onClick={handleExportCSV}
                        >
                          <FileDown className="h-4 w-4" />
                          Export as CSV
                        </Button>
                        <Button
                          variant="ghost"
                          className="flex items-center justify-start gap-2 px-2"
                          onClick={handleExportPDF}
                        >
                          <FileText className="h-4 w-4" />
                          Export as PDF
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleClearAll}
                    className="flex items-center gap-1"
                  >
                    <Trash2 className="h-4 w-4" />
                    Clear History
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Calculations Table */}
          {filteredCalculations.length > 0 ? (
            <div className="bg-card rounded-md border shadow-sm overflow-hidden overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40">
                    <TableHead className="font-semibold">Date</TableHead>
                    <TableHead className="font-semibold">Driver</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Call Sign</TableHead>
                    <TableHead className="hidden md:table-cell font-semibold">Vehicle</TableHead>
                    <TableHead className="font-semibold">Shift</TableHead>
                    <TableHead className="text-right font-semibold">Fare</TableHead>
                    <TableHead className="text-right font-semibold">Top-up</TableHead>
                    <TableHead className="w-[80px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCalculations.map((calc) => (
                    <TableRow key={calc.id} className="hover:bg-muted/30">
                      <TableCell>
                        {format(new Date(calc.date), "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{calc.driverName}</div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {calc.driverCallSign}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {calc.vehicleNumber}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">{formatHours(calc.shiftDuration)} hours</div>
                        <div className="text-xs text-muted-foreground">
                          {calc.shiftStartTime.substring(0, 5)} - {calc.shiftEndTime.substring(0, 5)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        ${calc.totalFare.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        ${calc.topUpAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleDelete(calc.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="bg-muted/40 border rounded-lg py-16 text-center">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No calculation history</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                {searchQuery ? "No results match your search criteria." : "Your calculation history will appear here once you save calculations."}
              </p>
              <Button onClick={() => navigate("/calculator")} className="mx-auto">
                Create Your First Calculation
              </Button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}