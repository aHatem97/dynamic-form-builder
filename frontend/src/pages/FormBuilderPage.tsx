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
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import AddIcon from "@mui/icons-material/Add";

function FormBuilderPage() {
  const navigate = useNavigate();

  const [title, setTitle] = useState("Untitled Form");

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
            direction: "row",
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
              direction: "row",
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

            <Button variant="outlined" startIcon={<AddIcon />}>
              Add Question
            </Button>
          </Stack>

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
            <Typography color="text.secondary">
              No questions yet. Add your first question.
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default FormBuilderPage;
