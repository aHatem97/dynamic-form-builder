import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  FormControlLabel,
  IconButton,
  Switch,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";

import type { Question, QuestionType } from "../types/forms";

import {
  createForm,
  getFormById,
  updateForm,
  type ApiQuestionType,
  type CreateQuestionType,
} from "../services/forms.service";

function FormBuilderPage() {
  const navigate = useNavigate();
  const { formId } = useParams();

  const isEditMode = Boolean(formId);

  const [title, setTitle] = useState("Untitled Form");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] =
    useState<QuestionType>("text");

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [loadingForm, setLoadingForm] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: selectedQuestionType,
      label: "Untitled Question",
      required: false,
      options:
        selectedQuestionType === "multiple_choice"
          ? ["Option 1", "Option 2"]
          : undefined,
    };

    setQuestions((currentQuestions) => [...currentQuestions, newQuestion]);

    setQuestionDialogOpen(false);
    setSelectedQuestionType("text");
  };

  const handleUpdateQuestion = (
    questionId: string,
    updates: Partial<Question>,
  ) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) =>
        question.id === questionId ? { ...question, ...updates } : question,
      ),
    );
  };

  const handleDeleteQuestion = (questionId: string) => {
    setQuestions((currentQuestions) =>
      currentQuestions.filter((question) => question.id !== questionId),
    );
  };

  const handleMoveQuestion = (
    questionIndex: number,
    direction: "up" | "down",
  ) => {
    setQuestions((currentQuestions) => {
      const newIndex =
        direction === "up" ? questionIndex - 1 : questionIndex + 1;

      if (newIndex < 0 || newIndex >= currentQuestions.length) {
        return currentQuestions;
      }

      const reorderedQuestions = [...currentQuestions];

      [reorderedQuestions[questionIndex], reorderedQuestions[newIndex]] = [
        reorderedQuestions[newIndex],
        reorderedQuestions[questionIndex],
      ];

      return reorderedQuestions;
    });
  };

  const handleAddOption = (questionId: string) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) => {
        if (question.id !== questionId || question.type !== "multiple_choice") {
          return question;
        }

        const options = question.options ?? [];

        return {
          ...question,
          options: [...options, `Option ${options.length + 1}`],
        };
      }),
    );
  };

  const handleUpdateOption = (
    questionId: string,
    optionIndex: number,
    value: string,
  ) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) => {
        if (question.id !== questionId || question.type !== "multiple_choice") {
          return question;
        }

        const options = [...(question.options ?? [])];

        options[optionIndex] = value;

        return {
          ...question,
          options,
        };
      }),
    );
  };

  const handleRemoveOption = (questionId: string, optionIndex: number) => {
    setQuestions((currentQuestions) =>
      currentQuestions.map((question) => {
        if (question.id !== questionId || question.type !== "multiple_choice") {
          return question;
        }

        return {
          ...question,
          options: (question.options ?? []).filter(
            (_, index) => index !== optionIndex,
          ),
        };
      }),
    );
  };

  const handleSaveForm = async () => {
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return;
    }

    const typeMap: Record<QuestionType, CreateQuestionType> = {
      text: "TEXT",
      multiple_choice: "MULTIPLE_CHOICE",
      file: "FILE",
    };

    const payload = {
      title: trimmedTitle,
      questions: questions.map((question) => ({
        type: typeMap[question.type],
        label: question.label.trim(),
        required: question.required,
        options:
          question.type === "multiple_choice" ? question.options : undefined,
      })),
    };

    try {
      setSaving(true);
      setSaveError(null);

      if (isEditMode && formId) {
        await updateForm(formId, payload);
      } else {
        await createForm(payload);
      }

      navigate("/forms");
    } catch (error) {
      setSaveError(
        error instanceof Error
          ? error.message
          : isEditMode
            ? "Failed to update form"
            : "Failed to create form",
      );
    } finally {
      setSaving(false);
    }
  };

  const typeFromApi: Record<ApiQuestionType, QuestionType> = {
    TEXT: "text",
    MULTIPLE_CHOICE: "multiple_choice",
    FILE: "file",
  };

  useEffect(() => {
    if (!formId) {
      return;
    }

    const loadForm = async () => {
      try {
        setLoadingForm(true);
        setLoadError(null);

        const form = await getFormById(formId);

        setTitle(form.title);

        setQuestions(
          form.questions.map((question) => ({
            id: question.id,
            type: typeFromApi[question.type],
            label: question.label,
            required: question.required,
            options:
              question.type === "MULTIPLE_CHOICE"
                ? (question.options ?? [])
                : undefined,
          })),
        );
      } catch (error) {
        setLoadError(
          error instanceof Error ? error.message : "Failed to load form",
        );
      } finally {
        setLoadingForm(false);
      }
    };

    void loadForm();
  }, [formId]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
      }}
    >
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/forms")}
          sx={{ mb: 3 }}
        >
          Back to Forms
        </Button>

        <Stack
          sx={{
            mb: 4,
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              Form Builder
            </Typography>

            <Typography color="text.secondary">
              Create and configure your form.
            </Typography>
          </Box>

          <Typography
            variant="body2"
            sx={{
              px: 1.5,
              py: 0.75,
              bgcolor: "grey.200",
              borderRadius: 10,
            }}
          >
            Draft
          </Typography>
        </Stack>

        {loadingForm && (
          <Typography
            sx={{
              color: "text.secondary",
              mb: 2,
            }}
          >
            Loading form...
          </Typography>
        )}

        {loadError && (
          <Typography
            sx={{
              color: "error.main",
              mb: 2,
            }}
          >
            {loadError}
          </Typography>
        )}

        {!loadingForm && !loadError && (
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                mb: 2,
              }}
            >
              Form Details
            </Typography>

            <TextField
              fullWidth
              label="Form title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />

            <Divider sx={{ my: 4 }} />

            <Stack
              sx={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Questions
                </Typography>

                <Typography variant="body2" color="text.secondary">
                  Add questions to your form.
                </Typography>
              </Box>

              <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={() => setQuestionDialogOpen(true)}
              >
                Add Question
              </Button>
            </Stack>

            {questions.length === 0 ? (
              <Box
                sx={{
                  mt: 3,
                  p: 5,
                  textAlign: "center",
                  border: "1px dashed",
                  borderColor: "grey.300",
                  borderRadius: 2,
                }}
              >
                <Typography sx={{ color: "text.secondary" }}>
                  No questions yet. Add your first question.
                </Typography>
              </Box>
            ) : (
              <Stack sx={{ mt: 3, gap: 2 }}>
                {questions.map((question, index) => (
                  <Paper
                    key={question.id}
                    variant="outlined"
                    sx={{
                      p: 3,
                      borderRadius: 2,
                    }}
                  >
                    <Stack
                      sx={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        mb: 3,
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          Question {index + 1}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                          }}
                        >
                          {question.type === "text" && "Text Input"}
                          {question.type === "multiple_choice" &&
                            "Multiple Choice"}
                          {question.type === "file" && "File Upload"}
                        </Typography>
                      </Box>

                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <IconButton
                          aria-label="Move question up"
                          disabled={index === 0}
                          onClick={() => handleMoveQuestion(index, "up")}
                        >
                          <ArrowUpwardIcon />
                        </IconButton>

                        <IconButton
                          aria-label="Move question down"
                          disabled={index === questions.length - 1}
                          onClick={() => handleMoveQuestion(index, "down")}
                        >
                          <ArrowDownwardIcon />
                        </IconButton>

                        <IconButton
                          aria-label="Delete question"
                          onClick={() => handleDeleteQuestion(question.id)}
                        >
                          <DeleteOutlinedIcon />
                        </IconButton>

                        <FormControlLabel
                          control={
                            <Switch
                              checked={question.required}
                              onChange={(event) =>
                                handleUpdateQuestion(question.id, {
                                  required: event.target.checked,
                                })
                              }
                            />
                          }
                          label="Required"
                        />
                      </Stack>
                    </Stack>

                    <TextField
                      fullWidth
                      label={`Question${question.required ? " *" : ""}`}
                      value={question.label}
                      onChange={(event) =>
                        handleUpdateQuestion(question.id, {
                          label: event.target.value,
                        })
                      }
                    />

                    {question.type === "text" && (
                      <Box sx={{ mt: 3 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            mb: 1,
                          }}
                        >
                          Preview
                        </Typography>

                        <TextField
                          fullWidth
                          disabled
                          placeholder="Respondent enters text here"
                        />
                      </Box>
                    )}

                    {question.type === "multiple_choice" && (
                      <Box sx={{ mt: 3 }}>
                        <Typography
                          sx={{
                            fontWeight: 600,
                            mb: 1.5,
                          }}
                        >
                          Options
                        </Typography>

                        <Stack spacing={1.5}>
                          {(question.options ?? []).map(
                            (option, optionIndex) => (
                              <Stack
                                key={optionIndex}
                                sx={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 1,
                                }}
                              >
                                <TextField
                                  fullWidth
                                  size="small"
                                  value={option}
                                  onChange={(event) =>
                                    handleUpdateOption(
                                      question.id,
                                      optionIndex,
                                      event.target.value,
                                    )
                                  }
                                />

                                <IconButton
                                  onClick={() =>
                                    handleRemoveOption(question.id, optionIndex)
                                  }
                                  sx={{
                                    display:
                                      (question.options?.length ?? 0) <= 1
                                        ? "none"
                                        : "block",
                                  }}
                                >
                                  <DeleteOutlinedIcon />
                                </IconButton>
                              </Stack>
                            ),
                          )}
                        </Stack>

                        <Button
                          variant="text"
                          onClick={() => handleAddOption(question.id)}
                          sx={{
                            mt: 1.5,
                          }}
                        >
                          + Add Option
                        </Button>
                      </Box>
                    )}

                    {question.type === "file" && (
                      <Box sx={{ mt: 3 }}>
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            mb: 1,
                          }}
                        >
                          Preview
                        </Typography>

                        <Button variant="outlined" disabled>
                          Choose File
                        </Button>
                      </Box>
                    )}
                  </Paper>
                ))}
              </Stack>
            )}

            <Stack
              sx={{
                mt: 4,
                flexDirection: "row",
                justifyContent: "flex-end",
              }}
            >
              <Button
                variant="contained"
                onClick={handleSaveForm}
                disabled={
                  saving ||
                  loadingForm ||
                  !title.trim() ||
                  questions.some((question) => !question.label.trim())
                }
              >
                {saving
                  ? isEditMode
                    ? "Saving..."
                    : "Creating..."
                  : isEditMode
                    ? "Save Changes"
                    : "Create Form"}
              </Button>
            </Stack>

            {saveError && (
              <Typography
                variant="body2"
                sx={{
                  color: "error.main",
                  mt: 2,
                  textAlign: "right",
                }}
              >
                {saveError}
              </Typography>
            )}
          </Paper>
        )}
      </Container>

      <Dialog
        open={questionDialogOpen}
        onClose={() => setQuestionDialogOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Add Question</DialogTitle>

        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="question-type-label">Question type</InputLabel>

            <Select
              labelId="question-type-label"
              value={selectedQuestionType}
              label="Question type"
              onChange={(event) =>
                setSelectedQuestionType(event.target.value as QuestionType)
              }
            >
              <MenuItem value="text">Text Input</MenuItem>

              <MenuItem value="multiple_choice">Multiple Choice</MenuItem>

              <MenuItem value="file">File Upload</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setQuestionDialogOpen(false)}>Cancel</Button>

          <Button variant="contained" onClick={handleAddQuestion}>
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FormBuilderPage;
