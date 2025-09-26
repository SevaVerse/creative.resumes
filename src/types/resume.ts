// Shared types for the resume application

export type ExperienceItem = {
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current?: boolean;
  details: string;
};

export type SkillItem = { 
  name: string; 
  level: number;
};

export type ResumeFormData = {
  name: string;
  email: string;
  phone: string;
  website: string;
  linkedin: string;
  summary: string;
  experiences: ExperienceItem[];
  education: string;
  skills: SkillItem[];
  certifications: string;
  projects: string;
  profilePicture?: File;
  profilePictureUrl: string;
};

export type TabsPreviewProps = {
  formData: ResumeFormData;
  onExport: (tpl: string) => void | Promise<void>;
  onEdit: () => void;
  isExporting?: boolean;
};

export type Challenge = { 
  id: string; 
  text: string; 
  completed: boolean;
};