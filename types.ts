
export interface AnalysisResult {
  isAiGenerated: boolean;
  aiConfidence: number;
  manipulationNotes: string[];
  fraudRisk: 'Low' | 'Medium' | 'High';
  brandAuthenticityScore: number;
  detectedContext: string;
  foundSources: Array<{ title: string; uri: string }>;
  moderationFlags: string[];
  remediated?: boolean;
}

export interface ScanRecord {
  id: string;
  timestamp: number;
  imageUrl: string;
  result: AnalysisResult;
}

export enum AnalysisStep {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING',
  ANALYZING_VISUALS = 'ANALYZING_VISUALS',
  SEARCHING_WEB = 'SEARCHING_WEB',
  FINALIZING = 'FINALIZING',
  COMPLETED = 'COMPLETED',
  ERROR = 'ERROR',
  REMEDIATING = 'REMEDIATING'
}
