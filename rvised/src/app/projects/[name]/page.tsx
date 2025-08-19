"use client"
import { use } from "react"
import { ProjectDetailPage } from "@/components/project-detail-page"

export default function ProjectPage({ params }: { params: Promise<{ name: string }> }) {
  const resolvedParams = use(params)
  return <ProjectDetailPage projectName={decodeURIComponent(resolvedParams.name)} />
}
