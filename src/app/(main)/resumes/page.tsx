import prisma from "@/lib/prisma";
import { resumeDataInclude } from "@/lib/types";
import { Metadata } from "next";
import CreateResumeButton from "./CreateResumeButton";
import ResumeItem from "./ResumeItem";

export const metadata: Metadata = {
  title: "Your resumes",
};

export default async function Page() {
  // Fetch resumes without using `orderBy`
  const [resumes, totalCount] = await Promise.all([
    prisma.resume.findMany({
      include: resumeDataInclude, // Includes additional related data for each resume
    }),
    prisma.resume.count(), // Fetch the total count of resumes
  ]);

  // Sort the resumes manually using `updatedDate`
  const sortedResumes = resumes.sort(
    (a, b) =>
      new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime(),
  );

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 px-3 py-6">
      <CreateResumeButton canCreate={true} />
      <div className="space-y-1">
        <h1 className="text-3xl font-bold">Your resumes</h1>
        <p>Total: {totalCount}</p>
      </div>
      <div className="flex w-full grid-cols-2 flex-col gap-3 sm:grid md:grid-cols-3 lg:grid-cols-4">
        {sortedResumes.map((resume) => (
          <ResumeItem key={resume.id} resume={resume} />
        ))}
      </div>
    </main>
  );
}
