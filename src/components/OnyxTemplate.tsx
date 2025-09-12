"use client";
import React from "react";
import Image from "next/image";

// This is a simplified and adapted version of the Onyx template from tbakerx/react-resume-template
// For a full-featured version, you may want to further style and modularize this component.

type ExperienceItem = {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  details: string;
};
type SkillItem = { name: string; level: number };

type OnyxTemplateProps = {
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

export default function OnyxTemplate({
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
}: OnyxTemplateProps) {
  return (
    <div className="w-full max-w-4xl mx-auto bg-white shadow-2xl rounded-2xl overflow-hidden border border-gray-200 flex" style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '12pt' }}>
      {/* Sidebar */}
  <aside className="w-1/3 bg-slate-100 text-gray-900 p-8 flex flex-col items-center min-h-full">
        {profilePictureUrl && (
          <div className="mb-6">
            <Image
              src={profilePictureUrl}
              alt="Profile picture"
              width={96}
              height={96}
              className="rounded-full object-cover border-4 border-slate-300 shadow"
            />
          </div>
        )}
        <div className="mb-8 text-center">
          <div className="font-extrabold text-2xl mb-1 text-gray-900">{name}</div>
          <div className="text-xs mt-1 text-gray-600">{email}</div>
          <div className="text-xs text-gray-600">{phone}</div>
          {website && (
            <div className="text-xs">
              <a href={website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                {website}
              </a>
            </div>
          )}
          {linkedin && (
            <div className="text-xs">
              <a href={linkedin} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                {linkedin}
              </a>
            </div>
          )}
        </div>
        <div className="w-full">
          <div className="font-bold text-xs uppercase mb-3 tracking-wider text-gray-800">Skills</div>
          <div className="flex flex-col gap-3">
            {skills.map((skill, idx) => (
              <div key={idx} className="w-full">
                <div className="text-xs text-gray-700 mb-1">{skill.name}</div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.max(0, Math.min(100, skill.level))}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
      {/* Main Content */}
  <main className="w-2/3 p-10 bg-white">
        <section className="mb-8">
          <div className="font-bold text-base uppercase mb-2 tracking-wider text-gray-900 border-b border-gray-200 pb-1">Professional Summary</div>
          <div className="text-sm mt-2 text-gray-800 leading-relaxed">{summary}</div>
        </section>
        {/* Horizontal Timeline for Experience */}
        <section className="mb-8">
          <div className="font-bold text-base uppercase mb-4 tracking-wider text-gray-900">Work Experience</div>
          <div className="relative">
            <div className="flex flex-col gap-6">
              {experiences?.map((exp: ExperienceItem, idx: number) => (
                <div key={idx} className="relative">
                  <div className="flex items-start gap-4">
                    <div className="mt-3 w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow relative z-10"></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-900">{exp.title} · <span className="text-gray-700">{exp.company}</span></div>
                        <div className="text-gray-600 text-xs">{exp.startDate} – {exp.current ? 'Present' : exp.endDate || ''}</div>
                      </div>
                      <div className="mt-1 text-sm text-gray-800 whitespace-pre-line leading-relaxed">{exp.details}</div>
                    </div>
                  </div>
                  {/* Only render the horizontal line after each item except the last */}
                  {idx < experiences.length - 1 && (
                    <div className="ml-5 mt-2 h-[2px] bg-gray-200"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
        <section className="mb-8">
          <div className="font-bold text-base uppercase mb-2 tracking-wider text-gray-900 border-b border-gray-200 pb-1">Education</div>
          <div className="text-sm mt-2 whitespace-pre-line text-gray-800 leading-relaxed">{education}</div>
        </section>
        {certifications && (
          <section className="mb-8">
            <div className="font-bold text-base uppercase mb-2 tracking-wider text-gray-900 border-b border-gray-200 pb-1">Certifications</div>
            <div className="text-sm mt-2 whitespace-pre-line text-gray-800 leading-relaxed">{certifications}</div>
          </section>
        )}
        {projects && (
          <section>
            <div className="font-bold text-base uppercase mb-2 tracking-wider text-gray-900 border-b border-gray-200 pb-1">Projects</div>
            <div className="text-sm mt-2 whitespace-pre-line text-gray-800 leading-relaxed">{projects}</div>
          </section>
        )}
      </main>
    </div>
  );
}
