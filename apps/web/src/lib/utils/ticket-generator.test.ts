import { describe, it, expect, beforeEach } from 'vitest'
import { generateExamTicket, ticketExists, clearGeneratedTickets } from './ticket-generator'

describe('Exam Ticket Generator', () => {
  beforeEach(() => {
    clearGeneratedTickets()
  })

  it('should generate ticket in correct format', () => {
    const ticket = generateExamTicket()
    expect(ticket).toMatch(/^TBAT-2025-[A-Z0-9]{4}$/)
  })

  it('should generate unique tickets', () => {
    const tickets = new Set<string>()
    for (let i = 0; i < 100; i++) {
      const ticket = generateExamTicket()
      expect(tickets.has(ticket)).toBe(false)
      tickets.add(ticket)
    }
    expect(tickets.size).toBe(100)
  })

  it('should track generated tickets', () => {
    const ticket1 = generateExamTicket()
    const ticket2 = generateExamTicket()
    
    expect(ticketExists(ticket1)).toBe(true)
    expect(ticketExists(ticket2)).toBe(true)
    expect(ticketExists('TBAT-2025-FAKE')).toBe(false)
  })

  it('should clear generated tickets', () => {
    const ticket = generateExamTicket()
    expect(ticketExists(ticket)).toBe(true)
    
    clearGeneratedTickets()
    expect(ticketExists(ticket)).toBe(false)
  })

  it('should handle concurrent generation', () => {
    const promises = Array(50).fill(0).map(() => 
      new Promise<string>((resolve) => {
        setTimeout(() => {
          resolve(generateExamTicket())
        }, Math.random() * 10)
      })
    )
    
    return Promise.all(promises).then(tickets => {
      const uniqueTickets = new Set(tickets)
      expect(uniqueTickets.size).toBe(50)
    })
  })
})