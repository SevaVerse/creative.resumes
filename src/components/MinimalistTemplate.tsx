"use client";
import React from "react";

// जय श्री राम - Blessed template
type ExperienceItem = {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  details: string; // 2-3 lines
};
type SkillItem = { name: string; level: number };

type MinimalistTemplateProps = {
  name: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  summary: string;
  experiences: ExperienceItem[];
  education: string;
  skills: SkillItem[];
  certifications?: string;
  projects?: string;
};

export default function MinimalistTemplate({
  name,
  email,
  phone,
  website,
  linkedin,
  summary,
  experiences,
  education,
  skills,
  certifications,
  projects,
}: MinimalistTemplateProps) {
  const contactParts = [email, phone, website, linkedin].filter(Boolean);
  return (
    <div className="w-full max-w-3xl mx-auto bg-white text-gray-900 p-10" style={{ fontFamily: "Georgia, 'Times New Roman', serif", fontSize: "12pt" }}>
      {/* Header */}
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{name}</h1>
        {contactParts.length > 0 && (
          <p className="mt-1 text-xs text-gray-600">{contactParts.join(" · ")}</p>
        )}
      </header>
      {/* Summary */}
      {summary && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-1">Summary</h2>
          <p className="text-sm leading-relaxed">{summary}</p>
        </section>
      )}
      {/* Experience */}
      {experiences?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-1">Experience</h2>
          <div className="flex flex-col gap-4">
            {experiences.map((exp, idx) => (
              <div key={idx}>
                <div className="flex items-baseline justify-between">
                  <div className="font-semibold text-[13px]">{exp.title}{exp.company ? `, ${exp.company}` : ""}</div>
                  <div className="text-[11px] text-gray-600">{exp.startDate} – {exp.current ? "Present" : exp.endDate || ""}</div>
                </div>
                {exp.details && (
                  <ul className="mt-1 text-sm leading-relaxed list-disc pl-5">
                    {exp.details.split("\n").filter(Boolean).map((line, i) => (
                      <li key={i}>{line.trim()}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
      {/* Education */}
      {education && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-1">Education</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line">{education}</p>
        </section>
      )}
      {/* Skills */}
    {skills?.length > 0 && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-1">Skills</h2>
      <p className="text-sm leading-relaxed">{skills.map(s => s.name).filter(Boolean).join(", ")}</p>
        </section>
      )}
      {/* Optional */}
      {certifications && (
        <section className="mb-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-1">Certifications</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line">{certifications}</p>
        </section>
      )}
      {projects && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-700 mb-1">Projects</h2>
          <p className="text-sm leading-relaxed whitespace-pre-line">{projects}</p>
        </section>
      )}
    </div>
  );
}
