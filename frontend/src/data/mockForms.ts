import type { Form } from "../types/forms";

export const mockForms: Form[] = [
  {
    id: "1",
    title: "Customer Feedback",
    status: "published",
    submissionCount: 4,
    questions: [
      {
        id: "q1",
        type: "text",
        label: "What is your name?",
        required: true,
      },
      {
        id: "q2",
        type: "multiple_choice",
        label: "How satisfied are you?",
        required: true,
        options: ["Very satisfied", "Satisfied", "Neutral", "Unsatisfied"],
      },
      {
        id: "q3",
        type: "file",
        label: "Upload a screenshot",
        required: false,
      },
    ],
  },
  {
    id: "2",
    title: "Job Application",
    status: "draft",
    submissionCount: 0,
    questions: [
      {
        id: "q4",
        type: "text",
        label: "What is your full name?",
        required: true,
      },
      {
        id: "q5",
        type: "file",
        label: "Upload your CV",
        required: true,
      },
    ],
  },
];
