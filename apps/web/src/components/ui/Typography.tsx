import React, { createElement, type ElementType, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../../utils/cn";
import { revealAttributes, type RevealConfig } from "./revealAttributes";

export type TypeRole = "micro" | "caption" | "ui" | "body-small" | "body" | "editorial" | "hero-lead" | "title-compact" | "title-dense" | "title-card" | "title-large" | "price" | "section" | "hero" | "eyebrow";
export type TypeTone = "default" | "muted" | "subtle" | "inverse" | "inverse-strong" | "inverse-muted" | "inverse-subtle" | "accent" | "danger";

const roleClasses: Record<TypeRole, string> = {
  micro: "type-micro",
  caption: "type-caption",
  ui: "type-ui",
  "body-small": "type-body-sm",
  body: "type-body",
  editorial: "type-editorial",
  "hero-lead": "type-hero-lead",
  "title-compact": "type-title-compact",
  "title-dense": "type-title-dense",
  "title-card": "type-title-card",
  "title-large": "type-title-large",
  price: "type-price",
  section: "type-section",
  hero: "type-hero",
  eyebrow: "type-eyebrow",
};

const toneClasses: Record<TypeTone, string> = {
  default: "type-tone-default",
  muted: "type-tone-muted",
  subtle: "type-tone-subtle",
  inverse: "type-tone-inverse",
  "inverse-strong": "type-tone-inverse-strong",
  "inverse-muted": "type-tone-inverse-muted",
  "inverse-subtle": "type-tone-inverse-subtle",
  accent: "type-tone-accent",
  danger: "type-tone-danger",
};

export interface TypographyProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  role?: TypeRole;
  tone?: TypeTone;
  children: ReactNode;
  reveal?: RevealConfig;
}

export function Typography({ as: Component = "p", role = "body", tone, className, children, reveal = false, style, ...props }: TypographyProps) {
  return createElement(Component, { className: cn(roleClasses[role], tone && toneClasses[tone], className), ...props, ...revealAttributes(reveal, style) }, children);
}

export function CardTitle({ as = "h3", className, ...props }: Omit<TypographyProps, "role">) {
  return <Typography as={as} role="title-card" className={cn("font-semibold", className)} {...props} />;
}

export function CardBody({ className, tone = "muted", ...props }: Omit<TypographyProps, "role">) {
  return <Typography role="body-small" tone={tone} className={className} {...props} />;
}
