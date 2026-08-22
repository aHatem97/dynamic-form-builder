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

import { getPublicForm, type PublicForm } from "../services/forms.service";

function PublicFormPage() {
  const { slug } = useParams();

  const [form, setForm] = useState<PublicForm | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

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

        {slug && !loading && !displayError && form && (
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
                    <TextField fullWidth placeholder="Enter your answer" />
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

                      <RadioGroup>
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
                    <Button component="label" variant="outlined">
                      Choose File
                      <input hidden type="file" />
                    </Button>
                  )}
                </Box>
              ))}
            </Stack>
          </Paper>
        )}
      </Container>
    </Box>
  );
}

export default PublicFormPage;
