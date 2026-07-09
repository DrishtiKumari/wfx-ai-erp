"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Database,
  Brain,
  Globe,
  Server,
  Monitor,
} from "lucide-react";

export default function DocsPage() {
  return (
    <div className="space-y-8 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">
          Documentation & Architecture
        </h2>
        <p className="mt-1 text-gray-600">
          How WFX AI ERP works — architecture, AI safety, and deployment.
        </p>
      </div>

      {/* Architecture overview */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">
            System Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="rounded-lg bg-gray-900 p-5 text-xs text-gray-100 font-mono overflow-x-auto">
{`┌──────────────────────────────────────────┐
│           USER BROWSER                    │
└───────────────────┬──────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────┐
│     NEXT.JS FRONTEND (Vercel)             │
│  Dashboard │ Products │ AI Query │ Search │
└───────────────────┬──────────────────────┘
                    │  REST API (JSON)
                    ▼
┌──────────────────────────────────────────┐
│     FASTAPI BACKEND (Render)              │
│  /health │ /dashboard │ /products │ /ai   │
└─────────┬──────────────────┬─────────────┘
          │                  │
          ▼                  ▼
┌─────────────────┐  ┌─────────────────────┐
│ SUPABASE        │  │ OPENROUTER API      │
│ PostgreSQL      │  │ (LLM / NL2SQL)      │
└─────────────────┘  └─────────────────────┘`}
          </pre>
        </CardContent>
      </Card>

      {/* Tech stack */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">
            Tech Stack
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Monitor className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Frontend</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Next.js 14", "TypeScript", "Tailwind CSS", "shadcn/ui", "Recharts"].map(
                  (tech) => (
                    <Badge key={tech} variant="secondary" className="bg-gray-100 text-gray-700 font-normal">
                      {tech}
                    </Badge>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Server className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Backend</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["FastAPI", "Python 3.11", "SQLAlchemy", "Pydantic", "asyncpg"].map(
                  (tech) => (
                    <Badge key={tech} variant="secondary" className="bg-gray-100 text-gray-700 font-normal">
                      {tech}
                    </Badge>
                  )
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-gray-600" />
                <h4 className="font-semibold text-gray-900">Infrastructure</h4>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["Supabase", "Vercel", "Render", "OpenRouter"].map((tech) => (
                  <Badge key={tech} variant="secondary" className="bg-gray-100 text-gray-700 font-normal">
                    {tech}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Safety */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Shield className="h-5 w-5" />
            AI Safety & NL2SQL Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            The NL2SQL engine converts natural language questions into safe SQL
            queries. Multiple layers of validation ensure no harmful operations
            can be executed.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <h5 className="text-sm font-semibold text-green-800 mb-2">
                ✓ Allowed
              </h5>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• SELECT queries only</li>
                <li>• JOINs between known tables</li>
                <li>• Aggregate functions (SUM, COUNT, AVG)</li>
                <li>• WHERE, GROUP BY, ORDER BY</li>
                <li>• LIMIT clause (auto-added if missing)</li>
              </ul>
            </div>

            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <h5 className="text-sm font-semibold text-red-800 mb-2">
                ✗ Blocked
              </h5>
              <ul className="text-xs text-red-700 space-y-1">
                <li>• INSERT, UPDATE, DELETE</li>
                <li>• DROP, ALTER, TRUNCATE</li>
                <li>• CREATE, GRANT, REVOKE</li>
                <li>• System table access</li>
                <li>• Multiple statements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* NL2SQL Pipeline */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            NL2SQL Pipeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                step: "1",
                title: "Question → SQL",
                desc: "LLM converts your plain English question into a PostgreSQL query using schema context and few-shot examples.",
              },
              {
                step: "2",
                title: "Validate & Execute",
                desc: "SQL validator checks safety (SELECT only, allowed tables, auto-LIMIT). Validated query runs against the database.",
              },
              {
                step: "3",
                title: "Generate Answer",
                desc: "Results are sent back to the LLM which generates a human-readable business answer with confidence score.",
              },
            ].map((item) => (
              <div key={item.step} className="rounded-lg border border-gray-200 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-900 text-xs font-bold text-white">
                    {item.step}
                  </span>
                  <h5 className="text-sm font-semibold text-gray-900">
                    {item.title}
                  </h5>
                </div>
                <p className="text-xs text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Database Schema */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Schema
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: "buyers", desc: "Customer companies", rows: "10" },
              { name: "suppliers", desc: "Material suppliers", rows: "10" },
              { name: "finished_goods", desc: "Product catalog", rows: "25" },
              { name: "sales_orders", desc: "Purchase orders", rows: "20" },
              { name: "sales_invoices", desc: "Billing records", rows: "15" },
              { name: "tech_packs", desc: "Technical specs", rows: "10" },
            ].map((table) => (
              <div
                key={table.name}
                className="rounded-lg border border-gray-200 p-3"
              >
                <p className="text-sm font-semibold text-gray-900 font-mono">
                  {table.name}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{table.desc}</p>
                <p className="text-xs text-gray-400 mt-1">{table.rows} rows</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Deployment links */}
      <Card className="border-gray-200 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg font-bold text-gray-900">
            Deployment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-2 text-left font-semibold text-gray-700">
                    Service
                  </th>
                  <th className="py-2 text-left font-semibold text-gray-700">
                    Platform
                  </th>
                  <th className="py-2 text-left font-semibold text-gray-700">
                    URL
                  </th>
                </tr>
              </thead>
              <tbody className="text-gray-600">
                <tr className="border-b border-gray-100">
                  <td className="py-2">Frontend</td>
                  <td className="py-2">Vercel</td>
                  <td className="py-2 text-gray-400 italic">
                    To be updated after deployment
                  </td>
                </tr>
                <tr className="border-b border-gray-100">
                  <td className="py-2">Backend API</td>
                  <td className="py-2">Render</td>
                  <td className="py-2 text-gray-400 italic">
                    To be updated after deployment
                  </td>
                </tr>
                <tr>
                  <td className="py-2">Database</td>
                  <td className="py-2">Supabase</td>
                  <td className="py-2 text-gray-400 italic">Managed</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
