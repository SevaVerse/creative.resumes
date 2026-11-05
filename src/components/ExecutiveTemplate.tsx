import React from "react";
import type { ResumeData } from "@/types/resume";
import { Bullets, dateRange, hasExperience, toLines } from "./templates/shared";

// Executive: navy and gold, serif name, single column. Polished for senior/corporate roles; ATS-safe.
export default function ExecutiveTemplate({
  name, email, phone, website, linkedin, summary, experiences, education, skills, certifications, projects,
}: ResumeData) {
  const contact = [email, phone, linkedin, website].filter(Boolean);
  const skillNames = skills?.map((s) => s.name).filter(Boolean) ?? [];
  const navy = "#1e2a44";
  const gold = "#b08d57";

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <div className="flex items-center gap-3 mb-2">
      <h2 className="text-[12px] font-bold uppercase tracking-[0.22em] whitespace-nowrap" style={{ color: navy }}>{children}</h2>
      <div className="h-px flex-1" style={{ backgroundColor: gold }} />
    </div>
  );

  return (
    <div className="w-full max-w-3xl mx-auto bg-white text-gray-900" style={{ fontFamily: "'Segoe UI', Helvetica, Arial, sans-serif", fontSize: "11pt" }}>
      <header className="px-12 pt-10 pb-6 text-center border-b-4" style={{ borderColor: navy }}>
        <h1 className="text-[32px] tracking-wide" style={{ fontFamily: "Georgia, 'Times New Roman', serif", color: navy }}>{name}</h1>
        <div className="mx-auto my-2.5 h-0.5 w-16" style={{ backgroundColor: gold }} />
        {contact.length > 0 && <p className="text-[12px] text-gray-600">{contact.join("   ·   ")}</p>}
      </header>

      <div className="px-12 py-7 flex flex-col gap-5">
        {summary && (
          <section>
            <Heading>Executive Summary</Heading>
            <p className="text-[13px] leading-relaxed text-gray-800">{summary}</p>
          </section>
        )}

        {skillNames.length > 0 && (
          <section>
            <Heading>Core Competencies</Heading>
            <ul className="grid grid-cols-3 gap-x-6 gap-y-1 text-[12.5px] text-gray-800">
              {skillNames.map((s, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="inline-block h-1.5 w-1.5 rotate-45 shrink-0" style={{ backgroundColor: gold }} />
                  {s}
                </li>
              ))}
            </ul>
          </section>
        )}

        {hasExperience(experiences) && (
          <section>
            <Heading>Professional Experience</Heading>
            <div className="flex flex-col gap-4">
              {experiences.filter((e) => e.title || e.company || e.details).map((exp, idx) => (
                <div key={idx}>
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="text-[14px] font-semibold" style={{ color: navy }}>{exp.company || exp.title}</div>
                    <div className="text-[11.5px] text-gray-600 whitespace-nowrap">{dateRange(exp)}</div>
                  </div>
                  {exp.company && exp.title && <div className="text-[12.5px] italic text-gray-700">{exp.title}</div>}
                  <Bullets text={exp.details} className="mt-1 text-[13px] leading-relaxed text-gray-800" />
                </div>
              ))}
            </div>
          </section>
        )}

        {projects && (
          <section>
            <Heading>Key Initiatives</Heading>
            <Bullets text={projects} className="text-[13px] leading-relaxed text-gray-800" />
          </section>
        )}

        {education && (
          <section>
            <Heading>Education</Heading>
            <ul className="text-[13px] leading-relaxed text-gray-800 space-y-0.5">
              {toLines(education).map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </section>
        )}

        {certifications && (
          <section>
            <Heading>Certifications &amp; Honours</Heading>
            <Bullets text={certifications} className="text-[13px] leading-relaxed text-gray-800" />
          </section>
        )}
      </div>
    </div>
  );
}
