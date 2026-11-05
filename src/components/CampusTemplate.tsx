"use client";
import React from "react";
import type { ResumeData } from "@/types/resume";
import { Bullets, dateRange, hasExperience, toLines } from "./templates/shared";

// Campus / Fresher: education and projects first, internships next.
// Single column and ATS-safe; designed for students and recent graduates.
export default function CampusTemplate({
  name, email, phone, website, linkedin, summary, experiences, education, skills, certifications, projects,
}: ResumeData) {
  const contact = [phone, email, linkedin, website].filter(Boolean);
  const skillNames = skills?.map((s) => s.name).filter(Boolean) ?? [];
  const accent = "#0f766e";

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[13px] font-bold uppercase tracking-wider mb-1.5 pb-0.5 border-b-2" style={{ color: accent, borderColor: accent }}>
      {children}
    </h2>
  );

  return (
    <div className="w-full max-w-3xl mx-auto bg-white text-gray-900 p-10" style={{ fontFamily: "Calibri, 'Segoe UI', Arial, sans-serif", fontSize: "11pt" }}>
      <header className="text-center mb-5">
        <h1 className="text-[26px] font-bold tracking-tight">{name}</h1>
        {contact.length > 0 && <p className="mt-1 text-[12px] text-gray-700">{contact.join("  |  ")}</p>}
      </header>

      {summary && (
        <section className="mb-4">
          <Heading>Career Objective</Heading>
          <p className="text-[13px] leading-relaxed">{summary}</p>
        </section>
      )}

      {education && (
        <section className="mb-4">
          <Heading>Education</Heading>
          <ul className="text-[13px] leading-relaxed space-y-0.5">
            {toLines(education).map((line, i) => (
              <li key={i} className={i === 0 ? "font-semibold" : ""}>{line}</li>
            ))}
          </ul>
        </section>
      )}

      {skillNames.length > 0 && (
        <section className="mb-4">
          <Heading>Technical Skills</Heading>
          <p className="text-[13px] leading-relaxed">{skillNames.join(" • ")}</p>
        </section>
      )}

      {projects && (
        <section className="mb-4">
          <Heading>Academic &amp; Personal Projects</Heading>
          <Bullets text={projects} className="text-[13px] leading-relaxed" />
        </section>
      )}

      {hasExperience(experiences) && (
        <section className="mb-4">
          <Heading>Internships &amp; Experience</Heading>
          <div className="flex flex-col gap-2.5">
            {experiences.filter((e) => e.title || e.company || e.details).map((exp, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-[13px]">
                    <span className="font-semibold">{exp.title}</span>
                    {exp.company && <span className="text-gray-700"> — {exp.company}</span>}
                  </div>
                  <div className="text-[11px] text-gray-600 whitespace-nowrap">{dateRange(exp)}</div>
                </div>
                <Bullets text={exp.details} className="mt-0.5 text-[13px] leading-relaxed" />
              </div>
            ))}
          </div>
        </section>
      )}

      {certifications && (
        <section>
          <Heading>Certifications &amp; Achievements</Heading>
          <Bullets text={certifications} className="text-[13px] leading-relaxed" />
        </section>
      )}
    </div>
  );
}
