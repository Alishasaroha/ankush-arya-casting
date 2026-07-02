import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/sitemap.xml')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/sitemap.xml"!</div>
}
