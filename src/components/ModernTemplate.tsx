import React from "react";
import Image from "next/image";
import type { ResumeData } from "@/types/resume";
import { Bullets, dateRange, hasExperience, toLines } from "./templates/shared";

// Modern: bold colour header with a two-column body (main + side rail).
export default function ModernTemplate({
  name, email, phone, website, linkedin, summary, experiences, education, skills, certifications, projects, profilePictureUrl,
}: ResumeData) {
  const contact = [email, phone, website, linkedin].filter(Boolean);

  const MainHeading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[13px] font-bold uppercase tracking-[0.15em] text-indigo-700 mb-2">{children}</h2>
  );
  const SideHeading = ({ children }: { children: React.ReactNode }) => (
    <h2 className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-800 mb-2">{children}</h2>
  );

  return (
    <div className="w-full max-w-4xl mx-auto bg-white text-gray-900 overflow-hidden" style={{ fontFamily: "Inter, 'Segoe UI', Arial, sans-serif", fontSize: "11pt" }}>
      <header className="bg-indigo-700 text-white px-10 py-7 flex items-center gap-6">
        {profilePictureUrl && (
          <Image src={profilePictureUrl} alt="Profile picture" width={84} height={84} className="rounded-full object-cover border-2 border-white/70" />
        )}
        <div className="min-w-0">
          <h1 className="text-[28px] font-extrabold leading-tight">{name}</h1>
          {contact.length > 0 && (
            <p className="mt-1.5 text-[12px] text-indigo-100 break-words">{contact.join("   •   ")}</p>
          )}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-8 px-10 py-7">
        <main className="col-span-2 flex flex-col gap-6">
          {summary && (
            <section>
              <MainHeading>Profile</MainHeading>
              <p className="text-[13px] leading-relaxed text-gray-800">{summary}</p>
            </section>
          )}
          {hasExperience(experiences) && (
            <section>
              <MainHeading>Experience</MainHeading>
              <div className="flex flex-col gap-4">
                {experiences.filter((e) => e.title || e.company || e.details).map((exp, idx) => (
                  <div key={idx} className="border-l-2 border-indigo-200 pl-3">
                    <div className="text-[13px] font-semibold">{exp.title}</div>
                    <div className="text-[12px] text-gray-600">
                      {exp.company}{exp.company && dateRange(exp) ? " · " : ""}{dateRange(exp)}
                    </div>
                    <Bullets text={exp.details} className="mt-1 text-[13px] leading-relaxed text-gray-800" />
                  </div>
                ))}
              </div>
            </section>
          )}
          {projects && (
            <section>
              <MainHeading>Projects</MainHeading>
              <Bullets text={projects} className="text-[13px] leading-relaxed text-gray-800" />
            </section>
          )}
        </main>

        <aside className="col-span-1 flex flex-col gap-6">
          {skills?.some((s) => s.name) && (
            <section>
              <SideHeading>Skills</SideHeading>
              <ul className="flex flex-col gap-2">
                {skills.filter((s) => s.name).map((s, i) => (
                  <li key={i} className="text-[12px]">
                    <div className="flex justify-between"><span>{s.name}</span></div>
                    <div className="mt-1 h-1.5 w-full rounded-full bg-indigo-100">
                      <div className="h-1.5 rounded-full bg-indigo-600" style={{ width: `${Math.max(0, Math.min(100, s.level))}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {education && (
            <section>
              <SideHeading>Education</SideHeading>
              <ul className="text-[12px] leading-relaxed text-gray-800 space-y-1">
                {toLines(education).map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </section>
          )}
          {certifications && (
            <section>
              <SideHeading>Certifications</SideHeading>
              <ul className="text-[12px] leading-relaxed text-gray-800 space-y-1">
                {toLines(certifications).map((l, i) => <li key={i}>{l}</li>)}
              </ul>
            </section>
          )}
        </aside>
      </div>
    </div>
  );
}
