import { useState, type ReactNode } from "react";

import { mockForms } from "../data/mockForms";
import type { Form } from "../types/forms";
import { FormsContext } from "./forms-context";

interface FormsProviderProps {
  children: ReactNode;
}

export function FormsProvider({ children }: FormsProviderProps) {
  const [forms, setForms] = useState<Form[]>(mockForms);

  const createForm = (form: Form) => {
    setForms((currentForms) => [...currentForms, form]);
  };

  return (
    <FormsContext.Provider
      value={{
        forms,
        createForm,
      }}
    >
      {children}
    </FormsContext.Provider>
  );
}
