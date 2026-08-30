export interface HealthResponse {
  status: string;
  timestamp: string;
  service: string;
  version?: string;
  environment?: string;
}

export interface HealthCheckState {
  data: HealthResponse | null;
  loading: boolean;
  error: string | null;
  responseTimeMs: number | null;
  lastCheckedAt: string | null;
  endpointUrl: string;
}

export interface ArchitectureLayer {
  name: string;
  role: string;
  package: string;
  technologies: string[];
  description: string;
  status: 'foundation_ready' | 'phase_2_planned';
}
