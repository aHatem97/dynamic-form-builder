import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";

import {
  getFormById,
  getFormSubmissions,
  type SubmissionSummary,
} from "../services/forms.service";

function SubmissionsPage() {
  const navigate = useNavigate();
  const { formId } = useParams();

  const [formTitle, setFormTitle] = useState("");
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId) {
      return;
    }

    let cancelled = false;

    Promise.all([getFormById(formId), getFormSubmissions(formId)])
      .then(([form, submissionData]) => {
        if (!cancelled) {
          setFormTitle(form.title);
          setSubmissions(submissionData);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load submissions",
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
  }, [formId]);

  const displayError = !formId ? "Form not found" : error;

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

        {formId && loading && (
          <Typography
            sx={{
              color: "text.secondary",
            }}
          >
            Loading submissions...
          </Typography>
        )}

        {(!formId || (!loading && displayError)) && (
          <Paper
            variant="outlined"
            sx={{
              p: 4,
              borderRadius: 2,
            }}
          >
            <Typography
              variant="h5"
              sx={{
                fontWeight: 600,
                mb: 1,
              }}
            >
              Unable to load submissions
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

        {formId && !loading && !displayError && (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                }}
              >
                {formTitle}
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                  mt: 0.5,
                }}
              >
                {submissions.length}{" "}
                {submissions.length === 1 ? "submission" : "submissions"}
              </Typography>
            </Box>

            {submissions.length === 0 ? (
              <Paper
                variant="outlined"
                sx={{
                  p: 5,
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                  }}
                >
                  No submissions yet
                </Typography>

                <Typography
                  variant="body2"
                  sx={{
                    color: "text.secondary",
                  }}
                >
                  Responses will appear here once someone submits this form.
                </Typography>
              </Paper>
            ) : (
              <Stack spacing={2}>
                {submissions.map((submission, index) => (
                  <Paper
                    key={submission.id}
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
                        gap: 2,
                      }}
                    >
                      <Box>
                        <Typography
                          sx={{
                            fontWeight: 600,
                          }}
                        >
                          Submission #{submissions.length - index}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            mt: 0.5,
                          }}
                        >
                          {new Date(submission.submittedAt).toLocaleString()}
                        </Typography>

                        <Typography
                          variant="body2"
                          sx={{
                            color: "text.secondary",
                            mt: 0.5,
                          }}
                        >
                          {submission.answerCount}{" "}
                          {submission.answerCount === 1 ? "answer" : "answers"}
                        </Typography>
                      </Box>

                      <Button
                        variant="outlined"
                        startIcon={<VisibilityOutlinedIcon />}
                        onClick={() =>
                          navigate(
                            `/forms/${formId}/submissions/${submission.id}`,
                          )
                        }
                      >
                        View
                      </Button>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            )}
          </>
        )}
      </Container>
    </Box>
  );
}

export default SubmissionsPage;
