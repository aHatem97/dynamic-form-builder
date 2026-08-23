# Dynamic Form Builder

A full-stack dynamic form builder built with **React + TypeScript** on the frontend and **Fastify + TypeScript** on the backend.

The application allows form creators to create configurable forms, publish them through unique public URLs, collect responses including file uploads, and review submitted answers.

## Live Demo

- **Frontend:** https://dynamic-form-builder-wheat-two.vercel.app
- **Backend API:** https://dynamic-form-builder-production-9489.up.railway.app
- **GitHub Repository:** https://github.com/aHatem97/dynamic-form-builder

## Features

### Form Management

- Create new forms
- List existing forms
- Rename and edit forms
- Delete forms
- Draft and Published states
- Publish forms using a unique public URL
- Unpublish and republish forms

### Dynamic Form Builder

Supported question types:

- Text Input
- Multiple Choice
- File Upload

Questions can be added, edited, deleted, reordered, and marked as required.

Multiple Choice questions support configurable options.

For this implementation, each form can contain a maximum of **one File Upload question**.

### Public Forms

Published forms receive a unique public URL using the route:

```text
/f/:slug
```

The public form page requires no authentication, displays the current active questions, validates required fields and Multiple Choice answers, supports file uploads, and stores submitted answers.

Draft forms are not accessible publicly.

### Submission Management

For each form, creators can view a summarized list of submissions, open individual submissions, inspect submitted answers, and access uploaded files.

Uploaded files are stored privately in **Amazon S3**. The backend generates short-lived signed URLs when a creator requests a file.

### Historical Submission Preservation

Questions removed from a form are archived instead of physically deleted.

This preserves answers from previous submissions even when the form structure changes later.

Active builder/public-form queries only return non-archived questions, while historical submission details can still resolve archived questions through existing answer relationships.

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

- MySQL on Railway

### File Storage

- Amazon S3
- AWS SDK
- Signed S3 download URLs

### Deployment

- Frontend: Vercel
- Backend: Railway
- Database: Railway MySQL
- File Storage: Amazon S3

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
│   │   ├── services/
│   │   │   ├── api.ts
│   │   │   └── forms.service.ts
│   │   ├── types/
│   │   │   └── forms.ts
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── vercel.json
│   └── package.json
│
├── backend/
│   ├── prisma/
│   │   ├── migrations/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── config/
│   │   │   ├── prisma.ts
│   │   │   └── s3.ts
│   │   ├── routes/
│   │   │   └── forms.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── prisma.config.ts
│   └── package.json
│
├── package.json
└── README.md
```

---

## Prerequisites

Before running the project locally, make sure you have:

- Node.js
- npm
- MySQL or MariaDB
- An AWS account
- A private Amazon S3 bucket
- AWS credentials with `s3:PutObject` and `s3:GetObject` permissions for the bucket

---

## Local Installation

Clone the repository:

```bash
git clone https://github.com/aHatem97/dynamic-form-builder.git
cd dynamic-form-builder
```

Install root dependencies:

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

Real `.env` files are not committed to Git.

Use the provided `.env.example` files as a reference.

### Backend

Create:

```text
backend/.env
```

Example:

```env
DATABASE_URL="mysql://USERNAME:PASSWORD@localhost:3306/dynamic_form_builder"
FRONTEND_URL="http://localhost:5173"

AWS_REGION="eu-central-1"
AWS_ACCESS_KEY_ID="YOUR_AWS_ACCESS_KEY_ID"
AWS_SECRET_ACCESS_KEY="YOUR_AWS_SECRET_ACCESS_KEY"
AWS_S3_BUCKET="YOUR_S3_BUCKET_NAME"
```

The application reads its database configuration from `DATABASE_URL`.

Do not commit real AWS credentials or database passwords.

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

Create a local MySQL/MariaDB database:

```sql
CREATE DATABASE dynamic_form_builder;
```

Make sure `DATABASE_URL` in `backend/.env` points to the database.

Then run:

```bash
cd backend
npx prisma generate
npx prisma migrate dev
```

For production deployments, use:

```bash
npx prisma migrate deploy
```

---

## Amazon S3 Setup

Create a private S3 bucket with Block Public Access enabled.

The IAM credentials used by the backend require access to objects in the bucket.

Example policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:GetObject"],
      "Resource": "arn:aws:s3:::YOUR_BUCKET_NAME/*"
    }
  ]
}
```

Uploaded files remain private. The application exposes them through temporary signed download URLs generated by the backend.

---

## Running Locally

From the project root:

```bash
npm run dev
```

Local frontend:

```text
http://localhost:5173
```

Local backend:

```text
http://localhost:3000
```

---

## Building

Build the full project from the root:

```bash
npm run build
```

Build the frontend only:

```bash
cd frontend
npm run build
```

Build the backend only:

```bash
cd backend
npm run build
```

The backend build also generates the Prisma client.

---

## Frontend Routes

