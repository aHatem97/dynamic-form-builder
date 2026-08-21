export type FormStatus = "draft" | "published";

export interface Form {
  id: string;
  title: string;
  status: FormStatus;
  questionCount: number;
  submissionCount: number;
}

export type QuestionType = "text" | "multiple_choice" | "file";

export interface Question {
  id: string;
  type: QuestionType;
  label: string;
  required: boolean;
  options?: string[];
}
