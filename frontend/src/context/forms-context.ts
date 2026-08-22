import { createContext } from "react";

import type { Form } from "../types/forms";

export interface FormsContextValue {
  forms: Form[];
  createForm: (form: Form) => void;
}

export const FormsContext = createContext<FormsContextValue | undefined>(
  undefined,
);
