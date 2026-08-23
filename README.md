# Dynamic Form Builder

A full-stack dynamic form builder built with **React + TypeScript** on the frontend and **Fastify + TypeScript** on the backend.

The application allows form creators to build configurable forms, publish them through unique public URLs, collect responses including file uploads, and review submitted answers.

## Live Demo

**Live Application:** `ADD_LIVE_FRONTEND_URL_HERE`

**GitHub Repository:** `ADD_GITHUB_REPOSITORY_URL_HERE`

> The live URL will be added after deployment.

---

## Features

### Form Management

- Create new forms
- View all forms
- Rename and edit existing forms
- Delete forms
- Draft and Published form states
- Publish forms using a unique public URL
- Unpublish and republish forms

### Dynamic Form Builder

Forms support the following question types:

- Text Input
- Multiple Choice
- File Upload

Questions can also be:

- Added
- Edited
- Deleted
- Reordered
- Marked as required

Multiple-choice questions support configurable options.

For this implementation, each form can contain a maximum of **one File Upload question**.

### Public Forms

Published forms receive a unique public URL such as:

`/f/:slug`

The public form page:

- Does not require authentication
- Displays the latest active questions
- Validates required questions
- Validates multiple-choice values
- Supports file uploads
- Stores submitted responses

Draft forms are not accessible through their public URLs.

### Submission Management

Each form includes a submissions dashboard where form creators can:

- View all submissions
- See submission dates
- See the number of submitted answers
- Open individual submissions
- View text and multiple-choice responses
- Access uploaded files

Uploaded files are stored privately in **Amazon S3** and accessed using short-lived signed download URLs.

### Submission History

Questions removed from a form are archived rather than immediately deleted.

This allows previously submitted answers to remain accessible even after the form structure changes.

---

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- React Router
- Material UI

### Backend

- Node.js
- Fastify
- TypeScript
- Prisma ORM

### Database

- MySQL / MariaDB

### File Storage

- Amazon S3
- AWS SDK
- Signed S3 download URLs

---

## Project Structure

```text
dynamic-form-builder/
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── FormsPage.tsx
│   │   │   ├── FormBuilderPage.tsx
│   │   │   ├── PublicFormPage.tsx
│   │   │   ├── SubmissionsPage.tsx
│   │   │   └── SubmissionDetailsPage.tsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── forms.service.ts
│   │   │
│   │   ├── types/
│   │   │   └── forms.ts
│   │   │
│   │   ├── App.tsx
│   │   └── main.tsx
│   │
│   └── package.json
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   │
│   ├── src/
│   │   ├── config/
│   │   │   ├── prisma.ts
│   │   │   └── s3.ts
│   │   │
│   │   ├── routes/
│   │   │   └── forms.ts
│   │   │
│   │   ├── app.ts
│   │   └── server.ts
│   │
│   ├── prisma.config.ts
│   └── package.json
│
├── package.json
└── README.md
```

---

## Prerequisites

Before running the project locally, make sure you have:

- Node.js installed
- npm installed
- MySQL or MariaDB running
- An AWS account
- A private Amazon S3 bucket
- AWS credentials with permission to upload and read objects from that bucket

---

## Installation

Clone the repository:

```bash
git clone YOUR_REPOSITORY_URL
cd dynamic-form-builder
```

Install the root dependencies:

```bash
npm install
```

Install backend dependencies:

```bash
cd backend
npm install
```

Install frontend dependencies:

```bash
cd ../frontend
npm install
```

Return to the project root:

```bash
cd ..
```

---

## Environment Variables

Environment files are not committed to the repository.

Example environment files are provided using `.env.example`.

### Backend

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL="mysql://USERNAME:PASSWORD@localhost:3306/dynamic_form_builder"

FRONTEND_URL="http://localhost:5173"

