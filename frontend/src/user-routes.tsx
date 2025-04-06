
// THIS FILE IS AUTOGENERATED WHEN PAGES ARE UPDATED
import { lazy } from "react";
import { RouteObject } from "react-router";



const App = lazy(() => import("./pages/App.tsx"));
const Calculator = lazy(() => import("./pages/Calculator.tsx"));
const History = lazy(() => import("./pages/History.tsx"));

export const userRoutes: RouteObject[] = [

	{ path: "/", element: <App />},
	{ path: "/calculator", element: <Calculator />},
	{ path: "/history", element: <History />},

];
