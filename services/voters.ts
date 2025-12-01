const API_URL = 'https://pollcheck-backend.uc.r.appspot.com/';

function getToken(): string | null {
  return localStorage.getItem('token');
}

function clearToken(): void {
  localStorage.removeItem('token');
}

function authHeaders(): HeadersInit {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// Handle 401 errors by clearing invalid token and reloading
async function handleAuthError(res: Response): Promise<never> {
  if (res.status === 401) {
    clearToken();
    window.location.reload();
  }
  const data = await res.json();
  throw new Error(data.error || 'Request failed');
}

export interface VoterFromAPI {
  _id: string;
  voterId: string;
  nameMarathi: string;
  nameEnglish: string;
  relationMarathi: string;
  relationEnglish: string;
  houseNo: string;
  age: number;
  gender: string;
  hasVoted: boolean;
  votedAt: string | null;
}

export interface VotersSearchResponse {
  voters: VoterFromAPI[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface VoterStatsResponse {
  total: number;
  voted: number;
  notVoted: number;
  votingPercentage: string | number;
  byGender: Record<string, number>;
  byAgeGroup: { range: string; count: number }[];
  votingByGender: Record<string, { voted: number; notVoted: number }>;
}

type VoteFilter = 'all' | 'voted' | 'not_voted';

export async function searchVoters(
  query: string,
  page = 1,
  limit = 20,
  voteFilter: VoteFilter = 'all'
): Promise<VotersSearchResponse> {
  const params = new URLSearchParams({ q: query, page: String(page), limit: String(limit) });
  if (voteFilter !== 'all') {
    params.set('hasVoted', voteFilter === 'voted' ? 'true' : 'false');
  }
  const res = await fetch(`${API_URL}/api/voters/search?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    return handleAuthError(res);
  }
  return res.json();
}

export async function listVoters(
  page = 1,
  limit = 50,
  filters?: { gender?: string; minAge?: number; maxAge?: number; voteFilter?: VoteFilter }
): Promise<VotersSearchResponse> {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) });
  if (filters?.gender) params.set('gender', filters.gender);
  if (filters?.minAge) params.set('minAge', String(filters.minAge));
  if (filters?.maxAge) params.set('maxAge', String(filters.maxAge));
  if (filters?.voteFilter && filters.voteFilter !== 'all') {
    params.set('hasVoted', filters.voteFilter === 'voted' ? 'true' : 'false');
  }
  
  const res = await fetch(`${API_URL}/api/voters?${params}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    return handleAuthError(res);
  }
  return res.json();
}

export async function getVoterById(voterId: string): Promise<VoterFromAPI> {
  const res = await fetch(`${API_URL}/api/voters/by-id/${encodeURIComponent(voterId)}`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    return handleAuthError(res);
  }
  return res.json();
}

export async function getVoterStats(): Promise<VoterStatsResponse> {
  const res = await fetch(`${API_URL}/api/voters/stats`, {
    headers: authHeaders(),
  });
  if (!res.ok) {
    return handleAuthError(res);
  }
  return res.json();
}

export async function toggleVote(id: string): Promise<{ success: boolean; hasVoted: boolean; votedAt: string | null }> {
  const res = await fetch(`${API_URL}/api/voters/${id}/vote`, {
    method: 'PATCH',
    headers: {
      ...authHeaders(),
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) {
    return handleAuthError(res);
  }
  return res.json();
}
