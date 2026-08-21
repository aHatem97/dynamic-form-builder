export type FormStatus = "draft" | "published";

export interface Form {
  id: string;
  title: string;
  status: FormStatus;
  questionCount: number;
  submissionCount: number;
}
