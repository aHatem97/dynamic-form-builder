import { useState } from "react";
import { useNavigate } from "react-router-dom";

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
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";

import type { Question, QuestionType } from "../types/forms";

function FormBuilderPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("Untitled Form");

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [selectedQuestionType, setSelectedQuestionType] =
    useState<QuestionType>("text");

  const handleAddQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: selectedQuestionType,
      label: "Untitled Question",
      required: false,
      options:
        selectedQuestionType === "multiple_choice" ? ["Option 1"] : undefined,
    };

    setQuestions((currentQuestions) => [...currentQuestions, newQuestion]);

    setQuestionDialogOpen(false);
    setSelectedQuestionType("text");
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
                  <Typography
                    sx={{
                      fontWeight: 600,
                      mb: 1,
                    }}
                  >
                    Question {index + 1}
                  </Typography>

                  <Typography>{question.label}</Typography>

                  <Typography
                    variant="body2"
                    sx={{
                      color: "text.secondary",
                      mt: 1,
                    }}
                  >
                    {question.type === "text" && "Text Input"}

                    {question.type === "multiple_choice" && "Multiple Choice"}

                    {question.type === "file" && "File Upload"}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
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
