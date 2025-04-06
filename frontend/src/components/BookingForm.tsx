import React from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Booking {
  id: string;
  bookingId: string;
  fareAmount: string;
}

interface BookingFormProps {
  bookings: Booking[];
  onAddBooking: () => void;
  onRemoveBooking: (id: string) => void;
  onUpdateBooking: (id: string, field: "bookingId" | "fareAmount", value: string) => void;
  totalFare: number;
}

export function BookingForm({
  bookings,
  onAddBooking,
  onRemoveBooking,
  onUpdateBooking,
  totalFare,
}: BookingFormProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Booking Details</CardTitle>
        <CardDescription>
          Enter all bookings for this shift. Add as many bookings as needed.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {bookings.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No bookings added yet. Click the button below to add a booking.
            </div>
          ) : (
            <div className="space-y-4">
              {/* Column Headers */}
              <div className="grid grid-cols-12 gap-4 mb-2 font-medium text-sm text-muted-foreground">
                <div className="col-span-5 md:col-span-6">Booking ID</div>
                <div className="col-span-5 md:col-span-4">Fare Amount ($)</div>
                <div className="col-span-2"></div>
              </div>
              
              {/* Booking Entries */}
              {bookings.map((booking) => (
                <div key={booking.id} className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5 md:col-span-6">
                    <Input
                      placeholder="Enter booking ID"
                      value={booking.bookingId}
                      onChange={(e) => onUpdateBooking(booking.id, "bookingId", e.target.value)}
                    />
                  </div>
                  <div className="col-span-5 md:col-span-4">
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={booking.fareAmount}
                      onChange={(e) => onUpdateBooking(booking.id, "fareAmount", e.target.value)}
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveBooking(booking.id)}
                      className="h-9 w-9"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Add Booking Button */}
          <Button
            type="button"
            variant="outline"
            className="w-full md:w-auto md:mx-auto md:px-8 flex items-center justify-center"
            onClick={onAddBooking}
          >
            + Add Booking
          </Button>
          
          {/* Total Fare Display */}
          <div className="bg-muted p-4 rounded-md mt-6 md:max-w-md md:ml-auto">
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Total Fare Amount:</div>
              <div className="text-lg font-bold">
                ${totalFare.toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}