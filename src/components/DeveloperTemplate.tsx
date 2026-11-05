"use client";
import React from "react";
import type { ResumeData } from "@/types/resume";
import { Bullets, dateRange, hasExperience, toLines } from "./templates/shared";

// Developer: clean tech look with monospace accents, a skills chip strip near the top and projects up front.
export default function DeveloperTemplate({
  name, email, phone, website, linkedin, summary, experiences, education, skills, certifications, projects,
}: ResumeData) {
  const contact = [email, phone, website, linkedin].filter(Boolean);
  const skillNames = skills?.map((s) => s.name).filter(Boolean) ?? [];
  const mono = "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace";

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[12px] font-bold uppercase tracking-[0.12em] text-sky-700 mb-2 flex items-center gap-2" style={{ fontFamily: mono }}>
      <span className="text-sky-400">{"//"}</span>{children}
    </h2>
  );

  return (
    <div className="w-full max-w-3xl mx-auto bg-white text-slate-800 border-t-[6px] border-sky-600" style={{ fontFamily: "Inter, 'Segoe UI', Arial, sans-serif", fontSize: "11pt" }}>
      <header className="px-10 pt-8 pb-5">
        <h1 className="text-[30px] font-bold text-slate-900 leading-tight">{name}</h1>
        {contact.length > 0 && (
          <p className="mt-2 text-[11.5px] text-slate-600 flex flex-wrap gap-x-4 gap-y-1" style={{ fontFamily: mono }}>
            {contact.map((c, i) => <span key={i} className="break-all">{c}</span>)}
          </p>
        )}
      </header>

      <div className="px-10 pb-9 flex flex-col gap-5">
        {skillNames.length > 0 && (
          <section className="rounded-lg bg-slate-50 border border-slate-200 px-4 py-3">
            <div className="flex flex-wrap gap-1.5">
              {skillNames.map((s, i) => (
                <span key={i} className="text-[11px] rounded-md px-2 py-0.5 bg-white border border-sky-200 text-sky-800" style={{ fontFamily: mono }}>{s}</span>
              ))}
            </div>
          </section>
        )}

        {summary && (
          <section>
            <Heading>Summary</Heading>
            <p className="text-[13px] leading-relaxed">{summary}</p>
          </section>
        )}

        {hasExperience(experiences) && (
          <section>
            <Heading>Experience</Heading>
            <div className="flex flex-col gap-4">
              {experiences.filter((e) => e.title || e.company || e.details).map((exp, idx) => (
                <div key={idx}>
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="text-[13.5px]">
                      <span className="font-semibold text-slate-900">{exp.title}</span>
                      {exp.company && <span className="text-sky-700"> @ {exp.company}</span>}
                    </div>
                    <div className="text-[11px] text-slate-500 whitespace-nowrap" style={{ fontFamily: mono }}>{dateRange(exp)}</div>
                  </div>
                  <Bullets text={exp.details} className="mt-1 text-[13px] leading-relaxed marker:text-sky-500" />
                </div>
              ))}
            </div>
          </section>
        )}

        {projects && (
          <section>
            <Heading>Projects</Heading>
            <Bullets text={projects} className="text-[13px] leading-relaxed marker:text-sky-500" />
          </section>
        )}

        {education && (
          <section>
            <Heading>Education</Heading>
            <ul className="text-[13px] leading-relaxed space-y-0.5">
              {toLines(education).map((l, i) => <li key={i} className={i === 0 ? "font-semibold text-slate-900" : ""}>{l}</li>)}
            </ul>
          </section>
        )}

        {certifications && (
          <section>
            <Heading>Certifications</Heading>
            <Bullets text={certifications} className="text-[13px] leading-relaxed marker:text-sky-500" />
          </section>
        )}
      </div>
    </div>
  );
}
