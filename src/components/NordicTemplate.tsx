"use client";
import React from "react";
import type { ResumeData } from "@/types/resume";
import { Bullets, dateRange, hasExperience, toLines } from "./templates/shared";

// Nordic: airy Scandinavian layout with section labels in a narrow left column. Low ink, ATS-friendly.
export default function NordicTemplate({
  name, email, phone, website, linkedin, summary, experiences, education, skills, certifications, projects,
}: ResumeData) {
  const contact = [email, phone, linkedin, website].filter(Boolean);
  const skillNames = skills?.map((s) => s.name).filter(Boolean) ?? [];

  const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <section className="grid grid-cols-[130px_1fr] gap-6 py-4 border-t border-stone-200">
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500 pt-0.5">{label}</h2>
      <div className="min-w-0">{children}</div>
    </section>
  );

  return (
    <div className="w-full max-w-3xl mx-auto bg-white text-stone-800 px-12 py-11" style={{ fontFamily: "Inter, 'Helvetica Neue', Arial, sans-serif", fontSize: "11pt" }}>
      <header className="mb-6">
        <h1 className="text-[34px] font-light tracking-tight text-stone-900 leading-none">{name}</h1>
        {contact.length > 0 && (
          <p className="mt-3 text-[12px] text-stone-500 flex flex-wrap gap-x-4 gap-y-1">
            {contact.map((c, i) => <span key={i}>{c}</span>)}
          </p>
        )}
      </header>

      {summary && (
        <Row label="Profile">
          <p className="text-[13px] leading-relaxed">{summary}</p>
        </Row>
      )}

      {hasExperience(experiences) && (
        <Row label="Experience">
          <div className="flex flex-col gap-4">
            {experiences.filter((e) => e.title || e.company || e.details).map((exp, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-[13.5px]">
                    <span className="font-semibold text-stone-900">{exp.title}</span>
                    {exp.company && <span className="text-stone-500">, {exp.company}</span>}
                  </div>
                  <div className="text-[11px] text-stone-500 whitespace-nowrap tabular-nums">{dateRange(exp)}</div>
                </div>
                <Bullets text={exp.details} className="mt-1 text-[13px] leading-relaxed marker:text-stone-400" />
              </div>
            ))}
          </div>
        </Row>
      )}

      {projects && (
        <Row label="Projects">
          <Bullets text={projects} className="text-[13px] leading-relaxed marker:text-stone-400" />
        </Row>
      )}

      {education && (
        <Row label="Education">
          <ul className="text-[13px] leading-relaxed space-y-0.5">
            {toLines(education).map((l, i) => <li key={i} className={i === 0 ? "font-medium text-stone-900" : ""}>{l}</li>)}
          </ul>
        </Row>
      )}

      {skillNames.length > 0 && (
        <Row label="Skills">
          <p className="text-[13px] leading-relaxed">{skillNames.join("  /  ")}</p>
        </Row>
      )}

      {certifications && (
        <Row label="Certifications">
          <Bullets text={certifications} className="text-[13px] leading-relaxed marker:text-stone-400" />
        </Row>
      )}
    </div>
  );
}
