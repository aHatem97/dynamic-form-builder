import { useEffect, useState } from "react";
import { Container, Typography, Chip, Stack } from "@mui/material";

import { getHealth } from "./lib/api";

function App() {
  const [apiStatus, setApiStatus] = useState<
    "checking" | "connected" | "error"
  >("checking");

  useEffect(() => {
    getHealth()
      .then(() => {
        setApiStatus("connected");
      })
      .catch(() => {
        setApiStatus("error");
      });
  }, []);

  return (
    <Container sx={{ py: 8 }}>
      <Stack spacing={2}>
        <Typography variant="h3" sx={{ fontWeight: 700 }}>
          Dynamic Form Builder
        </Typography>

        <Typography color="text.secondary">React + Fastify</Typography>

        <Chip
          label={
            apiStatus === "checking"
              ? "Checking API..."
              : apiStatus === "connected"
                ? "API Connected"
                : "API Connection Failed"
          }
          color={
            apiStatus === "connected"
              ? "success"
              : apiStatus === "error"
                ? "error"
                : "default"
          }
          sx={{ width: "fit-content" }}
        />
      </Stack>
    </Container>
  );
}

export default App;
