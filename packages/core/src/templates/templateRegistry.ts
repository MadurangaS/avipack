export interface StarterTemplate {
  id: string;
  name: string;
  status: "scaffolded" | "planned";
  description: string;
}

export const starterTemplates: StarterTemplate[] = [
  {
    id: "generic-brain-only",
    name: "Generic Brain Only",
    status: "scaffolded",
    description: "Adds Avipack Brain files to a new or existing project."
  },
  {
    id: "nextjs-typescript-postgres",
    name: "Next.js TypeScript Postgres",
    status: "planned",
    description: "Future full-stack web application starter."
  },
  {
    id: "node-express-typescript",
    name: "Node Express TypeScript",
    status: "planned",
    description: "Future Node.js API starter."
  },
  {
    id: "python-fastapi",
    name: "Python FastAPI",
    status: "planned",
    description: "Future Python API starter."
  }
];

export function listStarterTemplates(): StarterTemplate[] {
  return starterTemplates;
}
