import type { FastifyInstance } from "fastify";

import { prisma } from "../config/prisma.js";

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

export async function formRoutes(app: FastifyInstance) {
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
}
