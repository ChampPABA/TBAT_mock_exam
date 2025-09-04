/**
 * In-memory storage for generated tickets to ensure uniqueness.
 * NOTE: This is suitable for development/testing. In production,
 * consider using a database-backed solution for persistence.
 */
const generatedTickets = new Set<string>()

/**
 * Generates a unique exam ticket for TBAT registration.
 * 
 * The ticket format is: TBAT-2025-XXXX where XXXX is a 4-character
 * alphanumeric code. Includes collision detection with automatic
 * fallback to timestamp-based generation after 100 attempts.
 * 
 * @returns {string} A unique exam ticket string in format TBAT-2025-XXXX
 * 
 * @example
 * const ticket = generateExamTicket()
 * console.log(ticket) // "TBAT-2025-A3B4"
 */
export function generateExamTicket(): string {
  let ticket: string
  let attempts = 0
  const maxAttempts = 100

  do {
    // Generate 4 random alphanumeric characters
    const randomPart = Math.random().toString(36).substr(2, 4).toUpperCase()
    ticket = `TBAT-2025-${randomPart.padEnd(4, '0')}`
    attempts++

    if (attempts >= maxAttempts) {
      // Fallback to timestamp-based generation if too many collisions
      const timestamp = Date.now().toString(36).toUpperCase()
      ticket = `TBAT-2025-${timestamp.substr(-4).padEnd(4, '0')}`
      break
    }
  } while (generatedTickets.has(ticket))

  generatedTickets.add(ticket)
  return ticket
}

/**
 * Checks if a ticket has already been generated.
 * Useful for testing and validation purposes.
 * 
 * @param {string} ticket - The exam ticket string to check
 * @returns {boolean} True if the ticket has been generated, false otherwise
 * 
 * @example
 * const exists = ticketExists("TBAT-2025-A3B4")
 * console.log(exists) // true or false
 */
export function ticketExists(ticket: string): boolean {
  return generatedTickets.has(ticket)
}

/**
 * Clears all generated tickets from memory.
 * This function should only be used for testing purposes
 * to reset the state between test runs.
 * 
 * @returns {void}
 * 
 * @example
 * // In test setup
 * beforeEach(() => {
 *   clearGeneratedTickets()
 * })
 */
export function clearGeneratedTickets(): void {
  generatedTickets.clear()
}