import React from "react";
import Image from "next/image";
import type { ResumeData } from "@/types/resume";
import { Bullets, hasExperience, toLines } from "./templates/shared";

// Timeline: emerald accents, dates in a left gutter with a vertical career line; right rail for skills.
export default function TimelineTemplate({
  name, email, phone, website, linkedin, summary, experiences, education, skills, certifications, projects, profilePictureUrl,
}: ResumeData) {
  const contact = [email, phone, website, linkedin].filter(Boolean);
  const items = experiences?.filter((e) => e.title || e.company || e.details) ?? [];

  const Heading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[13px] font-bold uppercase tracking-[0.16em] text-emerald-700 mb-3">{children}</h2>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-gray-800" style={{ fontFamily: "'Segoe UI', Roboto, Arial, sans-serif", fontSize: "11pt" }}>
      <header className="px-10 pt-9 pb-6 flex items-center justify-between gap-6 border-b border-gray-200">
        <div className="min-w-0">
          <h1 className="text-[30px] font-bold text-gray-900 leading-tight">{name}</h1>
          <div className="mt-1 h-1 w-14 rounded-full bg-emerald-500" />
          {contact.length > 0 && (
            <p className="mt-3 text-[12px] text-gray-600 flex flex-wrap gap-x-4 gap-y-1">
              {contact.map((c, i) => <span key={i} className="break-all">{c}</span>)}
            </p>
          )}
        </div>
        {profilePictureUrl && (
          <Image src={profilePictureUrl} alt="Profile picture" width={88} height={88} className="rounded-full object-cover ring-4 ring-emerald-100 shrink-0" />
        )}
      </header>

      <div className="grid grid-cols-[1fr_210px] gap-8 px-10 py-7">
        <main className="flex flex-col gap-6 min-w-0">
          {summary && (
            <section>
              <Heading>About</Heading>
              <p className="text-[13px] leading-relaxed">{summary}</p>
            </section>
          )}

          {hasExperience(items) && (
            <section>
              <Heading>Career Timeline</Heading>
              <ol className="relative">
                {items.map((exp, idx) => (
                  <li key={idx} className="grid grid-cols-[92px_1fr] gap-4">
                    <div className="text-[11px] font-semibold text-emerald-700 text-right pt-0.5 leading-snug">
                      <div className="whitespace-nowrap">{exp.startDate}</div>
                      {(exp.current || exp.endDate) && <div className="whitespace-nowrap text-emerald-600/80">{exp.current ? "Present" : exp.endDate}</div>}
                    </div>
                    <div className={`relative pl-5 ${idx < items.length - 1 ? "pb-5" : ""} border-l-2 border-emerald-200`}>
                      <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-emerald-500 ring-4 ring-white" />
                      <div className="text-[13.5px] font-semibold text-gray-900">{exp.title}</div>
                      {exp.company && <div className="text-[12px] text-gray-600">{exp.company}</div>}
                      <Bullets text={exp.details} className="mt-1 text-[12.5px] leading-relaxed" />
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {projects && (
            <section>
              <Heading>Projects</Heading>
              <Bullets text={projects} className="text-[12.5px] leading-relaxed" />
            </section>
          )}
        </main>

        <aside className="flex flex-col gap-6 rounded-xl bg-emerald-50/60 p-5 self-start">
          {skills?.some((s) => s.name) && (
            <section>
              <Heading>Skills</Heading>
              <ul className="flex flex-col gap-2.5">
                {skills.filter((s) => s.name).map((s, i) => {
                  const dots = Math.max(1, Math.min(5, Math.round(s.level / 20)));
                  return (
                    <li key={i} className="text-[12px]">
                      <div>{s.name}</div>
                      <div className="mt-1 flex gap-1" aria-label={`${dots} of 5`}>
                        {[0, 1, 2, 3, 4].map((d) => (
                          <span key={d} className={`h-1.5 flex-1 rounded-full ${d < dots ? "bg-emerald-500" : "bg-emerald-100"}`} />
                        ))}
                      </div>
                    </li>
                  );
                })}
              </ul>
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
