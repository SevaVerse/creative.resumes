// Renders all templates side-by-side with sample data for MDX embedding.
// जय श्री राम
import React from 'react';
import MinimalistTemplate from './MinimalistTemplate';
import OnyxTemplate from './OnyxTemplate';
import AwesomeCVTemplate from './AwesomeCVTemplate';

// Internal sample canonical shape, transformed for each template's prop contract.
interface SampleExperience { company: string; title: string; startDate: string; endDate?: string; current?: boolean; details: string }
interface SampleSkill { name: string; level: number }

const sample = {
  name: 'Jane Doe',
  email: 'jane.doe@example.com',
  phone: '+1 555-123-4567',
  website: 'https://example.com',
  linkedin: 'https://linkedin.com/in/janedoe',
  summary: 'Engineer focused on performance, developer experience, and privacy‑respectful tooling.',
  experiences: [
    { company: 'Acme Corp', title: 'Lead Engineer', startDate: '2022', current: true, details: 'Reduced PDF latency 35% by optimizing headless browser reuse.\nImplemented security headers & rate limiting.' },
  ] as SampleExperience[],
  skills: [
    { name: 'TypeScript', level: 95 },
    { name: 'React', level: 90 },
    { name: 'Node.js', level: 85 },
  ] as SampleSkill[],
  projects: 'Resume Builder – Open source privacy-first resume tool.',
  education: 'State University — B.Sc. Computer Science (2019)',
  certifications: 'AWS Certified Developer',
};

export default function TemplateShowcase() {
  return (
    <div className="space-y-12">
      <section>
        <h3 className="text-lg font-semibold mb-3">Minimalist</h3>
        <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
          <MinimalistTemplate
            name={sample.name}
            email={sample.email}
            phone={sample.phone}
            website={sample.website}
            linkedin={sample.linkedin}
            summary={sample.summary}
            experiences={sample.experiences}
            education={sample.education}
            skills={sample.skills}
            certifications={sample.certifications}
            projects={sample.projects}
          />
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">Onyx</h3>
        <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
          <OnyxTemplate
            name={sample.name}
            email={sample.email}
            phone={sample.phone}
            website={sample.website}
            linkedin={sample.linkedin}
            summary={sample.summary}
            experiences={sample.experiences}
            education={sample.education}
            skills={sample.skills}
            certifications={sample.certifications}
            projects={sample.projects}
          />
        </div>
      </section>
      <section>
        <h3 className="text-lg font-semibold mb-3">AwesomeCV</h3>
        <div className="border rounded-lg p-4 bg-white dark:bg-neutral-900">
          <AwesomeCVTemplate
            name={sample.name}
            email={sample.email}
            phone={sample.phone}
            website={sample.website}
            linkedin={sample.linkedin}
            summary={sample.summary}
            experiences={sample.experiences}
            education={sample.education}
            skills={sample.skills}
            certifications={sample.certifications}
            projects={sample.projects}
          />
        </div>
      </section>
    </div>
  );
}
