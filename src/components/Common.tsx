import type { Child, FC } from 'hono/jsx'

export interface Crumb {
  href?: string
  label: string
}

export const Breadcrumbs: FC<{ items: Crumb[] }> = ({ items }) => (
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <ol>
      {items.map((c, i) => (
        <li>
          {c.href && i < items.length - 1 ? <a href={c.href}>{c.label}</a> : <span aria-current="page">{c.label}</span>}
        </li>
      ))}
    </ol>
  </nav>
)

export const PageHeader: FC<{ eyebrow?: string; title: string; lead?: string; crumbs?: Crumb[]; children?: Child }> = ({
  eyebrow,
  title,
  lead,
  crumbs,
  children
}) => (
  <header class="page-header">
    <div class="container">
      {crumbs && <Breadcrumbs items={crumbs} />}
      {eyebrow && <p class="eyebrow">{eyebrow}</p>}
      <h1 class="page-title">{title}</h1>
      {lead && <p class="page-lead">{lead}</p>}
      {children}
    </div>
  </header>
)

export const EmptyState: FC<{ title: string; children?: Child }> = ({ title, children }) => (
  <div class="empty-state" role="status">
    <div class="empty-state-icon" aria-hidden="true">∅</div>
    <h2 class="empty-state-title">{title}</h2>
    <div class="empty-state-body">{children}</div>
  </div>
)

export const Prose: FC<{ children?: Child }> = ({ children }) => (
  <div class="container">
    <div class="prose">{children}</div>
  </div>
)
