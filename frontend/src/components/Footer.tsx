import React from "react";

export function Footer() {
  return (
    <footer className="border-t border-border py-8">
      <div className="container mx-auto px-4 text-center text-muted-foreground">
        <p>DriverPay &copy; {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}