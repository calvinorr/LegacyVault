// web/src/services/api/emergency.ts

export interface CriticalRecord {
  id: string;
  domain: string;
  name: string;
  recordType: string;
  contactPhone?: string;
  contactEmail?: string;
  priority: string;
  notes?: string;
  domainUrl: string;
  updatedAt: string;
}

export interface CriticalRecordsResponse {
  criticalRecords: CriticalRecord[];
  count: number;
}

export interface EmergencyChecklistDomain {
  criticalCount: number;
  recommendation: string;
}

export interface EmergencyChecklistResponse {
  checklist: Record<string, EmergencyChecklistDomain>;
}

export const emergencyApi = {
  /**
   * Get all critical priority records from all domains
   */
  getCriticalRecords: async (): Promise<CriticalRecordsResponse> => {
    const response = await fetch('/api/emergency/critical', {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch critical records');
    return response.json();
  },

  /**
   * Get emergency preparedness checklist
   */
  getChecklist: async (): Promise<EmergencyChecklistResponse> => {
    const response = await fetch('/api/emergency/checklist', {
      credentials: 'include'
    });
    if (!response.ok) throw new Error('Failed to fetch emergency checklist');
    return response.json();
  },
};
