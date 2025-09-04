// Export all mock API services
export { mockAuthService } from "./auth"
export { mockCodeService } from "./codes" 
export { mockSchools } from "./data"

// Export types
export type {
  User,
  UniqueCode,
  RegisterData,
  LoginData,
  AuthResponse,
  CodeValidationResponse
} from "./types"

// Constants for API endpoints (for consistency)
export const MOCK_API_ENDPOINTS = {
  REGISTER: "/api/auth/register",
  LOGIN: "/api/auth/login", 
  VALIDATE_TOKEN: "/api/auth/validate",
  VALIDATE_CODE: "/api/codes/validate",
  GET_SCHOOLS: "/api/schools"
} as const