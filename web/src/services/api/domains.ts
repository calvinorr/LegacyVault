const API_BASE = '/api/domains';

export interface PropertyRecord {
  _id: string;
  name: string;
  recordType: string;
  provider?: string;
  accountNumber?: string;
  postcode?: string;
  contactPhone?: string;
  contactEmail?: string;
  monthlyAmount?: number;
  renewalDate?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
  documentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export const getPropertyRecords = async (): Promise<PropertyRecord[]> => {
  const response = await fetch(`${API_BASE}/property/records`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch property records');
  return response.json();
};

export const getPropertyRecord = async (id: string): Promise<PropertyRecord> => {
  const response = await fetch(`${API_BASE}/property/records/${id}`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch property record');
  return response.json();
};

export const createPropertyRecord = async (data: Partial<PropertyRecord>): Promise<PropertyRecord> => {
  const response = await fetch(`${API_BASE}/property/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create record');
  }
  return response.json();
};

export const updatePropertyRecord = async (
  id: string,
  data: Partial<PropertyRecord>
): Promise<PropertyRecord> => {
  const response = await fetch(`${API_BASE}/property/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update record');
  return response.json();
};

export const deletePropertyRecord = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/property/records/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete record');
};

// Vehicle Records
export interface VehicleRecord {
  _id: string;
  name: string;
  recordType: string;
  registration?: string;
  make?: string;
  model?: string;
  purchaseDate?: string;
  financeProvider?: string;
  financeMonthlyPayment?: number;
  motExpiryDate?: string;
  insuranceRenewalDate?: string;
  roadTaxExpiryDate?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
  documentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export const getVehicleRecords = async (): Promise<VehicleRecord[]> => {
  const response = await fetch(`${API_BASE}/vehicles/records`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch vehicle records');
  return response.json();
};

export const getVehicleRecord = async (id: string): Promise<VehicleRecord> => {
  const response = await fetch(`${API_BASE}/vehicles/records/${id}`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch vehicle record');
  return response.json();
};

export const createVehicleRecord = async (data: Partial<VehicleRecord>): Promise<VehicleRecord> => {
  const response = await fetch(`${API_BASE}/vehicles/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create vehicle record');
  }
  return response.json();
};

export const updateVehicleRecord = async (
  id: string,
  data: Partial<VehicleRecord>
): Promise<VehicleRecord> => {
  const response = await fetch(`${API_BASE}/vehicles/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update vehicle record');
  return response.json();
};

export const deleteVehicleRecord = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/vehicles/records/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete vehicle record');
};

// Finance Records
export interface FinanceRecord {
  _id: string;
  name: string;
  recordType: string;
  institution?: string;
  accountNumber?: string;
  sortCode?: string;
  currentBalance?: number;
  interestRate?: number;
  monthlyPayment?: number;
  creditLimit?: number;
  maturityDate?: string;
  contactPhone?: string;
  contactEmail?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
  documentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export const getFinanceRecords = async (): Promise<FinanceRecord[]> => {
  const response = await fetch(`${API_BASE}/finance/records`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch finance records');
  return response.json();
};

export const getFinanceRecord = async (id: string): Promise<FinanceRecord> => {
  const response = await fetch(`${API_BASE}/finance/records/${id}`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch finance record');
  return response.json();
};

export const createFinanceRecord = async (data: Partial<FinanceRecord>): Promise<FinanceRecord> => {
  const response = await fetch(`${API_BASE}/finance/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create finance record');
  }
  return response.json();
};

export const updateFinanceRecord = async (
  id: string,
  data: Partial<FinanceRecord>
): Promise<FinanceRecord> => {
  const response = await fetch(`${API_BASE}/finance/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update finance record');
  return response.json();
};

export const deleteFinanceRecord = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/finance/records/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete finance record');
};

// Employment Records
export interface EmploymentRecord {
  _id: string;
  name: string;
  recordType: string;
  employerName?: string;
  jobTitle?: string;
  salary?: number;
  pensionScheme?: string;
  pensionContribution?: number;
  contactPhone?: string;
  contactEmail?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
  documentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export const getEmploymentRecords = async (): Promise<EmploymentRecord[]> => {
  const response = await fetch(`${API_BASE}/employment/records`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch employment records');
  return response.json();
};

export const getEmploymentRecord = async (id: string): Promise<EmploymentRecord> => {
  const response = await fetch(`${API_BASE}/employment/records/${id}`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch employment record');
  return response.json();
};

export const createEmploymentRecord = async (data: Partial<EmploymentRecord>): Promise<EmploymentRecord> => {
  const response = await fetch(`${API_BASE}/employment/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create employment record');
  }
  return response.json();
};

export const updateEmploymentRecord = async (
  id: string,
  data: Partial<EmploymentRecord>
): Promise<EmploymentRecord> => {
  const response = await fetch(`${API_BASE}/employment/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update employment record');
  return response.json();
};

export const deleteEmploymentRecord = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/employment/records/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete employment record');
};

// Government Records
export interface GovernmentRecord {
  _id: string;
  name: string;
  recordType: string;
  referenceNumber?: string;
  niNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  renewalDate?: string;
  contactPhone?: string;
  contactEmail?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
  documentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export const getGovernmentRecords = async (): Promise<GovernmentRecord[]> => {
  const response = await fetch(`${API_BASE}/government/records`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch government records');
  return response.json();
};

export const getGovernmentRecord = async (id: string): Promise<GovernmentRecord> => {
  const response = await fetch(`${API_BASE}/government/records/${id}`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch government record');
  return response.json();
};

export const createGovernmentRecord = async (data: Partial<GovernmentRecord>): Promise<GovernmentRecord> => {
  const response = await fetch(`${API_BASE}/government/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create government record');
  }
  return response.json();
};

export const updateGovernmentRecord = async (
  id: string,
  data: Partial<GovernmentRecord>
): Promise<GovernmentRecord> => {
  const response = await fetch(`${API_BASE}/government/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update government record');
  return response.json();
};

export const deleteGovernmentRecord = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/government/records/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete government record');
};

// Insurance Records
export interface InsuranceRecord {
  _id: string;
  name: string;
  recordType: string;
  provider?: string;
  policyNumber?: string;
  coverageAmount?: number;
  monthlyPremium?: number;
  startDate?: string;
  renewalDate?: string;
  contactPhone?: string;
  contactEmail?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
  documentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export const getInsuranceRecords = async (): Promise<InsuranceRecord[]> => {
  const response = await fetch(`${API_BASE}/insurance/records`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch insurance records');
  return response.json();
};

export const getInsuranceRecord = async (id: string): Promise<InsuranceRecord> => {
  const response = await fetch(`${API_BASE}/insurance/records/${id}`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch insurance record');
  return response.json();
};

export const createInsuranceRecord = async (data: Partial<InsuranceRecord>): Promise<InsuranceRecord> => {
  const response = await fetch(`${API_BASE}/insurance/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create insurance record');
  }
  return response.json();
};

export const updateInsuranceRecord = async (
  id: string,
  data: Partial<InsuranceRecord>
): Promise<InsuranceRecord> => {
  const response = await fetch(`${API_BASE}/insurance/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update insurance record');
  return response.json();
};

export const deleteInsuranceRecord = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/insurance/records/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete insurance record');
};

// Legal Records
export interface LegalRecord {
  _id: string;
  name: string;
  recordType: string;
  documentType?: string;
  solicitorName?: string;
  referenceNumber?: string;
  dateCreated?: string;
  reviewDate?: string;
  location?: string;
  contactPhone?: string;
  contactEmail?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
  documentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export const getLegalRecords = async (): Promise<LegalRecord[]> => {
  const response = await fetch(`${API_BASE}/legal/records`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch legal records');
  return response.json();
};

export const getLegalRecord = async (id: string): Promise<LegalRecord> => {
  const response = await fetch(`${API_BASE}/legal/records/${id}`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch legal record');
  return response.json();
};

export const createLegalRecord = async (data: Partial<LegalRecord>): Promise<LegalRecord> => {
  const response = await fetch(`${API_BASE}/legal/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create legal record');
  }
  return response.json();
};

export const updateLegalRecord = async (
  id: string,
  data: Partial<LegalRecord>
): Promise<LegalRecord> => {
  const response = await fetch(`${API_BASE}/legal/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update legal record');
  return response.json();
};

export const deleteLegalRecord = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/legal/records/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete legal record');
};

// Services Records
export interface ServicesRecord {
  _id: string;
  name: string;
  recordType: string;
  serviceProvider?: string;
  serviceType?: string;
  contactName?: string;
  contactPhone?: string;
  contactEmail?: string;
  hourlyRate?: number;
  lastServiceDate?: string;
  nextServiceDate?: string;
  priority: 'Critical' | 'Important' | 'Standard';
  notes?: string;
  documentIds?: string[];
  createdAt: string;
  updatedAt: string;
}

export const getServicesRecords = async (): Promise<ServicesRecord[]> => {
  const response = await fetch(`${API_BASE}/services/records`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch services records');
  return response.json();
};

export const getServicesRecord = async (id: string): Promise<ServicesRecord> => {
  const response = await fetch(`${API_BASE}/services/records/${id}`, {
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to fetch services record');
  return response.json();
};

export const createServicesRecord = async (data: Partial<ServicesRecord>): Promise<ServicesRecord> => {
  const response = await fetch(`${API_BASE}/services/records`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create services record');
  }
  return response.json();
};

export const updateServicesRecord = async (
  id: string,
  data: Partial<ServicesRecord>
): Promise<ServicesRecord> => {
  const response = await fetch(`${API_BASE}/services/records/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update services record');
  return response.json();
};

export const deleteServicesRecord = async (id: string): Promise<void> => {
  const response = await fetch(`${API_BASE}/services/records/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  });
  if (!response.ok) throw new Error('Failed to delete services record');
};
