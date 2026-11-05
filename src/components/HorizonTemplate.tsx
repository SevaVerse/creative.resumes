import React from "react";
import Image from "next/image";
import type { ResumeData } from "@/types/resume";
import { Bullets, dateRange, hasExperience, toLines } from "./templates/shared";

// Horizon: deep teal sidebar with initials monogram (or photo) and contact details; light main column.
export default function HorizonTemplate({
  name, email, phone, website, linkedin, summary, experiences, education, skills, certifications, projects, profilePictureUrl,
}: ResumeData) {
  const contact: { label: string; value: string }[] = [
    { label: "Email", value: email },
    { label: "Phone", value: phone },
    { label: "Web", value: website },
    { label: "LinkedIn", value: linkedin },
  ].filter((c) => c.value);
  const initials = (name || "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");

  const SideHeading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-teal-200 mb-2 pb-1 border-b border-teal-700">{children}</h2>
  );
  const MainHeading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[14px] font-bold text-teal-900 mb-2.5 flex items-center gap-2">
      {children}
      <span className="h-px flex-1 bg-teal-100" />
    </h2>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-slate-800 grid grid-cols-[240px_1fr] overflow-hidden" style={{ fontFamily: "Inter, 'Segoe UI', Arial, sans-serif", fontSize: "11pt" }}>
      <aside className="bg-teal-900 text-teal-50 px-6 py-9 flex flex-col gap-6">
        <div className="flex justify-center">
          {profilePictureUrl ? (
            <Image src={profilePictureUrl} alt="Profile picture" width={110} height={110} className="rounded-full object-cover ring-4 ring-teal-600" />
          ) : (
            initials && (
              <div className="h-24 w-24 rounded-full ring-4 ring-teal-600 bg-teal-800 flex items-center justify-center text-[30px] font-light tracking-wider">{initials}</div>
            )
          )}
        </div>

        {contact.length > 0 && (
          <section>
            <SideHeading>Contact</SideHeading>
            <ul className="flex flex-col gap-2 text-[11.5px]">
              {contact.map((c) => (
                <li key={c.label}>
                  <div className="text-[10px] uppercase tracking-wider text-teal-300">{c.label}</div>
                  <div className="break-all">{c.value}</div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {skills?.some((s) => s.name) && (
          <section>
            <SideHeading>Skills</SideHeading>
            <ul className="flex flex-col gap-2">
              {skills.filter((s) => s.name).map((s, i) => (
                <li key={i} className="text-[11.5px]">
                  <div>{s.name}</div>
                  <div className="mt-1 h-1 w-full rounded-full bg-teal-800">
                    <div className="h-1 rounded-full bg-teal-300" style={{ width: `${Math.max(0, Math.min(100, s.level))}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {certifications && (
          <section>
            <SideHeading>Certifications</SideHeading>
            <ul className="text-[11.5px] leading-relaxed space-y-1.5">
              {toLines(certifications).map((l, i) => <li key={i}>{l}</li>)}
            </ul>
          </section>
        )}
      </aside>

      <main className="px-9 py-9 flex flex-col gap-6 min-w-0">
        <header>
          <h1 className="text-[32px] font-extrabold text-teal-950 leading-tight tracking-tight">{name}</h1>
          {experiences?.[0]?.title && <p className="text-[13px] font-medium text-teal-700 mt-0.5">{experiences[0].title}</p>}
        </header>

        {summary && (
          <section>
            <MainHeading>Profile</MainHeading>
            <p className="text-[13px] leading-relaxed">{summary}</p>
          </section>
        )}

        {hasExperience(experiences) && (
          <section>
            <MainHeading>Experience</MainHeading>
            <div className="flex flex-col gap-4">
              {experiences.filter((e) => e.title || e.company || e.details).map((exp, idx) => (
                <div key={idx}>
                  <div className="flex items-baseline justify-between gap-4">
                    <div className="text-[13.5px] font-semibold text-slate-900">{exp.title}</div>
                    <div className="text-[11px] text-slate-500 whitespace-nowrap">{dateRange(exp)}</div>
                  </div>
                  {exp.company && <div className="text-[12px] font-medium text-teal-700">{exp.company}</div>}
                  <Bullets text={exp.details} className="mt-1 text-[12.5px] leading-relaxed marker:text-teal-500" />
                </div>
              ))}
            </div>
          </section>
        )}

        {projects && (
          <section>
            <MainHeading>Projects</MainHeading>
            <Bullets text={projects} className="text-[12.5px] leading-relaxed marker:text-teal-500" />
          </section>
        )}

        {education && (
          <section>
            <MainHeading>Education</MainHeading>
            <ul className="text-[12.5px] leading-relaxed space-y-0.5">
              {toLines(education).map((l, i) => <li key={i} className={i === 0 ? "font-semibold text-slate-900" : ""}>{l}</li>)}
            </ul>
          </section>
        )}
      </main>
    </div>
  );
}
