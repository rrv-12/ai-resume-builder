"use client";

import { Button } from "@/components/ui/button";
import { PlusSquare } from "lucide-react";
import Link from "next/link";

interface CreateResumeButtonProps {
  canCreate: boolean;
}

export default function CreateResumeButton({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  canCreate,
}: CreateResumeButtonProps) {
  return (
    <Button asChild className="mx-auto flex w-fit gap-2">
      <Link href="/editor">
        <PlusSquare className="size-5" />
        New resume
      </Link>
    </Button>
  );
}
