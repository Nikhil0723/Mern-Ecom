
import React from "react";
import AppRoutes from "@/routes/AppRoutes";
import ApiInspector from "@/components/devtools/ApiInspector";

const App = () => {
  return (
    <>
      <AppRoutes />
      <ApiInspector />
    </>
  );
};

export default App;
