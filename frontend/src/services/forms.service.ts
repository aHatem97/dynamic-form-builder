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

export type ApiQuestionType = "TEXT" | "MULTIPLE_CHOICE" | "FILE";

export interface FormQuestionResponse {
  id: string;
  formId: string;
  type: ApiQuestionType;
  label: string;
  required: boolean;
  options: string[] | null;
  position: number;
}

export interface FormDetails {
  id: string;
  title: string;
  status: "DRAFT" | "PUBLISHED";
  publicSlug: string | null;
  createdAt: string;
  updatedAt: string;
  questions: FormQuestionResponse[];
}

export function getForms() {
  return apiRequest<FormSummary[]>("/api/forms");
}

export function getFormById(id: string) {
  return apiRequest<FormDetails>(`/api/forms/${id}`);
}

export function createForm(data: CreateFormPayload) {
  return apiRequest("/api/forms", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export function updateForm(id: string, data: CreateFormPayload) {
  return apiRequest<FormDetails>(`/api/forms/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export function deleteForm(id: string) {
  return apiRequest<void>(`/api/forms/${id}`, {
    method: "DELETE",
  });
}
