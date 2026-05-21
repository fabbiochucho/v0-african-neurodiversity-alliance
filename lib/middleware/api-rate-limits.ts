// Rate Limit Configurations for Different API Endpoints
import { createRateLimiter } from './rate-limit'

// Strict limits for sensitive operations
export const strictRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 requests
  message: 'Too many sensitive operations. Please try again later.',
})

// Standard limits for general APIs
export const standardRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests
  message: 'Too many requests. Please try again later.',
})

// Permissive limits for read operations
export const readRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // 300 requests
  message: 'Too many read requests. Please try again later.',
})

// Login and auth endpoints - very strict
export const authRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 attempts
  message: 'Too many login attempts. Please try again later.',
})

// Assessment submission - moderate
export const assessmentRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 submissions
  message: 'Too many assessment submissions. Please try again later.',
})

// Forum post creation - moderate
export const forumRateLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // 30 posts
  message: 'Too many posts. Please try again later.',
})

// Download/Export - permissive
export const downloadRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20, // 20 downloads
  message: 'Too many downloads. Please try again in an hour.',
})

// Email sending - strict
export const emailRateLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // 5 emails
  message: 'Too many emails sent. Please try again later.',
})
