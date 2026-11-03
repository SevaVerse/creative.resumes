"use client";
import React from "react";
import { getTemplateMeta } from "./templates/registry";
import type { ResumeData, TemplateId } from "@/types/resume";

export type { ExperienceItem, SkillItem } from "@/types/resume";

export type PrintPayload = ResumeData & { selectedTemplate: TemplateId };

export default function PrintResume(props: PrintPayload) {
  const { selectedTemplate, ...data } = props;
  const { Component } = getTemplateMeta(selectedTemplate);
  return (
    <div className="resume-container print:w-full print:mx-auto">
      <Component {...data} />
    </div>
  );
}
