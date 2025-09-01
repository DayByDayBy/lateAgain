import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      throw new Error('Unauthorized')
    }

    // Get email data from request
    const { to, subject, text, from } = await req.json()

    // Server-side validation
    const validationErrors: string[] = []

    // Validate required fields
    if (!to || typeof to !== 'string') {
      validationErrors.push('Recipient email is required')
    }
    if (!subject || typeof subject !== 'string') {
      validationErrors.push('Subject is required')
    }
    if (!text || typeof text !== 'string') {
      validationErrors.push('Email text is required')
    }

    // Validate email format
    if (to) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(to.trim())) {
        validationErrors.push('Invalid recipient email format')
      }
    }

    // Validate lengths
    if (subject && subject.length > 200) {
      validationErrors.push('Subject is too long (max 200 characters)')
    }
    if (text && text.length > 5000) {
      validationErrors.push('Email text is too long (max 5000 characters)')
    }

    // Security validation - check for potentially dangerous content
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /data:\s*text\/html/gi,
    ]

    const checkContent = [to, subject, text, from].filter(Boolean).join(' ')
    for (const pattern of dangerousPatterns) {
      if (pattern.test(checkContent)) {
        validationErrors.push('Email content contains potentially unsafe content')
        break
      }
    }

    if (validationErrors.length > 0) {
      throw new Error(`Validation failed: ${validationErrors.join(', ')}`)
    }

    // Get SendGrid API key from environment
    const sendGridKey = Deno.env.get('SENDGRID_API_KEY')
    if (!sendGridKey) {
      throw new Error('SendGrid API key not configured')
    }

    // Send email via SendGrid
    const emailResponse = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${sendGridKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [{
          to: [{ email: to }],
          subject: subject,
        }],
        from: { email: from || 'noreply@lateagain.com' },
        content: [{
          type: 'text/plain',
          value: text,
        }],
      }),
    })

    if (!emailResponse.ok) {
      const errorData = await emailResponse.text()
      throw new Error(`SendGrid error: ${errorData}`)
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Email sent successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})