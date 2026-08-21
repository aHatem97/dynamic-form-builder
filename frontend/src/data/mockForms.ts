import type { Form } from "../types/forms";

export const mockForms: Form[] = [
  {
    id: "1",
    title: "Customer Feedback",
    status: "published",
    questionCount: 3,
    submissionCount: 4,
  },
  {
    id: "2",
    title: "Job Application",
    status: "draft",
    questionCount: 2,
    submissionCount: 0,
  },
];
