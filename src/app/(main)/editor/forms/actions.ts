"use server";

import {
  GenerateSummaryInput,
  generateSummarySchema,
  GenerateWorkExperienceInput,
  generateWorkExperienceSchema,
  WorkExperience,
} from "@/lib/validation";
import { auth } from "@clerk/nextjs/server";
import fetch from "node-fetch";

const API_URL = "https://api-inference.huggingface.co/models/google/flan-t5-small";
const HEADERS = {
  Authorization: "Bearer hf_bGdvettMZtlzRoHCTQwEoEXnGzdgUHNwc0",
  "Content-Type": "application/json",
};

async function query(payload: Record<string, unknown>) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Hugging Face API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

export async function generateSummary(input: GenerateSummaryInput) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { jobTitle, workExperiences, educations, skills } =
    generateSummarySchema.parse(input);

  const userMessage = `
    Please generate a professional resume summary from this data:

    Job title: ${jobTitle || "N/A"}

    Work experience:
    ${workExperiences
      ?.map(
        (exp) => `
        Position: ${exp.position || "N/A"} at ${exp.company || "N/A"} from ${exp.startDate || "N/A"} to ${exp.endDate || "Present"}

        Description:
        ${exp.description || "N/A"}
        `,
      )
      .join("\n\n")}

    Education:
    ${educations
      ?.map(
        (edu) => `
        Degree: ${edu.degree || "N/A"} at ${edu.school || "N/A"} from ${edu.startDate || "N/A"} to ${edu.endDate || "N/A"}
        `,
      )
      .join("\n\n")}

    Skills:
    ${skills}
  `;

  console.log("userMessage", userMessage);

  const response = await query({ inputs: userMessage });

  if (!response || !response.generated_text) {
    throw new Error("Failed to generate AI response");
  }

  return response.generated_text.trim();
}

export async function generateWorkExperience(
  input: GenerateWorkExperienceInput,
) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const { description } = generateWorkExperienceSchema.parse(input);

  const userMessage = `
    Please provide a work experience entry from this description:
    ${description}
  `;

  console.log("userMessage", userMessage);

  const response = await query({ inputs: userMessage });

  if (!response || !response.generated_text) {
    throw new Error("Failed to generate AI response");
  }

  const aiResponse = response.generated_text.trim();

  console.log("aiResponse", aiResponse);

  return {
    position: aiResponse.match(/Job title: (.*)/)?.[1] || "",
    company: aiResponse.match(/Company: (.*)/)?.[1] || "",
    description: (
      aiResponse.match(/Description:([\s\S]*)/)?.[1] || ""
    ).trim(),
    startDate: aiResponse.match(/Start date: (\d{4}-\d{2}-\d{2})/)?.[1],
    endDate: aiResponse.match(/End date: (\d{4}-\d{2}-\d{2})/)?.[1],
  } satisfies WorkExperience;
}
