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
import DownloadOutlinedIcon from "@mui/icons-material/DownloadOutlined";

import {
  getSubmissionDetails,
  getSubmissionFileDownloadUrl,
  type SubmissionDetails,
} from "../services/forms.service";

function SubmissionDetailsPage() {
  const navigate = useNavigate();

  const { formId, submissionId } = useParams();

  const [submission, setSubmission] = useState<SubmissionDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [downloadingAnswerId, setDownloadingAnswerId] = useState<string | null>(
    null,
  );
  const [downloadError, setDownloadError] = useState<{
    answerId: string;
    message: string;
  } | null>(null);

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

  const handleDownloadFile = async (answerId: string) => {
    if (!formId || !submissionId) {
      return;
    }

    try {
      setDownloadingAnswerId(answerId);
      setDownloadError(null);

      const data = await getSubmissionFileDownloadUrl(
        formId,
        submissionId,
        answerId,
      );

      const link = document.createElement("a");

      link.href = data.url;
      link.target = "_blank";
      link.rel = "noopener noreferrer";

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      setDownloadError({
        answerId,
        message:
          error instanceof Error ? error.message : "Failed to download file",
      });
    } finally {
      setDownloadingAnswerId(null);
    }
  };

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
                    <>
                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                        }}
                      >
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

                        <Button
                          variant="outlined"
                          size="small"
                          startIcon={<DownloadOutlinedIcon />}
                          disabled={downloadingAnswerId === answer.id}
                          onClick={() => handleDownloadFile(answer.id)}
                        >
                          {downloadingAnswerId === answer.id
                            ? "Downloading..."
                            : "Download"}
                        </Button>
                      </Stack>

                      {downloadError?.answerId === answer.id && (
                        <Typography
                          variant="body2"
                          sx={{
                            color: "error.main",
                            mt: 1.5,
                          }}
                        >
                          {downloadError.message}
                        </Typography>
                      )}
                    </>
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
