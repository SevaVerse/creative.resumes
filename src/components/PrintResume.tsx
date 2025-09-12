"use client";
import React from "react";
import MinimalistTemplate from "./MinimalistTemplate";
import OnyxTemplate from "./OnyxTemplate";
import AwesomeCVTemplate from "./AwesomeCVTemplate";
import SubtleElegantTemplate from "./SubtleElegantTemplate";

export type ExperienceItem = {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  details: string;
};

export type SkillItem = { name: string; level: number };

export type PrintPayload = {
  selectedTemplate: "minimalist" | "onyx" | "awesomecv" | "subtleelegant";
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

export default function PrintResume(props: PrintPayload) {
  const { selectedTemplate } = props;
  return (
    <div className="resume-container print:w-full print:mx-auto">
      {selectedTemplate === "onyx" ? (
        <OnyxTemplate {...props} />
      ) : selectedTemplate === "awesomecv" ? (
        <AwesomeCVTemplate {...props} />
      ) : selectedTemplate === "subtleelegant" ? (
        <SubtleElegantTemplate {...props} />
      ) : (
        <MinimalistTemplate {...props} />
      )}
    </div>
  );
}
