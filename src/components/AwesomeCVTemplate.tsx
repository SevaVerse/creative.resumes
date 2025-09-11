"use client";
import React from "react";
import Image from "next/image";

// This is a simplified adaptation inspired by the "react-cv" template (https://github.com/cvluca/react-cv)
// For a full-featured version, further modularization and styling may be needed.

type ExperienceItem = {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  details: string;
};
type SkillItem = { name: string; level: number };

type AwesomeCVTemplateProps = {
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
  profilePictureUrl?: string;
};

export default function AwesomeCVTemplate({
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
  profilePictureUrl,
}: AwesomeCVTemplateProps) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 flex" style={{ fontFamily: 'Lato, Arial, sans-serif', fontSize: '12pt' }}>
      {/* Sidebar */}
      <aside className="w-1/3 bg-[#22223B] text-white p-8 flex flex-col items-center min-h-full">
        {profilePictureUrl && (
          <div className="mb-6">
            <Image
              src={profilePictureUrl}
              alt="Profile picture"
              width={96}
              height={96}
              className="rounded-full object-cover border-4 border-white shadow"
            />
          </div>
        )}
        <div className="mb-8 text-center">
          <div className="font-bold text-2xl mb-1 text-white">{name}</div>
          <div className="text-xs mt-1 text-gray-300">{email}</div>
          <div className="text-xs text-gray-300">{phone}</div>
          {website && (
            <div className="text-xs">
              <a href={website} className="text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer">
                {website}
              </a>
            </div>
          )}
          {linkedin && (
            <div className="text-xs">
              <a href={linkedin} className="text-blue-300 hover:underline" target="_blank" rel="noopener noreferrer">
                {linkedin}
              </a>
            </div>
          )}
        </div>
        <div className="w-full">
          <div className="font-bold text-xs uppercase mb-2 tracking-wider text-gray-200 border-b border-gray-700 pb-1">Skills</div>
          <div className="flex flex-col gap-3 mb-8">
            {skills.map((skill, idx) => (
              <div key={idx} className="w-full">
                <div className="text-xs text-gray-200 mb-1">{skill.name}</div>
                <div className="w-full h-2 rounded-full bg-white/20">
                  <div
                    className="h-2 rounded-full bg-blue-300"
                    style={{ width: `${Math.max(0, Math.min(100, skill.level))}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
      {/* Main Content */}
      <main className="w-2/3 p-10 bg-white">
        <section className="mb-8">
          <div className="font-bold text-base uppercase mb-2 tracking-wider text-[#22223B] border-b border-gray-200 pb-1 flex items-center gap-2">
            <span>📄</span><span>Professional Summary</span>
          </div>
          <div className="text-sm mt-2 text-gray-800 leading-relaxed">{summary}</div>
        </section>
        <section className="mb-8">
          <div className="font-bold text-base uppercase mb-2 tracking-wider text-[#22223B] border-b border-gray-200 pb-1 flex items-center gap-2">
            <span>💼</span><span>Work Experience</span>
          </div>
          <div className="mt-3 relative">
            <div className="absolute top-0 left-2 bottom-0 w-[2px] bg-gray-200"></div>
            <div className="flex flex-col gap-4">
              {experiences?.map((exp: ExperienceItem, idx: number) => (
                <div key={idx} className="relative pl-6">
                  <div className="absolute left-0 top-1 w-3 h-3 rounded-full bg-[#22223B]"></div>
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-gray-900">{exp.title} · <span className="text-gray-700">{exp.company}</span></div>
                    <div className="text-gray-600 text-xs">{exp.startDate} – {exp.current ? 'Present' : exp.endDate || ''}</div>
                  </div>
                  <div className="mt-1 text-sm text-gray-800 whitespace-pre-line leading-relaxed">{exp.details}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mb-8">
          <div className="font-bold text-base uppercase mb-2 tracking-wider text-[#22223B] border-b border-gray-200 pb-1 flex items-center gap-2">
            <span>🎓</span><span>Education</span>
          </div>
          <div className="text-sm mt-2 whitespace-pre-line text-gray-800 leading-relaxed">{education}</div>
        </section>
        {certifications && (
          <section className="mb-8">
            <div className="font-bold text-base uppercase mb-2 tracking-wider text-[#22223B] border-b border-gray-200 pb-1 flex items-center gap-2">
              <span>🏅</span><span>Certifications</span>
            </div>
            <div className="text-sm mt-2 whitespace-pre-line text-gray-800 leading-relaxed">{certifications}</div>
          </section>
        )}
        {projects && (
          <section>
            <div className="font-bold text-base uppercase mb-2 tracking-wider text-[#22223B] border-b border-gray-200 pb-1 flex items-center gap-2">
              <span>🧩</span><span>Projects</span>
            </div>
            <div className="text-sm mt-2 whitespace-pre-line text-gray-800 leading-relaxed">{projects}</div>
          </section>
        )}
      </main>
    </div>
  );
}
