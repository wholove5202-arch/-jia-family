
import React from "react";
import AppErrorBoundary from "./src/AppErrorBoundary";
import IntegratedPhase1App from "./src/IntegratedPhase1App";
export default function App(){
 return <AppErrorBoundary><IntegratedPhase1App/></AppErrorBoundary>;
}
