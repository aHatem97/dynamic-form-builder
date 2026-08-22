import { apiRequest } from "./api";

export interface FormSummary {
  id: string;
  title: string;
  status: "draft" | "published";
  publicSlug: string | null;
  questionCount: number;
  submissionCount: number;
  createdAt: string;
  updatedAt: string;
}

export type CreateQuestionType = "TEXT" | "MULTIPLE_CHOICE" | "FILE";

export interface CreateQuestionPayload {
  type: CreateQuestionType;
  label: string;
  required: boolean;
  options?: string[];
}

export interface CreateFormPayload {
  title: string;
  questions: CreateQuestionPayload[];
}

export function getForms() {
  return apiRequest<FormSummary[]>("/api/forms");
}

export function createForm(data: CreateFormPayload) {
  return apiRequest("/api/forms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}
