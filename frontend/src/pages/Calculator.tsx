import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { format } from "date-fns";
import { v4 as uuidv4 } from "uuid";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Header } from "components/Header";
import { Footer } from "components/Footer";
import { BookingForm } from "components/BookingForm";
import { PaymentSummary } from "components/PaymentSummary";
import { calculateTimeDifference, formatHours } from "utils/date-utils";


// Define the form schema with validation
const formSchema = z.object({
  date: z.string().min(1, "Date is required"),
  timeStarted: z.string().min(1, "Start time is required"),
  timeFinished: z.string().min(1, "Finish time is required"),
  driverCallSign: z.string().min(1, "Driver call sign is required"),
  driverName: z.string().min(1, "Driver name is required"),
  vehicleNumber: z.string().min(1, "Vehicle number is required"),
});

interface Booking {
  id: string;
  bookingId: string;
  fareAmount: string;
}

type FormValues = z.infer<typeof formSchema>;

export default function Calculator() {
  const navigate = useNavigate();
  const [shiftDuration, setShiftDuration] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<"shift" | "bookings" | "summary">("shift");
  const [shiftData, setShiftData] = useState<FormValues | null>(null);
  
  // Booking state
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [totalFare, setTotalFare] = useState<number>(0);
  
  // Initialize the form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: format(new Date(), "yyyy-MM-dd"),
      timeStarted: "",
      timeFinished: "",
      driverCallSign: "",
      driverName: "",
      vehicleNumber: "",
    },
  });

  // Watch time fields to calculate duration
  const timeStarted = form.watch("timeStarted");
  const timeFinished = form.watch("timeFinished");

  // Calculate shift duration when times change
  React.useEffect(() => {
    if (timeStarted && timeFinished) {
      const duration = calculateTimeDifference(timeStarted, timeFinished);
      setShiftDuration(duration);
    } else {
      setShiftDuration(null);
    }
  }, [timeStarted, timeFinished]);

  // Calculate total fare amount whenever bookings change
  React.useEffect(() => {
    const total = bookings.reduce((sum, booking) => {
      const fareAmount = parseFloat(booking.fareAmount) || 0;
      return sum + fareAmount;
    }, 0);
    setTotalFare(total);
  }, [bookings]);

  // Add a new booking
  const handleAddBooking = () => {
    setBookings([
      ...bookings,
      { id: uuidv4(), bookingId: "", fareAmount: "" }
    ]);
  };

  // Remove a booking
  const handleRemoveBooking = (id: string) => {
    setBookings(bookings.filter((booking) => booking.id !== id));
  };

  // Update a booking
  const handleUpdateBooking = (id: string, field: "bookingId" | "fareAmount", value: string) => {
    setBookings(
      bookings.map((booking) =>
        booking.id === id ? { ...booking, [field]: value } : booking
      )
    );
  };

  // Form submit handler for shift information
  const onShiftSubmit = (data: FormValues) => {
    setShiftData(data);
    setActiveSection("bookings");
    
    // Add an empty booking if none exist
    if (bookings.length === 0) {
      handleAddBooking();
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-2">Driver Payment Calculator</h2>
          <p className="text-muted-foreground mb-8">
            Enter the driver shift and booking information to calculate payment.
          </p>
          
          {/* Progress Indicator */}
          <div className="flex flex-col md:flex-row items-start md:items-center mb-8 md:space-x-4">
            <div className={`flex items-center ${activeSection === "shift" ? "text-primary" : "text-muted-foreground"} mb-4 md:mb-0`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeSection === "shift" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                1
              </div>
              <span className="ml-2 font-medium">Shift Information</span>
            </div>
            <div className="hidden md:block h-px md:w-12 bg-border flex-grow" />
            <div className={`flex items-center ${activeSection === "bookings" ? "text-primary" : "text-muted-foreground"} mb-4 md:mb-0`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeSection === "bookings" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                2
              </div>
              <span className="ml-2 font-medium">Booking Details</span>
            </div>
            <div className="hidden md:block h-px md:w-12 bg-border flex-grow" />
            <div className={`flex items-center ${activeSection === "summary" ? "text-primary" : "text-muted-foreground"}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeSection === "summary" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                3
              </div>
              <span className="ml-2 font-medium">Payment Summary</span>
            </div>
          </div>
          
          {activeSection === "shift" && (
            /* Driver Shift Information Card */
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Driver Shift Information</CardTitle>
                <CardDescription>
                  Enter the date, time, and driver details for this shift
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onShiftSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Date */}
                      <FormField
                        control={form.control}
                        name="date"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Date</FormLabel>
                            <FormControl>
                              <Input type="date" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Vehicle Number */}
                      <FormField
                        control={form.control}
                        name="vehicleNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vehicle Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter vehicle number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Time Started */}
                      <FormField
                        control={form.control}
                        name="timeStarted"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Started</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Time Finished */}
                      <FormField
                        control={form.control}
                        name="timeFinished"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Time Finished</FormLabel>
                            <FormControl>
                              <Input type="time" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Driver Call Sign */}
                      <FormField
                        control={form.control}
                        name="driverCallSign"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Driver Call Sign</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter driver call sign" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Driver Name */}
                      <FormField
                        control={form.control}
                        name="driverName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Driver Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter driver name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Duration Display */}
                    <div className="bg-muted p-4 rounded-md">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium">Shift Duration:</div>
                        <div className="text-lg font-bold">
                          {shiftDuration !== null ? `${formatHours(shiftDuration)} hours` : "--"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="pt-4 flex justify-end space-x-4">
                      <Button type="button" variant="outline" onClick={() => navigate("/")}>Cancel</Button>
                      <Button type="submit">Continue to Bookings</Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          )}
          
          {activeSection === "bookings" && (
            /* Booking Details Form */
            <div>
              <BookingForm
                bookings={bookings}
                onAddBooking={handleAddBooking}
                onRemoveBooking={handleRemoveBooking}
                onUpdateBooking={handleUpdateBooking}
                totalFare={totalFare}
              />
              
              <div className="flex justify-end space-x-4 mb-8">
                <Button type="button" variant="outline" onClick={() => setActiveSection("shift")}>Back to Shift</Button>
                <Button type="button" onClick={() => setActiveSection("summary")}>Continue to Summary</Button>
              </div>
            </div>
          )}
          
          {activeSection === "summary" && (
            /* Payment Summary */
            <PaymentSummary
              shiftDuration={shiftDuration}
              totalFare={totalFare}
              shiftData={shiftData}
              bookings={bookings}
              onBack={() => setActiveSection("bookings")}
              onReset={() => {
                form.reset();
                setBookings([]);
                setTotalFare(0);
                setShiftDuration(null);
                setShiftData(null);
                setActiveSection("shift");
              }}
            />
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}