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

import { useNavigate } from "react-router-dom";

const forms = [
  {
    id: "1",
    title: "Customer Feedback",
    status: "published",
    questionCount: 3,
    submissionCount: 4,
  },
  {
    id: "2",
    title: "Job Application",
    status: "draft",
    questionCount: 2,
    submissionCount: 0,
  },
];

function FormsPage() {
  const navigate = useNavigate();

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
            justifyConent: "space-between",
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

          <Button variant="contained" startIcon={<AddIcon />}>
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
                  mb: 4,
                  direction: "row",
                  justifyConent: "space-between",
                  alignItems: "center",
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
