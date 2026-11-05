import React from "react";
import Image from "next/image";
import type { ResumeData } from "@/types/resume";
import { Bullets, dateRange, hasExperience, toLines } from "./templates/shared";

// Aurora: violet-to-pink gradient header, card-style sections and skill chips. Optional photo.
export default function AuroraTemplate({
  name, email, phone, website, linkedin, summary, experiences, education, skills, certifications, projects, profilePictureUrl,
}: ResumeData) {
  const contact = [email, phone, website, linkedin].filter(Boolean);
  const skillNames = skills?.map((s) => s.name).filter(Boolean) ?? [];

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.18em] text-violet-700 mb-2.5">
      <span className="inline-block h-3 w-1 rounded-full bg-gradient-to-b from-violet-600 to-pink-500" />
      {children}
    </h2>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-slate-800 overflow-hidden" style={{ fontFamily: "Inter, 'Segoe UI', Arial, sans-serif", fontSize: "11pt" }}>
      <header className="relative bg-gradient-to-r from-violet-700 via-fuchsia-600 to-pink-500 text-white px-10 pt-9 pb-12">
        <div className="flex items-center gap-6">
          {profilePictureUrl && (
            <Image src={profilePictureUrl} alt="Profile picture" width={92} height={92} className="rounded-2xl object-cover ring-4 ring-white/40" />
          )}
          <div className="min-w-0">
            <h1 className="text-[30px] font-extrabold leading-tight tracking-tight">{name}</h1>
            {summary && <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/90 max-w-2xl">{summary}</p>}
          </div>
        </div>
      </header>

      {contact.length > 0 && (
        <div className="relative -mt-6 mx-10 rounded-xl bg-white shadow-md border border-slate-100 px-5 py-3 flex flex-wrap gap-x-6 gap-y-1 text-[12px] text-slate-600">
          {contact.map((c, i) => <span key={i} className="break-all">{c}</span>)}
        </div>
      )}

      <div className="grid grid-cols-[1fr_220px] gap-8 px-10 py-7">
        <main className="flex flex-col gap-6 min-w-0">
          {hasExperience(experiences) && (
            <section>
              <Heading>Experience</Heading>
              <div className="flex flex-col gap-3">
                {experiences.filter((e) => e.title || e.company || e.details).map((exp, idx) => (
                  <div key={idx} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="text-[13.5px] font-semibold text-slate-900">{exp.title}</div>
                      <span className="text-[10.5px] font-semibold text-violet-700 bg-violet-100 rounded-full px-2 py-0.5 whitespace-nowrap">{dateRange(exp)}</span>
                    </div>
                    {exp.company && <div className="text-[12px] text-fuchsia-700 font-medium">{exp.company}</div>}
                    <Bullets text={exp.details} className="mt-1.5 text-[12.5px] leading-relaxed" />
                  </div>
                ))}
              </div>
            </section>
          )}
          {projects && (
            <section>
              <Heading>Projects</Heading>
              <Bullets text={projects} className="text-[12.5px] leading-relaxed" />
            </section>
          )}
        </main>

        <aside className="flex flex-col gap-6">
          {skillNames.length > 0 && (
            <section>
              <Heading>Skills</Heading>
              <div className="flex flex-wrap gap-1.5">
                {skillNames.map((s, i) => (
                  <span key={i} className="text-[11px] font-medium rounded-full px-2.5 py-1 bg-gradient-to-r from-violet-50 to-pink-50 text-violet-800 border border-violet-200">{s}</span>
                ))}
              </div>
            </section>
          )}
          {education && (
            <section>
              <Heading>Education</Heading>
              <ul className="text-[12px] leading-relaxed space-y-1.5">
                {toLines(education).map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </section>
          )}
          {certifications && (
            <section>
              <Heading>Certifications</Heading>
              <ul className="text-[12px] leading-relaxed space-y-1.5">
                {toLines(certifications).map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
