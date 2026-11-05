"use client";
import React from "react";
import type { ResumeData } from "@/types/resume";
import { Bullets, dateRange, hasExperience } from "./templates/shared";

// ATS Classic: plain single column, standard headings, no graphics or colour.
// Optimised for applicant tracking systems used by large employers and job portals.
export default function AtsClassicTemplate({
  name, email, phone, website, linkedin, summary, experiences, education, skills, certifications, projects,
}: ResumeData) {
  const contact = [email, phone, linkedin, website].filter(Boolean);
  const skillNames = skills?.map((s) => s.name).filter(Boolean) ?? [];

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <section className="mb-4">
      <h2 className="text-[12px] font-bold uppercase border-b border-black pb-0.5 mb-1.5">{title}</h2>
      {children}
    </section>
  );

  return (
    <div className="w-full max-w-3xl mx-auto bg-white text-black p-10" style={{ fontFamily: "Arial, Helvetica, sans-serif", fontSize: "11pt" }}>
      <header className="mb-4">
        <h1 className="text-[22px] font-bold">{name}</h1>
        {contact.length > 0 && <p className="text-[12px]">{contact.join(" | ")}</p>}
      </header>

      {summary && (
        <Section title="Summary">
          <p className="text-[13px] leading-snug">{summary}</p>
        </Section>
      )}
      {skillNames.length > 0 && (
        <Section title="Skills">
          <p className="text-[13px] leading-snug">{skillNames.join(", ")}</p>
        </Section>
      )}
      {hasExperience(experiences) && (
        <Section title="Experience">
          <div className="flex flex-col gap-2">
            {experiences.filter((e) => e.title || e.company || e.details).map((exp, idx) => (
              <div key={idx}>
                <div className="flex justify-between gap-4 text-[13px]">
                  <span><strong>{exp.title}</strong>{exp.company ? `, ${exp.company}` : ""}</span>
                  <span className="whitespace-nowrap">{dateRange(exp)}</span>
                </div>
                <Bullets text={exp.details} className="text-[13px] leading-snug" />
              </div>
            ))}
          </div>
        </Section>
      )}
      {projects && (
        <Section title="Projects">
          <Bullets text={projects} className="text-[13px] leading-snug" />
        </Section>
      )}
      {education && (
        <Section title="Education">
          <p className="text-[13px] leading-snug whitespace-pre-line">{education}</p>
        </Section>
      )}
      {certifications && (
        <Section title="Certifications">
          <Bullets text={certifications} className="text-[13px] leading-snug" />
        </Section>
      )}
    </div>
  );
}
