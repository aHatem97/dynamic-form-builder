import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ListAltIcon from "@mui/icons-material/ListAlt";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { mockForms } from "../data/mockForms";
import type { Form } from "../types/forms";

function FormsPage() {
  const navigate = useNavigate();

  const [forms, setForms] = useState<Form[]>(mockForms);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "grey.50",
      }}
    >
      <Container maxWidth="md" sx={{ py: 5 }}>
        <Stack
          sx={{
            mb: 4,
            direction: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 700 }}>
              My Forms
            </Typography>

            <Typography color="text.secondary">
              Create and manage your forms.
            </Typography>
          </Box>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate("/forms/create")}
          >
            New Form
          </Button>
        </Stack>

        <Stack spacing={2}>
          {forms.map((form) => (
            <Paper
              key={form.id}
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 2,
              }}
            >
              <Stack
                sx={{
                  direction: "row",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  spacing: 2,
                }}
              >
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {form.title}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 0.5 }}
                  >
                    {form.questionCount} questions · {form.submissionCount}{" "}
                    submissions
                  </Typography>
                </Box>

                <Chip
                  size="small"
                  label={form.status === "published" ? "Published" : "Draft"}
                  color={form.status === "published" ? "success" : "default"}
                />
              </Stack>

              <Stack direction="row" spacing={1} sx={{ mt: 3 }}>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => navigate(`/forms/${form.id}/edit`)}
                >
                  Edit
                </Button>

                <Button
                  size="small"
                  startIcon={<ListAltIcon />}
                  onClick={() => navigate(`/forms/${form.id}/submissions`)}
                >
                  Submissions
                </Button>
              </Stack>
            </Paper>
          ))}
        </Stack>
      </Container>
    </Box>
  );
}

export default FormsPage;
