import type { FastifyInstance } from "fastify";
import { prisma } from "../config/prisma.js";
import { randomUUID } from "node:crypto";

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

interface UpdateFormBody {
  title: string;
  questions: CreateQuestionBody[];
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
            questions: true,
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
        title: trimmedTitle,

        questions: {
          deleteMany: {},

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

    return form;
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
    Body: SubmitFormBody;
  }>("/api/public/forms/:slug/submissions", async (request, reply) => {
    const { slug } = request.params;
    const { answers = [] } = request.body;

    const form = await prisma.form.findFirst({
      where: {
        publicSlug: slug,
        status: "PUBLISHED",
      },
      include: {
        questions: {
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

    const answerMap = new Map<string, SubmitAnswerBody>();

    for (const answer of answers) {
      if (answerMap.has(answer.questionId)) {
        return reply.status(400).send({
          message: "Duplicate answer submitted",
        });
      }

      answerMap.set(answer.questionId, answer);
    }

    const questionIds = new Set(form.questions.map((question) => question.id));

    for (const answer of answers) {
      if (!questionIds.has(answer.questionId)) {
        return reply.status(400).send({
          message: "Invalid question",
        });
      }
    }

    for (const question of form.questions) {
      const answer = answerMap.get(question.id);
      const value = answer?.value?.trim() ?? "";

      if (question.required && question.type !== "FILE" && !value) {
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

    const answersToSave = form.questions
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

    const submission = await prisma.submission.create({
      data: {
        formId: form.id,
        answers: {
          create: answersToSave,
        },
      },
    });

    return reply.status(201).send({
      id: submission.id,
      submittedAt: submission.submittedAt,
    });
  });
}
