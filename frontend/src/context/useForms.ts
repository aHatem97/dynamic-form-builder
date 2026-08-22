import { useContext } from "react";

import { FormsContext } from "./forms-context";

export function useForms() {
  const context = useContext(FormsContext);

  if (!context) {
    throw new Error("useForms must be used inside a FormsProvider");
  }

  return context;
}
