"use client";
import React, { useState } from "react";
import ScaledPreview from "./ScaledPreview";
import { TAG_LABELS, TEMPLATE_LIST, carbonScore, getTemplateMeta, type TemplateTag } from "./templates/registry";
import { SAMPLE_EXPERIENCED, SAMPLE_FRESHER } from "./templates/sampleData";
import type { TemplateId } from "@/types/resume";

export type { ResumeData } from "@/types/resume";

type Filter = "all" | TemplateTag;
const FILTERS: Filter[] = ["all", "fresher", "ats", "creative", "photo"];

export default function ResumeTemplates({ onSelect }: { onSelect: (id: TemplateId) => void }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [previewTemplate, setPreviewTemplate] = useState<TemplateId | null>(null);

  const visible = TEMPLATE_LIST.filter((t) => filter === "all" || t.tags.includes(filter));
  const previewMeta = previewTemplate ? getTemplateMeta(previewTemplate) : null;
  const sampleFor = (tags: TemplateTag[]) => (tags.includes("fresher") ? SAMPLE_FRESHER : SAMPLE_EXPERIENCED);

  return (
    <>
      <div className="z-10 flex flex-col gap-4 mt-4 w-full max-w-6xl">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Choose a template</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">You can switch templates any time — your details carry over.</p>
          </div>
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter templates">
            {FILTERS.map((f) => (
              <button
                key={f}
                role="tab"
                aria-selected={filter === f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition ${
                  filter === f
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white/70 dark:bg-neutral-900/70 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-neutral-700 hover:border-blue-400"
                }`}
              >
                {f === "all" ? "All" : TAG_LABELS[f]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {visible.map((tpl) => {
            const { Component } = tpl;
            return (
              <div key={tpl.id} className="flex flex-col rounded-xl border border-gray-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/70 overflow-hidden hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition group">
                <button
                  type="button"
                  onClick={() => setPreviewTemplate(tpl.id)}
                  className="relative block bg-gray-100 dark:bg-neutral-800 p-3"
                  aria-label={`Preview ${tpl.label}`}
                >
                  <div className="rounded shadow-sm overflow-hidden pointer-events-none">
                    <ScaledPreview maxHeight={300}>
                      <Component {...sampleFor(tpl.tags)} />
                    </ScaledPreview>
                  </div>
                  {tpl.isNew && (
                    <span className="absolute top-4 left-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-600 text-white shadow">New</span>
                  )}
                  <span className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/30 text-white text-sm font-semibold">
                    Click to preview
                  </span>
                </button>
                <div className="flex flex-col flex-grow p-4 gap-2">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-bold text-gray-900 dark:text-white">{tpl.label}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold text-white ${tpl.badgeColor}`} title="Carbon score: higher = less ink">
                      🌱 {carbonScore(tpl)}/10
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 flex-grow">{tpl.description}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {tpl.tags.map((tag) => (
                      <span key={tag} className="px-2 py-0.5 rounded text-[11px] bg-gray-100 dark:bg-neutral-800 text-gray-700 dark:text-gray-300">
                        {TAG_LABELS[tag]}
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={() => onSelect(tpl.id)}
                    className="mt-2 w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                  >
                    Use this template
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {previewMeta && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[100] p-4" onClick={() => setPreviewTemplate(null)}>
          <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-200 dark:border-neutral-800 flex justify-between items-center gap-3">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{previewMeta.label}</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => { onSelect(previewMeta.id); setPreviewTemplate(null); }}
                  className="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Use this template
                </button>
                <button
                  onClick={() => setPreviewTemplate(null)}
                  className="px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-neutral-800 rounded-lg hover:bg-gray-200 dark:hover:bg-neutral-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-6 bg-gray-50 dark:bg-neutral-950">
              <div className="max-w-4xl mx-auto bg-white shadow-lg">
                <previewMeta.Component {...sampleFor(previewMeta.tags)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
