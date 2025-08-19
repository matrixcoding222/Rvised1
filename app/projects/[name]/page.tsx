import { ProjectDetailPage } from "@/components/project-detail-page"

export default function ProjectPage({ params }: { params: { name: string } }) {
  return <ProjectDetailPage projectName={decodeURIComponent(params.name)} />
}
