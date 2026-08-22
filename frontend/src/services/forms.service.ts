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

export interface UpdateFormStatusResponse {
  id: string;
  title: string;
  status: "draft" | "published";
  publicSlug: string | null;
}

export interface PublicFormQuestion {
  id: string;
  type: ApiQuestionType;
  label: string;
  required: boolean;
  options: string[] | null;
  position: number;
}

export interface PublicForm {
  id: string;
  title: string;
  questions: PublicFormQuestion[];
}

export interface SubmitAnswerPayload {
  questionId: string;
  value: string;
}

export interface SubmitFormPayload {
  answers: SubmitAnswerPayload[];
}

export interface SubmitFormResponse {
  id: string;
  submittedAt: string;
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

export function updateFormStatus(id: string, status: "draft" | "published") {
  return apiRequest<UpdateFormStatusResponse>(`/api/forms/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function getPublicForm(slug: string) {
  return apiRequest<PublicForm>(`/api/public/forms/${slug}`);
}

export function submitPublicForm(slug: string, data: FormData) {
  return apiRequest<SubmitFormResponse>(
    `/api/public/forms/${slug}/submissions`,
    {
      method: "POST",
      body: data,
    },
  );
}
