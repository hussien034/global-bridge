export interface HealthCheckResponse {
  status: "ok" | "error";
  service: string;
  version: string;
  timestamp: string;
  uptime: number;
}
