import bcrypt from "bcryptjs"
import { prisma } from "./db"
import { PackageType } from "../generated/prisma"

export async function createUser(data: {
  email: string
  password: string
  thai_name: string
  phone: string
  school: string
  line_id?: string
  package_type?: PackageType
}) {
  const hashedPassword = await bcrypt.hash(data.password, 12)
  
  const user = await prisma.user.create({
    data: {
      email: data.email.toLowerCase(),
      password_hash: hashedPassword,
      name: data.thai_name,
      thai_name: data.thai_name,
      phone: data.phone,
      school: data.school,
      line_id: data.line_id,
      package_type: data.package_type || "FREE",
      pdpa_consent: true,
    },
  })

  return user
}

export async function verifyPassword(plainPassword: string, hashedPassword: string) {
  return await bcrypt.compare(plainPassword, hashedPassword)
}

export async function hashPassword(password: string) {
  return await bcrypt.hash(password, 12)
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const hashedPassword = await bcrypt.hash(newPassword, 12)
  
  return await prisma.user.update({
    where: { id: userId },
    data: { password_hash: hashedPassword },
  })
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  })
}

export async function getUserById(id: string) {
  return await prisma.user.findUnique({
    where: { id },
    include: {
      exam_codes: true,
      exam_results: true,
      payments: true,
    },
  })
}