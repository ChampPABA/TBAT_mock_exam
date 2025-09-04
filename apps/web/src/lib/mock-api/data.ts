import type { User, UniqueCode } from "./types"
import { generateMultipleCodes } from "./secure-code-gen"

// Mock Users Database (for testing login after registration)
export const mockUsers: User[] = [
  {
    id: "user_1",
    email: "somchai@example.com",
    name: "สมชาย จิตรดี",
    school: "โรงเรียนมัธยมศึกษาเชียงใหม่",
    grade: "M.6",
    lineId: "somchai_line",
    tier: "VVIP",
    subjects: ["Physics", "Chemistry", "Biology"],
    examTicket: "TBAT-2025-SC01",
    createdAt: "2024-01-15T08:00:00Z"
  },
  {
    id: "user_2", 
    email: "siriporn@school.com",
    name: "ศิริพร สุขใส",
    school: "โรงเรียนยุพราชวิทยาลัย",
    grade: "M.5",
    lineId: "siriporn_line",
    tier: "FREE",
    subjects: ["Physics"],
    examTicket: "TBAT-2025-SR01",
    createdAt: "2024-01-20T10:30:00Z"
  }
]

// Mock Unique Codes Database - Enhanced with ADR-001 Secure Format
export const mockUniqueCodes: UniqueCode[] = [
  // Generate secure codes for testing
  ...generateMultipleCodes(10),
  
  // Add some known test codes for development/testing (using safe alphabet)
  {
    id: "code_test_1",
    code: "TBAT-2345-6789", // Special test code (safe alphabet: no 0,O,I,1)
    isUsed: false,
    usedBy: null,
    usedAt: null,
    createdAt: "2024-01-01T00:00:00Z",
    expiresAt: null,
    validationAttempts: []
  },
  {
    id: "code_test_2",
    code: "TBAT-ABCD-EFGH", // Demo code for presentations
    isUsed: false,
    usedBy: null,
    usedAt: null,
    createdAt: "2024-01-01T00:00:00Z",
    expiresAt: null,
    validationAttempts: []
  },
  // Used codes for testing error scenarios
  {
    id: "code_used_1",
    code: "TBAT-USED-9876",
    isUsed: true,
    usedBy: "somchai@example.com",
    usedAt: "2024-01-15T08:30:00Z",
    createdAt: "2024-01-01T00:00:00Z",
    expiresAt: null,
    validationAttempts: []
  }
]

// Thai Schools Database
export const mockSchools = [
  "โรงเรียนมัธยมศึกษาเชียงใหม่",
  "โรงเรียนยุพราชวิทยาลัย", 
  "โรงเรียนเชียงใหม่คริสเตียนอินเตอร์เนชั่นแนล",
  "โรงเรียนราชประชานุเคราะห์ 11",
  "โรงเรียนสรรพวิทยาคาร",
  "โรงเรียนบ้านไผ่วิทยา",
  "โรงเรียนสันกำแพงวิทยาคม",
  "โรงเรียนแม่แตงวิทยาคม",
  "โรงเรียนหางดงราษฎร์บำรุง"
]

// Mock Password Storage (Pre-hashed with bcrypt for login testing)
// Original passwords: 
// somchai@example.com: "SecurePass123"  
// siriporn@school.com: "StrongPass456"
export const mockPasswords: Record<string, string> = {
  "somchai@example.com": "$2a$10$zyCWlk6mhXytIBVJrkvBw.JaWCXoxyxZTyRNASVfoq6QvkxpGEQzO",
  "siriporn@school.com": "$2a$10$Eay1uCrx0EN.mMDQuiZPdOVIjByVI6XZcEP1L3ydjUmVVUd/v2.we"
}