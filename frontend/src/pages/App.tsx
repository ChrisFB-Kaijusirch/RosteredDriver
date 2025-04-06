import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Header } from "components/Header";
import { Footer } from "components/Footer";

export default function App() {
  const navigate = useNavigate();

  const handleNavigateToCalculator = () => {
    navigate("/Calculator");
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 md:py-24 container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Fleet Driver Payment Calculator</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Simplify top-up payments for rostered drivers with accurate time tracking and fare calculation.
            </p>
            <Button size="lg" onClick={handleNavigateToCalculator} className="px-8">
              Start Calculating
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 bg-muted">
          <div className="container mx-auto px-4">
            <h3 className="text-2xl md:text-3xl font-bold text-center mb-12">How It Works</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="p-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h4 className="text-xl font-bold mb-2">Enter Shift Details</h4>
                <p className="text-muted-foreground">
                  Record driver information including date, shift times, call sign, name, and vehicle number.
                </p>
              </Card>
              
              <Card className="p-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h4 className="text-xl font-bold mb-2">Log Booking Information</h4>
                <p className="text-muted-foreground">
                  Enter all booking IDs and fare amounts for the shift to calculate total earnings.
                </p>
              </Card>
              
              <Card className="p-6">
                <div className="rounded-full bg-primary/10 w-12 h-12 flex items-center justify-center mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h4 className="text-xl font-bold mb-2">View Top-Up Amount</h4>
                <p className="text-muted-foreground">
                  Get the precise top-up payment based on hours worked at $70/h minus total fares collected.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 container mx-auto px-4 text-center">
          <h3 className="text-2xl md:text-3xl font-bold mb-6">Ready to Simplify Driver Payments?</h3>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Our calculator makes it easy to ensure your drivers receive fair compensation for their time.
          </p>
          <Button size="lg" onClick={handleNavigateToCalculator} className="px-8">
            Open Calculator
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
}
