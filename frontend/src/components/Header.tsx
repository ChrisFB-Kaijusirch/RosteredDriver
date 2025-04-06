import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Header() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const navigateTo = (path: string) => {
    navigate(path);
    setIsOpen(false);
  };

  return (
    <header className="border-b border-border sticky top-0 z-10 bg-background">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div 
          className="flex items-center space-x-2 cursor-pointer" 
          onClick={() => navigate("/")}
        >
          <div className="bg-primary rounded-md w-8 h-8 flex items-center justify-center">
            <span className="text-primary-foreground font-bold">DP</span>
          </div>
          <h1 className="text-xl font-bold">DriverPay</h1>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-6 items-center">
            <li>
              <a 
                href={window.location.pathname === "/" ? "#features" : "/"} 
                className="text-foreground hover:text-primary transition-colors"
              >
                Features
              </a>
            </li>
            <li>
              <Button 
                variant="outline" 
                onClick={() => navigate("/calculator")}
              >
                Calculator
              </Button>
            </li>
            <li>
              <Button 
                variant="outline" 
                onClick={() => navigate("/history")}
              >
                History
              </Button>
            </li>
          </ul>
        </nav>
        
        {/* Mobile Navigation */}
        <div className="md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-9 w-9">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col space-y-6 mt-8">
                <a 
                  href={window.location.pathname === "/" ? "#features" : "/"}
                  className="text-foreground hover:text-primary transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  Features
                </a>
                <Button 
                  variant="outline" 
                  onClick={() => navigateTo("/calculator")}
                  className="w-full justify-start"
                >
                  Calculator
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigateTo("/history")}
                  className="w-full justify-start"
                >
                  History
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}