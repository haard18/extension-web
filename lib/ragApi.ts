/**
 * RAG API Client for Company Knowledge Management
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://replier.elcarainternal.lol';

async function getAuthToken() {
  const response = await fetch('/api/token');
  const { token } = await response.json();
  return token;
}

export interface CompanyStats {
  total_documents: number;
  total_chunks: number;
  total_tokens: number;
  total_storage_bytes: number;
  last_updated: string | null;
  voice_settings: VoiceSettings | null;
}

export interface VoiceSettings {
  id: string;
  company_id: string;
  voice_guidelines: string | null;
  brand_tone: string | null;
  positioning: string | null;
  metadata: any;
  created_at: string;
  updated_at: string;
}

export interface Document {
  id: string;
  company_id: string;
  filename: string;
  file_type: 'pdf' | 'docx' | 'txt' | 'md' | 'url';
  file_size: number | null;
  source_url: string | null;
  status: 'processing' | 'completed' | 'failed';
  error_message: string | null;
  total_chunks: number;
  total_tokens: number;
  metadata: any;
  created_at: string;
  updated_at: string;
}

/**
 * Ensure a company exists for the user (create if needed)
 */
export async function ensureCompany(name?: string): Promise<{ company_id: string; existed: boolean }> {
  const token = await getAuthToken();

  const response = await fetch(`${BACKEND_URL}/company/ensure`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to ensure company');
  }

  return response.json();
}

/**
 * Upload a document to company knowledge base
 */
export async function uploadDocument(companyId: string, file: File): Promise<any> {
  const token = await getAuthToken();
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BACKEND_URL}/company/${companyId}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload document');
  }

  return response.json();
}

/**
 * Upload a URL to company knowledge base
 */
export async function uploadUrl(companyId: string, url: string): Promise<any> {
  const token = await getAuthToken();

  const response = await fetch(`${BACKEND_URL}/company/${companyId}/upload-url`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ url }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload URL');
  }

  return response.json();
}

/**
 * Get company knowledge base status and stats
 */
export async function getCompanyStatus(companyId: string): Promise<CompanyStats> {
  const token = await getAuthToken();

  const response = await fetch(`${BACKEND_URL}/company/${companyId}/status`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch company status');
  }

  return response.json();
}

/**
 * Get all documents for a company
 */
export async function getDocuments(companyId: string): Promise<{ documents: Document[] }> {
  const token = await getAuthToken();

  const response = await fetch(`${BACKEND_URL}/company/${companyId}/documents`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch documents');
  }

  return response.json();
}

/**
 * Get a single document
 */
export async function getDocument(companyId: string, documentId: string): Promise<{ document: Document }> {
  const token = await getAuthToken();

  const response = await fetch(`${BACKEND_URL}/company/${companyId}/documents/${documentId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch document');
  }

  return response.json();
}

/**
 * Delete a document
 */
export async function deleteDocument(companyId: string, documentId: string): Promise<void> {
  const token = await getAuthToken();

  const response = await fetch(`${BACKEND_URL}/company/${companyId}/documents/${documentId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete document');
  }
}

/**
 * Get company voice settings
 */
export async function getVoiceSettings(companyId: string): Promise<{ voice_settings: VoiceSettings | null }> {
  const token = await getAuthToken();

  const response = await fetch(`${BACKEND_URL}/company/${companyId}/settings`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch voice settings');
  }

  return response.json();
}

/**
 * Update company voice settings
 */
export async function updateVoiceSettings(
  companyId: string,
  settings: {
    voice_guidelines?: string;
    brand_tone?: string;
    positioning?: string;
    metadata?: any;
  }
): Promise<{ voice_settings: VoiceSettings }> {
  const token = await getAuthToken();

  const response = await fetch(`${BACKEND_URL}/company/${companyId}/settings`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update voice settings');
  }

  return response.json();
}

