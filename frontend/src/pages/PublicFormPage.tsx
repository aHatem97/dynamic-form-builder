import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import {
  getPublicForm,
  submitPublicForm,
  type PublicForm,
} from "../services/forms.service";

function PublicFormPage() {
  const { slug } = useParams();

  const [form, setForm] = useState<PublicForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | null>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!slug) {
      return;
    }

    let cancelled = false;

    getPublicForm(slug)
      .then((data) => {
        if (!cancelled) {
          setForm(data);
          setError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setError(
            error instanceof Error ? error.message : "Failed to load form",
          );
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  const displayError = !slug ? "Form not found" : error;

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((currentAnswers) => ({
      ...currentAnswers,
      [questionId]: value,
    }));
  };

  const handleFileChange = (questionId: string, file: File | null) => {
    setFiles({
      [questionId]: file,
    });
  };

  const handleSubmit = async () => {
    if (!form || !slug) {
      return;
    }

    const missingRequiredQuestion = form.questions.find((question) => {
      if (!question.required) {
        return false;
      }

      if (question.type === "FILE") {
        return !files[question.id];
      }

      return !answers[question.id]?.trim();
    });

    if (missingRequiredQuestion) {
      setSubmitError(`"${missingRequiredQuestion.label}" is required`);
      return;
    }

    try {
      setSubmitting(true);
      setSubmitError(null);

      const formData = new FormData();

      const answerPayload = form.questions
        .filter((question) => question.type !== "FILE")
        .map((question) => ({
          questionId: question.id,
          value: answers[question.id]?.trim() ?? "",
        }))
        .filter((answer) => answer.value !== "");

      formData.append("answers", JSON.stringify(answerPayload));

      for (const question of form.questions) {
        if (question.type !== "FILE") {
          continue;
        }

        const file = files[question.id];

        if (file) {
          formData.append(question.id, file);
        }
      }

      await submitPublicForm(slug, formData);

      setSubmitted(true);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : "Failed to submit form",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
      }}
    >
      <Container
        maxWidth="sm"
        sx={{
          py: 6,
        }}
      >
        {slug && loading && (
          <Typography
            sx={{
              color: "text.secondary",
              textAlign: "center",
            }}
          >
            Loading form...
          </Typography>
        )}

        {(!slug || (!loading && displayError)) && (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 1,
              }}
            >
              Form unavailable
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
              }}
            >
              {displayError}
            </Typography>
          </Paper>
        )}

        {slug && !loading && !displayError && form && !submitted && (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 2,
            }}
          >
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                }}
              >
                {form.title}
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                  mt: 1,
                }}
              >
                Please complete the form below.
              </Typography>
            </Box>

            <Stack spacing={4}>
              {form.questions.map((question, index) => (
                <Box key={question.id}>
                  <Typography
                    sx={{
                      fontWeight: 600,
                      mb: 1.5,
                    }}
                  >
                    {index + 1}. {question.label}
                    {question.required && (
                      <Box
                        component="span"
                        sx={{
                          color: "error.main",
                        }}
                      >
                        {" "}
                        *
                      </Box>
                    )}
                  </Typography>

                  {question.type === "TEXT" && (
                    <TextField
                      fullWidth
                      placeholder="Enter your answer"
                      value={answers[question.id] ?? ""}
                      onChange={(event) =>
                        handleAnswerChange(question.id, event.target.value)
                      }
                    />
                  )}

                  {question.type === "MULTIPLE_CHOICE" && (
                    <FormControl>
                      <FormLabel
                        sx={{
                          display: "none",
                        }}
                      >
                        {question.label}
                      </FormLabel>

                      <RadioGroup
                        value={answers[question.id] ?? ""}
                        onChange={(event) =>
                          handleAnswerChange(question.id, event.target.value)
                        }
                      >
                        {(question.options ?? []).map((option) => (
                          <FormControlLabel
                            key={option}
                            value={option}
                            control={<Radio />}
                            label={option}
                          />
                        ))}
                      </RadioGroup>
                    </FormControl>
                  )}

                  {question.type === "FILE" && (
                    <Stack
                      sx={{
                        alignItems: "flex-start",
                        gap: 1,
                      }}
                    >
                      <Button component="label" variant="outlined">
                        Choose File
                        <input
                          hidden
                          type="file"
                          onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;

                            handleFileChange(question.id, file);
                          }}
                        />
                      </Button>

                      {files[question.id] && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                          }}
                        >
                          {files[question.id]?.name}
                        </Typography>
                      )}
                    </Stack>
                  )}
                </Box>
              ))}
            </Stack>

            {submitError && (
              <Typography
                variant="body2"
                sx={{
                  color: "error.main",
                  mt: 3,
                }}
              >
                {submitError}
              </Typography>
            )}

            <Button
              fullWidth
              variant="contained"
              disabled={submitting}
              onClick={handleSubmit}
              sx={{
                mt: 4,
              }}
            >
              {submitting ? "Submitting..." : "Submit"}
            </Button>
          </Paper>
        )}

        {submitted && (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: "center",
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                mb: 1,
              }}
            >
              Thank you!
            </Typography>

            <Typography
              sx={{
                color: "text.secondary",
              }}
            >
              Your response has been submitted successfully.
            </Typography>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default PublicFormPage;
