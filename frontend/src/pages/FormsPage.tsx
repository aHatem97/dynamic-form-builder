import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { useEffect, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import ListAltIcon from "@mui/icons-material/ListAlt";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";

import { useNavigate } from "react-router-dom";

import {
  deleteForm,
  getForms,
  type FormSummary,
} from "../services/forms.service";

function FormsPage() {
  const navigate = useNavigate();

  const [forms, setForms] = useState<FormSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formToDelete, setFormToDelete] = useState<FormSummary | null>(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const loadForms = async () => {
      try {
        const data = await getForms();
        setForms(data);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : "Failed to load forms",
        );
      } finally {
        setLoading(false);
      }
    };

    void loadForms();
  }, []);

  const handleDeleteForm = async () => {
    if (!formToDelete) {
      return;
    }

    try {
      setDeleting(true);
      setDeleteError(null);

      await deleteForm(formToDelete.id);

      setForms((currentForms) =>
        currentForms.filter((form) => form.id !== formToDelete.id),
      );

      setFormToDelete(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "Failed to delete form",
      );
    } finally {
      setDeleting(false);
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

        {loading && (
          <Typography sx={{ color: "text.secondary" }}>
            Loading forms...
          </Typography>
        )}

        {error && <Typography sx={{ color: "error.main" }}>{error}</Typography>}

        {!loading && !error && (
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
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: 2,
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

                <Stack sx={{ mt: 3, flexDirection: "row", gap: 1 }}>
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

                  <Button
                    size="small"
                    startIcon={<DeleteOutlinedIcon />}
                    onClick={() => setFormToDelete(form)}
                    sx={{
                      color: "error.main",
                    }}
                  >
                    Delete
                  </Button>
                </Stack>
              </Paper>
            ))}
          </Stack>
        )}
      </Container>

      <Dialog
        open={Boolean(formToDelete)}
        onClose={() => {
          if (!deleting) {
            setFormToDelete(null);
            setDeleteError(null);
          }
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Delete Form</DialogTitle>

        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>{formToDelete?.title}</strong>?
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "text.secondary",
              mt: 1,
            }}
          >
            This action cannot be undone.
          </Typography>

          {deleteError && (
            <Typography
              variant="body2"
              sx={{
                color: "error.main",
                mt: 2,
              }}
            >
              {deleteError}
            </Typography>
          )}
        </DialogContent>

        <DialogActions>
          <Button
            disabled={deleting}
            onClick={() => {
              setFormToDelete(null);
              setDeleteError(null);
            }}
          >
            Cancel
          </Button>

          <Button
            variant="contained"
            disabled={deleting}
            onClick={handleDeleteForm}
            sx={{
              bgcolor: "error.main",
              "&:hover": {
                bgcolor: "error.dark",
              },
            }}
          >
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default FormsPage;