| Route                                      | Description             |
| ------------------------------------------ | ----------------------- |
| `/forms`                                   | Forms dashboard         |
| `/forms/create`                            | Create a form           |
| `/forms/:formId/edit`                      | Edit a form             |
| `/forms/:formId/submissions`               | View form submissions   |
| `/forms/:formId/submissions/:submissionId` | View submission details |
| `/f/:slug`                                 | Public published form   |

Vercel is configured with an SPA rewrite so React Router routes also work when opened directly or refreshed.

---

## API Endpoints

| Method   | Endpoint                                                              | Description                         |
| -------- | --------------------------------------------------------------------- | ----------------------------------- |
| `GET`    | `/api/forms`                                                          | List forms                          |
| `POST`   | `/api/forms`                                                          | Create a form                       |
| `GET`    | `/api/forms/:id`                                                      | Get form details                    |
| `PUT`    | `/api/forms/:id`                                                      | Update a form                       |
| `DELETE` | `/api/forms/:id`                                                      | Delete a form                       |
| `PATCH`  | `/api/forms/:id/status`                                               | Publish or unpublish a form         |
| `GET`    | `/api/public/forms/:slug`                                             | Load a published public form        |
| `POST`   | `/api/public/forms/:slug/submissions`                                 | Submit a public form                |
| `GET`    | `/api/forms/:id/submissions`                                          | List form submissions               |
| `GET`    | `/api/forms/:formId/submissions/:submissionId`                        | View submission details             |
| `GET`    | `/api/forms/:formId/submissions/:submissionId/answers/:answerId/file` | Generate a signed file download URL |

---

## Validation

Validation is performed on both the frontend and backend.

The backend validates:

- Form titles
- Question labels
- Multiple Choice options
- Maximum one File Upload question per form
- Required answers
- Required file uploads
- Submitted question IDs
- Duplicate answers
- Multiple Choice values
- File-question associations
- Published status before accepting a public submission

Server-side validation ensures invalid requests cannot bypass frontend checks.

---

## File Uploads

Current limits:

```text
Maximum file size: 10 MB
Maximum File Upload questions per form: 1
Maximum uploaded files per submission: 1
```

Uploaded file metadata is stored in MySQL while the actual file is stored in Amazon S3.

---

## Form Editing and Submission History

Existing questions retain their IDs when a form is edited.

When a creator removes a question, the question is marked as archived instead of being deleted.

Active form queries use:

```text
isArchived = false
```

Historical answers remain linked to archived questions, preventing previous submission data from being removed when the form is edited.

---

## Publishing

Forms have two states:

```text
DRAFT
PUBLISHED
```

Publishing a form for the first time generates a unique UUID-based public slug.

Unpublishing blocks public access while retaining the slug.

Republishing restores access through the same URL.

---

## Deployment

### Frontend — Vercel

Production frontend:

```text
https://dynamic-form-builder-wheat-two.vercel.app
```

Vercel environment variable:

```env
VITE_API_URL="https://dynamic-form-builder-production-9489.up.railway.app"
```

The Vercel project uses the `frontend` directory as its root.

### Backend — Railway

Production backend:

```text
https://dynamic-form-builder-production-9489.up.railway.app
```

Railway service configuration:

```text
Root Directory: /backend
Build Command: npm run build
Pre-deploy Command: npx prisma migrate deploy
Start Command: npm start
```

Production backend variables include:

```env
DATABASE_URL="${{MySQL.MYSQL_URL}}"
FRONTEND_URL="https://dynamic-form-builder-wheat-two.vercel.app"

AWS_REGION="..."
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="..."
```

Railway automatically provides the runtime `PORT`.

### Database — Railway MySQL

The backend connects to Railway MySQL through the `DATABASE_URL` reference variable.

Prisma migrations are applied during the Railway pre-deploy step.

### File Storage — Amazon S3

Submitted files are stored privately in Amazon S3 and accessed through signed download URLs generated by the Fastify backend.

---

## Security Notes

- Real `.env` files are excluded from Git
- AWS credentials are configured through environment variables
- S3 Block Public Access remains enabled
- Uploaded files are private
- File downloads use short-lived signed URLs
- Public submissions are accepted only for Published forms
- Question IDs and submitted values are validated server-side

Authentication was not required by the assignment and is outside the scope of this implementation.

---

## Assignment Core Requirements

This implementation covers the required core functionality:

- Create and edit forms
- List forms
- Rename forms
- Delete forms
- Add questions
- Edit questions
- Delete questions
- Reorder questions
- Text Input questions
- Multiple Choice questions with configurable options
- File Upload questions
- Required questions
- Draft and Published states
- Unique public URLs
- Unauthenticated public form pages
- Required-field validation
- File upload handling
- Submission storage
- Submission dashboard
- Individual submission details
- Uploaded file access

---

## Bonus Challenge

The optional advanced conditional-logic challenge is not implemented in this version.

The project focuses on the complete core assignment functionality.

---

## License

This project was created as a technical assignment/demo project.
