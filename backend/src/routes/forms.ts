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
}
