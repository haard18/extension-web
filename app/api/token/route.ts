/**
 * API Route: GET /api/token
 * 
 * Returns the current user's Clerk session token.
 * This token is used by the Chrome extension to authenticate requests to the backend.
 * 
 * Usage in Chrome Extension:
 * ```js
 * // In extension/background.js or content.js
 * const response = await fetch('https://your-domain.com/api/token');
 * const { token } = await response.json();
 * 
 * // Use token in Authorization header for backend requests
 * fetch('http://localhost:3000/generate', {
 *   method: 'POST',
 *   headers: {
 *     'Authorization': `Bearer ${token}`,
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({ text: 'post content' })
 * });
 * ```
 */

/**
 * API Route: GET /api/token
 * 
 * Returns the current user's Clerk session token.
 * This token is used by the Chrome extension to authenticate requests to the backend.
 * 
 * Usage in Chrome Extension:
 * ```js
 * // In extension/background.js or content.js
 * const response = await fetch('https://your-domain.com/api/token');
 * const { token } = await response.json();
 * 
 * // Use token in Authorization header for backend requests
 * fetch('http://localhost:3000/generate', {
 *   method: 'POST',
 *   headers: {
 *     'Authorization': `Bearer ${token}`,
 *     'Content-Type': 'application/json',
 *   },
 *   body: JSON.stringify({ text: 'post content' })
 * });
 * ```
 */

import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Verify user is authenticated
    const session = await auth()
    
    if (!session?.userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get the token using the getToken method
    const token = await session.getToken()

    if (!token) {
      return NextResponse.json(
        { error: 'Could not retrieve token' },
        { status: 500 }
      )
    }

    // Return the token to the extension
    return NextResponse.json({
      token,
      userId: session.userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
  } catch (error) {
    console.error('Error fetching token:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
