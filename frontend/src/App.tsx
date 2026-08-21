import { Navigate, Route, Routes } from "react-router-dom";

import FormsPage from "./pages/FormsPage";
import FormBuilderPage from "./pages/FormBuilderPage";
import PublicFormPage from "./pages/PublicFormPage";
import SubmissionsPage from "./pages/SubmissionsPage";
import SubmissionDetailsPage from "./pages/SubmissionDetailsPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/forms" replace />} />

      <Route path="/forms" element={<FormsPage />} />

      <Route path="/forms/:formId/edit" element={<FormBuilderPage />} />

      <Route path="/forms/:formId/submissions" element={<SubmissionsPage />} />

      <Route
        path="/forms/:formId/submissions/:submissionId"
        element={<SubmissionDetailsPage />}
      />

      <Route path="/f/:slug" element={<PublicFormPage />} />
    </Routes>
  );
}

export default App;
