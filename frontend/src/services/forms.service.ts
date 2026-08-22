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

export function getForms() {
  return apiRequest<FormSummary[]>("/api/forms");
}
