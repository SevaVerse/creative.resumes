import React from "react";
import Image from "next/image";

interface SubtleElegantTemplateProps {
  name: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  summary: string;
  experiences: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    details: string;
  }>;
  education: string;
  skills: Array<{ name: string; level: number }>;
  certifications?: string;
  projects?: string;
  profilePictureUrl?: string;
}

const SubtleElegantTemplate: React.FC<SubtleElegantTemplateProps> = ({
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
}) => {
  return (
    <div className="max-w-4xl mx-auto bg-white text-gray-800 font-serif leading-relaxed">
      {/* Header */}
      <header className="border-b border-gray-200 pb-8 mb-10">
        <div className="flex items-center justify-between">
          {profilePictureUrl && (
        <Image
          src={profilePictureUrl}
          alt="Profile"
          width={96}
          height={96}
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-100 mr-6"
        />
          )}
          <div className="flex-1">
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl font-light text-gray-900">{name}</h1>
          {phone && <p className="text-xs text-gray-600">{phone}</p>}
          {email && <p className="text-xs text-gray-600">{email}</p>}
        </div>
          </div>
          <div className="text-left text-xs text-gray-600 space-y-2 ml-6">
        {website && (
          <p>
            <a href={website} className="text-blue-600 hover:underline">
          {website}
            </a>
          </p>
        )}
        {linkedin && (
          <p>
            <a href={linkedin} className="text-blue-600 hover:underline">
          {linkedin}
            </a>
          </p>
        )}
          </div>
        </div>
      </header>

      {/* Summary */}
      {summary && (
        <section className="mb-8">
          <h2 className="text-xl font-light text-gray-800 mb-3 border-b border-gray-100 pb-1">Professional Summary</h2>
          <p className="text-gray-700 leading-relaxed">{summary}</p>
        </section>
      )}

      {/* Experience */}
      {experiences.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-light text-gray-800 mb-3 border-b border-gray-100 pb-1">Work Experience</h2>
          <div className="space-y-6">
            {experiences.map((exp, idx) => (
              <div key={idx} className="border-l-2 border-gray-200 pl-4">
                <h3 className="text-lg font-medium text-gray-900">{exp.title}</h3>
                <p className="text-gray-600 mb-1">{exp.company}</p>
                <p className="text-sm text-gray-500 mb-2">
                  {exp.startDate} - {exp.current ? "Present" : exp.endDate}
                </p>
                <p className="text-gray-700 leading-relaxed">{exp.details}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education */}
      {education && (
        <section className="mb-8">
          <h2 className="text-xl font-light text-gray-800 mb-3 border-b border-gray-100 pb-1">Education</h2>
          <p className="text-gray-700">{education}</p>
        </section>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-light text-gray-800 mb-3 border-b border-gray-100 pb-1">Skills</h2>
          <div className="grid grid-cols-2 gap-4">
            {skills.map((skill, idx) => (
              <div key={idx} className="flex items-center space-x-2">
                <span className="text-gray-700">{skill.name}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gray-400 h-2 rounded-full"
                    style={{ width: `${skill.level}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500">{skill.level}%</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications */}
      {certifications && (
        <section className="mb-8">
          <h2 className="text-xl font-light text-gray-800 mb-3 border-b border-gray-100 pb-1">Certifications</h2>
          <p className="text-gray-700">{certifications}</p>
        </section>
      )}

      {/* Projects */}
      {projects && (
        <section className="mb-8">
          <h2 className="text-xl font-light text-gray-800 mb-3 border-b border-gray-100 pb-1">Projects</h2>
          <p className="text-gray-700">{projects}</p>
        </section>
      )}
    </div>
  );
};

export default SubtleElegantTemplate;