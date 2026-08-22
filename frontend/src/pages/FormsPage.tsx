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
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

import { useNavigate } from "react-router-dom";

import {
  deleteForm,
  getForms,
  updateFormStatus,
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

  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const [statusError, setStatusError] = useState<{
    formId: string;
    message: string;
  } | null>(null);

  const [copiedFormId, setCopiedFormId] = useState<string | null>(null);

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

  const handleStatusChange = async (form: FormSummary) => {
    const newStatus = form.status === "published" ? "draft" : "published";

    try {
      setUpdatingStatusId(form.id);
      setStatusError(null);

      const updatedForm = await updateFormStatus(form.id, newStatus);

      setForms((currentForms) =>
        currentForms.map((currentForm) =>
          currentForm.id === form.id
            ? {
                ...currentForm,
                status: updatedForm.status,
                publicSlug: updatedForm.publicSlug,
              }
            : currentForm,
        ),
      );
    } catch (error) {
      setStatusError({
        formId: form.id,
        message:
          error instanceof Error
            ? error.message
            : "Failed to update form status",
      });
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const handleCopyPublicLink = async (formId: string, publicSlug: string) => {
    const publicUrl = `${window.location.origin}/f/${publicSlug}`;

    await navigator.clipboard.writeText(publicUrl);

    setCopiedFormId(formId);

    setTimeout(() => {
      setCopiedFormId(null);
    }, 2000);
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

                  <Button
                    size="small"
                    variant={
                      form.status === "published" ? "outlined" : "contained"
                    }
                    disabled={updatingStatusId === form.id}
                    onClick={() => handleStatusChange(form)}
                  >
                    {updatingStatusId === form.id
                      ? "Updating..."
                      : form.status === "published"
                        ? "Unpublish"
                        : "Publish"}
                  </Button>
                </Stack>

                {statusError?.formId === form.id ? (
                  <Box
                    sx={{
                      mt: 2,
                      p: 1.5,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "error.light",
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        color: "error.main",
                        fontWeight: 500,
                      }}
                    >
                      {statusError.message}
                    </Typography>
                  </Box>
                ) : (
                  form.status === "published" &&
                  form.publicSlug && (
                    <Box
                      sx={{
                        mt: 2,
                        p: 1.5,
                        bgcolor: "grey.50",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "grey.200",
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          mb: 0.5,
                        }}
                      >
                        Public URL
                      </Typography>

                      <Stack
                        sx={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            flex: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {`${window.location.origin}/f/${form.publicSlug}`}
                        </Typography>

                        <Button
                          size="small"
                          startIcon={<ContentCopyIcon />}
                          onClick={() =>
                            handleCopyPublicLink(form.id, form.publicSlug!)
                          }
                        >
                          {copiedFormId === form.id ? "Copied" : "Copy"}
                        </Button>
                      </Stack>
                    </Box>
                  )
                )}
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
