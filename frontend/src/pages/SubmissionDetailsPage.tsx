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
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";

import {
  getSubmissionDetails,
  type SubmissionDetails,
} from "../services/forms.service";

function SubmissionDetailsPage() {
  const navigate = useNavigate();

  const { formId, submissionId } = useParams();

  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!formId || !submissionId) {
      return;
    }

    let cancelled = false;

    getSubmissionDetails(formId, submissionId)
      .then((data) => {
        if (!cancelled) {
          setSubmission(data);
          setError(null);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Failed to load submission",
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
  }, [formId, submissionId]);

  const displayError =
    !formId || !submissionId ? "Submission not found" : error;

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
          onClick={() =>
            formId
              ? navigate(`/forms/${formId}/submissions`)
              : navigate("/forms")
          }
          sx={{
            mb: 3,
          }}
        >
          Back to Submissions
        </Button>

        {formId && submissionId && loading && (
          <Typography
            sx={{
              color: "text.secondary",
            }}
          >
            Loading submission...
          </Typography>
        )}

        {(!formId || !submissionId || (!loading && displayError)) && (
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
              Unable to load submission
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

        {formId && submissionId && !loading && !displayError && submission && (
          <>
            <Box sx={{ mb: 4 }}>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 700,
                }}
              >
                {submission.form.title}
              </Typography>

              <Typography
                sx={{
                  color: "text.secondary",
                  mt: 0.5,
                }}
              >
                Submitted {new Date(submission.submittedAt).toLocaleString()}
              </Typography>
            </Box>

            <Stack spacing={2}>
              {submission.answers.map((answer, index) => (
                <Paper
                  key={answer.id}
                  variant="outlined"
                  sx={{
                    p: 3,
                    borderRadius: 2,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mb: 0.75,
                    }}
                  >
                    Question {index + 1}
                  </Typography>

                  <Typography
                    sx={{
                      fontWeight: 600,
                      mb: 1.5,
                    }}
                  >
                    {answer.question.label}
                  </Typography>

                  {answer.file ? (
                    <Stack
                      sx={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 1,
                      }}
                    >
                      <InsertDriveFileOutlinedIcon
                        sx={{
                          color: "text.secondary",
                        }}
                      />

                      <Box>
                        <Typography>{answer.file.name}</Typography>

                        {answer.file.type && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "text.secondary",
                            }}
                          >
                            {answer.file.type}
                          </Typography>
                        )}
                      </Box>
                    </Stack>
                  ) : (
                    <Typography>{answer.value || "No answer"}</Typography>
                  )}
                </Paper>
              ))}
            </Stack>
          </>
        )}
      </Container>
    </Box>
  );
}

export default SubmissionDetailsPage;
