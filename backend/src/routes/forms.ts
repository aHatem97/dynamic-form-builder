import type { FastifyInstance } from "fastify";
import { randomUUID } from "node:crypto";
import { extname } from "node:path";

import { prisma } from "../config/prisma.js";
import { getFileDownloadUrl, uploadFileToS3 } from "../config/s3.js";
import { Prisma } from "../generated/prisma/client.js";

type QuestionType = "TEXT" | "MULTIPLE_CHOICE" | "FILE";

interface CreateQuestionBody {
  type: QuestionType;
  label: string;
  required: boolean;
  options?: string[];
}

interface CreateFormBody {
  title: string;
  questions: CreateQuestionBody[];
}

interface UpdateQuestionBody extends CreateQuestionBody {
  id: string;
}

interface UpdateFormBody {
  title: string;
  questions: UpdateQuestionBody[];
}

interface UpdateFormStatusBody {
  status: "draft" | "published";
}

interface SubmitAnswerBody {
  questionId: string;
  value?: string;
}

interface SubmitFormBody {
  answers: SubmitAnswerBody[];
}

export async function formRoutes(app: FastifyInstance) {
  app.get("/api/forms", async () => {
    const forms = await prisma.form.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            questions: {
              where: {
                isArchived: false,
              },
            },
            submissions: true,
          },
        },
      },
    });

    return forms.map((form) => ({
      id: form.id,
      title: form.title,
      status: form.status.toLowerCase(),
      publicSlug: form.publicSlug,
      questionCount: form._count.questions,
      submissionCount: form._count.submissions,
      createdAt: form.createdAt,
      updatedAt: form.updatedAt,
    }));
  });

  app.get<{ Params: { id: string } }>(
    "/api/forms/:id",
    async (request, reply) => {
      const { id } = request.params;

      const form = await prisma.form.findUnique({
        where: {
          id,
        },
        include: {
          questions: {
            where: {
              isArchived: false,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      });

      if (!form) {
        return reply.status(404).send({
          message: "Form not found",
        });
      }

      return form;
    },
  );

  app.post<{ Body: CreateFormBody }>("/api/forms", async (request, reply) => {
    const { title, questions } = request.body;

    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      return reply.status(400).send({
        message: "Form title is required",
      });
    }

    for (const question of questions ?? []) {
      if (!question.label.trim()) {
        return reply.status(400).send({
          message: "Question label is required",
        });
      }

      if (
        question.type === "MULTIPLE_CHOICE" &&
        (!question.options || question.options.length === 0)
      ) {
        return reply.status(400).send({
          message: "Multiple choice questions require at least one option",
        });
      }
    }

    const form = await prisma.form.create({
      data: {
        title: trimmedTitle,
        status: "DRAFT",

        questions: {
          create: (questions ?? []).map((question, index) => ({
            type: question.type,
            label: question.label.trim(),
            required: question.required,
            position: index,

            options:
              question.type === "MULTIPLE_CHOICE"
                ? question.options
                : undefined,
          })),
        },
      },

      include: {
        questions: {
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    return reply.status(201).send(form);
  });

  app.put<{
    Params: { id: string };
    Body: UpdateFormBody;
  }>("/api/forms/:id", async (request, reply) => {
    const { id } = request.params;
    const { title, questions = [] } = request.body;

    const trimmedTitle = title?.trim();

    if (!trimmedTitle) {
      return reply.status(400).send({
        message: "Form title is required",
      });
    }

    for (const question of questions) {
      if (!question.label.trim()) {
        return reply.status(400).send({
          message: "Question label is required",
        });
      }

      if (
        question.type === "MULTIPLE_CHOICE" &&
        (!question.options || question.options.length === 0)
      ) {
        return reply.status(400).send({
          message: "Multiple choice questions require at least one option",
        });
      }
    }

    const form = await prisma.form.findUnique({
      where: {
        id,
      },
      include: {
        questions: true,
      },
    });

    if (!form) {
      return reply.status(404).send({
        message: "Form not found",
      });
    }

    const incomingIds = questions.map((question) => question.id);

    if (new Set(incomingIds).size !== incomingIds.length) {
      return reply.status(400).send({
        message: "Duplicate question IDs",
      });
    }

    /*
     * Make sure an incoming question ID does not already
     * belong to another form.
     */
    if (incomingIds.length > 0) {
      const questionsWithIncomingIds = await prisma.question.findMany({
        where: {
          id: {
            in: incomingIds,
          },
        },
        select: {
          id: true,
          formId: true,
        },
      });

      const foreignQuestion = questionsWithIncomingIds.find(
        (question) => question.formId !== id,
      );

      if (foreignQuestion) {
        return reply.status(400).send({
          message: "Invalid question",
        });
      }
    }

    const existingQuestionIds = new Set(
      form.questions.map((question) => question.id),
    );

    const operations = [];

    operations.push(
      prisma.form.update({
        where: {
          id,
        },
        data: {
          title: trimmedTitle,
        },
      }),
    );

    /*
     * Questions removed from the builder are archived
     * instead of physically deleted.
     */
    operations.push(
      prisma.question.updateMany({
        where: {
          formId: id,
          isArchived: false,
          ...(incomingIds.length > 0
            ? {
                id: {
                  notIn: incomingIds,
                },
              }
            : {}),
        },
        data: {
          isArchived: true,
        },
      }),
    );

    questions.forEach((question, index) => {
      if (existingQuestionIds.has(question.id)) {
        operations.push(
          prisma.question.update({
            where: {
              id: question.id,
            },
            data: {
              type: question.type,
              label: question.label.trim(),
              required: question.required,
              position: index,
              options:
                question.type === "MULTIPLE_CHOICE"
                  ? question.options
                  : Prisma.DbNull,
              isArchived: false,
            },
          }),
        );
      } else {
        operations.push(
          prisma.question.create({
            data: {
              id: question.id,
              formId: id,
              type: question.type,
              label: question.label.trim(),
              required: question.required,
              position: index,
              options:
                question.type === "MULTIPLE_CHOICE"
                  ? question.options
                  : undefined,
            },
          }),
        );
      }
    });

    await prisma.$transaction(operations);

    const updatedForm = await prisma.form.findUnique({
      where: {
        id,
      },
      include: {
        questions: {
          where: {
            isArchived: false,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    return updatedForm;
  });

  app.patch<{
    Params: { id: string };
    Body: UpdateFormStatusBody;
  }>("/api/forms/:id/status", async (request, reply) => {
    const { id } = request.params;
    const { status } = request.body;

    if (status !== "draft" && status !== "published") {
      return reply.status(400).send({
        message: "Status must be draft or published",
      });
    }

    const existingForm = await prisma.form.findUnique({
      where: {
        id,
      },
    });

    if (!existingForm) {
      return reply.status(404).send({
        message: "Form not found",
      });
    }

    const form = await prisma.form.update({
      where: {
        id,
      },
      data: {
        status: status === "published" ? "PUBLISHED" : "DRAFT",

        publicSlug:
          status === "published"
            ? (existingForm.publicSlug ?? randomUUID())
            : existingForm.publicSlug,
      },
    });

    return {
      id: form.id,
      title: form.title,
      status: form.status.toLowerCase(),
      publicSlug: form.publicSlug,
    };
  });

  app.delete<{ Params: { id: string } }>(
    "/api/forms/:id",
    async (request, reply) => {
      const { id } = request.params;

      const existingForm = await prisma.form.findUnique({
        where: {
          id,
        },
      });

      if (!existingForm) {
        return reply.status(404).send({
          message: "Form not found",
        });
      }

      await prisma.form.delete({
        where: {
          id,
        },
      });

      return reply.status(204).send();
    },
  );

  app.get<{ Params: { slug: string } }>(
    "/api/public/forms/:slug",
    async (request, reply) => {
      const { slug } = request.params;

      const form = await prisma.form.findFirst({
        where: {
          publicSlug: slug,
          status: "PUBLISHED",
        },
        include: {
          questions: {
            where: {
              isArchived: false,
            },
            orderBy: {
              position: "asc",
            },
          },
        },
      });

      if (!form) {
        return reply.status(404).send({
          message: "Form not found",
        });
      }

      return {
        id: form.id,
        title: form.title,
        questions: form.questions.map((question) => ({
          id: question.id,
          type: question.type,
          label: question.label,
          required: question.required,
          options: question.options,
          position: question.position,
        })),
      };
    },
  );

  app.post<{
    Params: { slug: string };
  }>("/api/public/forms/:slug/submissions", async (request, reply) => {
    const { slug } = request.params;

    const form = await prisma.form.findFirst({
      where: {
        publicSlug: slug,
        status: "PUBLISHED",
      },
      include: {
        questions: {
          where: {
            isArchived: false,
          },
          orderBy: {
            position: "asc",
          },
        },
      },
    });

    if (!form) {
      return reply.status(404).send({
        message: "Form not found",
      });
    }

    let answers: SubmitAnswerBody[] = [];

    let uploadedFile: {
      questionId: string;
      buffer: Buffer;
      filename: string;
      mimetype: string;
    } | null = null;

    if (request.isMultipart()) {
      const parts = request.parts();

      for await (const part of parts) {
        if (part.type === "field") {
          if (part.fieldname === "answers") {
            try {
              answers = JSON.parse(String(part.value)) as SubmitAnswerBody[];
            } catch {
              return reply.status(400).send({
                message: "Invalid answers payload",
              });
            }
          }

          continue;
        }

        if (uploadedFile) {
          return reply.status(400).send({
            message: "Only one file can be uploaded",
          });
        }

        uploadedFile = {
          questionId: part.fieldname,
          buffer: await part.toBuffer(),
          filename: part.filename,
          mimetype: part.mimetype,
        };
      }
    } else {
      const body = request.body as SubmitFormBody | undefined;

      answers = body?.answers ?? [];
    }

    const questionMap = new Map(
      form.questions.map((question) => [question.id, question]),
    );

    const answerMap = new Map<string, SubmitAnswerBody>();

    for (const answer of answers) {
      if (answerMap.has(answer.questionId)) {
        return reply.status(400).send({
          message: "Duplicate answer submitted",
        });
      }

      const question = questionMap.get(answer.questionId);

      if (!question) {
        return reply.status(400).send({
          message: "Invalid question",
        });
      }

      if (question.type === "FILE") {
        return reply.status(400).send({
          message: "File questions must be submitted as files",
        });
      }

      answerMap.set(answer.questionId, answer);
    }

    if (uploadedFile) {
      const fileQuestion = questionMap.get(uploadedFile.questionId);

      if (!fileQuestion || fileQuestion.type !== "FILE") {
        return reply.status(400).send({
          message: "Invalid file question",
        });
      }
    }

    for (const question of form.questions) {
      if (question.type === "FILE") {
        if (question.required && uploadedFile?.questionId !== question.id) {
          return reply.status(400).send({
            message: `"${question.label}" is required`,
          });
        }

        continue;
      }

      const answer = answerMap.get(question.id);
      const value = answer?.value?.trim() ?? "";

      if (question.required && !value) {
        return reply.status(400).send({
          message: `"${question.label}" is required`,
        });
      }

      if (question.type === "MULTIPLE_CHOICE" && value) {
        const options = Array.isArray(question.options)
          ? question.options.filter(
              (option): option is string => typeof option === "string",
            )
          : [];

        if (!options.includes(value)) {
          return reply.status(400).send({
            message: `Invalid option for "${question.label}"`,
          });
        }
      }
    }

    const textAnswers = form.questions
      .filter((question) => question.type !== "FILE")
      .map((question) => {
        const answer = answerMap.get(question.id);
        const value = answer?.value?.trim() ?? "";

        return {
          questionId: question.id,
          valueText: value,
        };
      })
      .filter((answer) => answer.valueText !== "");

    const submissionId = randomUUID();

    let fileAnswer:
      | {
          questionId: string;
          fileName: string;
          fileKey: string;
          fileType: string;
        }
      | undefined;

    if (uploadedFile) {
      const extension = extname(uploadedFile.filename);

      const fileKey =
        `forms/${form.id}/submissions/` +
        `${submissionId}/${randomUUID()}${extension}`;

      await uploadFileToS3(fileKey, uploadedFile.buffer, uploadedFile.mimetype);

      fileAnswer = {
        questionId: uploadedFile.questionId,
        fileName: uploadedFile.filename,
        fileKey,
        fileType: uploadedFile.mimetype,
      };
    }

    const submission = await prisma.submission.create({
      data: {
        id: submissionId,
        formId: form.id,

        answers: {
          create: [...textAnswers, ...(fileAnswer ? [fileAnswer] : [])],
        },
      },
    });

    return reply.status(201).send({
      id: submission.id,
      submittedAt: submission.submittedAt,
    });
  });

  app.get<{ Params: { id: string } }>(
    "/api/forms/:id/submissions",
    async (request, reply) => {
      const { id } = request.params;

      const form = await prisma.form.findUnique({
        where: {
          id,
        },
      });

      if (!form) {
        return reply.status(404).send({
          message: "Form not found",
        });
      }

      const submissions = await prisma.submission.findMany({
        where: {
          formId: id,
        },
        orderBy: {
          submittedAt: "desc",
        },
        include: {
          _count: {
            select: {
              answers: true,
            },
          },
        },
      });

      return submissions.map((submission) => ({
        id: submission.id,
        submittedAt: submission.submittedAt,
        answerCount: submission._count.answers,
      }));
    },
  );

  app.get<{
    Params: {
      formId: string;
      submissionId: string;
    };
  }>("/api/forms/:formId/submissions/:submissionId", async (request, reply) => {
    const { formId, submissionId } = request.params;

    const submission = await prisma.submission.findFirst({
      where: {
        id: submissionId,
        formId,
      },
      include: {
        form: {
          select: {
            id: true,
            title: true,
          },
        },
        answers: {
          include: {
            question: true,
          },
        },
      },
    });

    if (!submission) {
      return reply.status(404).send({
        message: "Submission not found",
      });
    }

    const answers = submission.answers
      .sort((a, b) => a.question.position - b.question.position)
      .map((answer) => ({
        id: answer.id,

        question: {
          id: answer.question.id,
          label: answer.question.label,
          type: answer.question.type,
          required: answer.question.required,
          position: answer.question.position,
        },

        value: answer.valueText,

        file: answer.fileName
          ? {
              name: answer.fileName,
              type: answer.fileType,
            }
          : null,
      }));

    return {
      id: submission.id,
      submittedAt: submission.submittedAt,

      form: {
        id: submission.form.id,
        title: submission.form.title,
      },

      answers,
    };
  });

  app.get<{
    Params: {
      formId: string;
      submissionId: string;
      answerId: string;
    };
  }>(
    "/api/forms/:formId/submissions/:submissionId/answers/:answerId/file",
    async (request, reply) => {
      const { formId, submissionId, answerId } = request.params;

      const answer = await prisma.answer.findFirst({
        where: {
          id: answerId,
          submissionId,
          submission: {
            formId,
          },
        },
      });

      if (!answer) {
        return reply.status(404).send({
          message: "File not found",
        });
      }

      if (!answer.fileKey || !answer.fileName) {
        return reply.status(404).send({
          message: "File not found",
        });
      }

      const url = await getFileDownloadUrl(answer.fileKey, answer.fileName);

      return {
        url,
      };
    },
  );
}