AWS_REGION="YOUR_AWS_REGION"
AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
AWS_S3_BUCKET="YOUR_S3_BUCKET_NAME"
```

Never commit real AWS credentials or database passwords.

### Frontend

Create:

```text
frontend/.env
```

Example:

```env
VITE_API_URL="http://localhost:3000"
```

---

## Database Setup

Create a MySQL database:

```sql
CREATE DATABASE dynamic_form_builder;
```

Make sure `DATABASE_URL` in `backend/.env` points to that database.

Then enter the backend directory:

```bash
cd backend
```

Generate the Prisma client:

```bash
npx prisma generate
```

Run the migrations:

```bash
npx prisma migrate dev
```

The database tables will be created from the Prisma schema.

---

## Amazon S3 Setup

Create an Amazon S3 bucket for uploaded files.

The bucket should remain **private**.

Block Public Access should remain enabled.

The backend IAM credentials need access to the bucket objects.

An example IAM policy is:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject"
      ],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

Uploaded files are not exposed publicly.

When a form creator requests a submitted file, the backend generates a temporary signed S3 URL.

---

## Running the Application

From the root project directory:

```bash
npm run dev
```

The frontend should be available at:

```text
http://localhost:5173
```

The backend should be available at:

```text
http://localhost:3000
```

If preferred, the frontend and backend can also be started separately from their respective directories.

---

## Building the Project

Build the complete project from the root:

```bash
npm run build
```

Frontend build:

```bash
cd frontend
npm run build
```

Backend build:

```bash
cd backend
npm run build
```

The backend build also generates the Prisma client.

---

## Main Application Routes

| Route | Description |
|---|---|
| `/forms` | Forms dashboard |
| `/forms/create` | Create a new form |
| `/forms/:formId/edit` | Edit a form |
| `/forms/:formId/submissions` | View submissions |
| `/forms/:formId/submissions/:submissionId` | View submission details |
| `/f/:slug` | Public published form |

---

## Main API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/forms` | List forms |
| `POST` | `/api/forms` | Create a form |
| `GET` | `/api/forms/:id` | Get form details |
| `PUT` | `/api/forms/:id` | Update a form |
| `DELETE` | `/api/forms/:id` | Delete a form |
| `PATCH` | `/api/forms/:id/status` | Publish or unpublish a form |
| `GET` | `/api/public/forms/:slug` | Get a published public form |
| `POST` | `/api/public/forms/:slug/submissions` | Submit a public form |
| `GET` | `/api/forms/:id/submissions` | List form submissions |
| `GET` | `/api/forms/:formId/submissions/:submissionId` | View submission details |
| `GET` | `/api/forms/:formId/submissions/:submissionId/answers/:answerId/file` | Generate file download URL |

---

## Validation

Validation is performed on both the frontend and backend.

The backend validates:

- Form titles
- Question labels
- Multiple-choice options
- Maximum one File Upload question per form
- Required answers
- Required file uploads
- Submitted question IDs
- Duplicate answers
- Multiple-choice values
- File-question associations
- Published form status before accepting public submissions

Backend validation ensures invalid requests cannot bypass frontend validation.

---

## File Uploads

The current implementation supports:

```text
Maximum file size: 10 MB
Maximum File Upload questions per form: 1
Maximum uploaded files per submission: 1
```

Uploaded files are stored under unique S3 object keys associated with the form and submission.

File metadata is stored in the database while the actual file remains in S3.

---

## Form Editing and Historical Submissions

Existing questions maintain their database IDs when a form is edited.

When a question is removed from the current form, it is marked as archived rather than physically deleted.

Active form pages only load:

```text
isArchived = false
```

Historical submission details can still access archived questions through their existing answer relationships.

This prevents editing a form from deleting previously submitted answers.

---

## Publishing

Forms have two states:

```text
DRAFT
PUBLISHED
```

When a form is published for the first time, a unique UUID-based public slug is generated.

Example:

```text
/f/550e8400-e29b-41d4-a716-446655440000
```

Unpublishing a form prevents public access while retaining the generated slug.

Republishing the form restores access using the same public URL.

---

## Security Notes

- AWS credentials are stored only through environment variables.
- `.env` files are excluded from Git.
- S3 files are private.
- Uploaded files are accessed through short-lived signed URLs.
- Public submission endpoints only accept submissions for published forms.
- Question IDs and submitted values are validated server-side.
- File uploads are associated with the expected File Upload question.

Authentication was not required by the assignment and is therefore outside the scope of this implementation.

---

## Bonus Challenge

The optional conditional-logic challenge is not implemented in this version.

The project focuses on completing the required core functionality with a clear and maintainable implementation.

---

## Deployment

The application is designed to be deployed using services such as:

```text
Frontend: Vercel / Netlify
Backend: Render / Railway / AWS
Database: Managed MySQL / MariaDB
Files: Amazon S3
```

Production environment variables must be configured on the respective hosting platforms.

For production database deployment, Prisma migrations can be applied using:

```bash
npx prisma migrate deploy
```

After deployment, update the frontend:

```env
VITE_API_URL="YOUR_PRODUCTION_BACKEND_URL"
```

and backend:

```env
FRONTEND_URL="YOUR_PRODUCTION_FRONTEND_URL"
```

Then add the deployed application URL to the **Live Demo** section at the top of this README.

---

## Assignment Requirements

This implementation covers the required core task:

- Form creation and editing
- Form listing, renaming, and deletion
- Dynamic question creation
- Question editing, deletion, and reordering
- Text Input questions
- Multiple Choice questions with configurable options
- File Upload questions
- Required questions
- Draft and Published states
- Unique public form URLs
- Unauthenticated public forms
- Required-field validation
- File upload handling
- Submission storage
- Submission dashboard
- Individual submission details
- Uploaded file access

---

## License

This project was created as a technical assignment/demo project.
