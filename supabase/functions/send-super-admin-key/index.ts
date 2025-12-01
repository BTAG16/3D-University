import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Validate API key exists
    if (!RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured')
    }

    const { email, secretKey } = await req.json()

    // Validate input
    if (!email || !secretKey) {
      throw new Error('Email and secretKey are required')
    }

    console.log(`Sending email to: ${email}`)

    // Send email using Resend
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'X-Resend-Email-Output': 'raw'
      },
      body: JSON.stringify({
        from: "Resend <onboarding@resend.dev>",
        to: "rumeighoraye@gmail.com",
        subject: 'Your Super Admin Authentication Code',
        html: `
          <!DOCTYPE html>
            <html>
            <head>
              <meta charset="utf-8">
              <title>Super Admin Authentication Code</title>
            </head>
            <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center" style="padding: 40px 20px;">
                    <table width="600" cellpadding="0" cellspacing="0" border="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                      <!-- Header -->
                      <tr>
                        <td style="padding: 40px 40px 20px; text-align: center;">
                          <h1 style="margin: 0; color: #667eea; font-size: 28px;">🛡️ Super Admin Access</h1>
                        </td>
                      </tr>
                      
                      <!-- Content -->
                      <tr>
                        <td style="padding: 20px 40px;">
                          <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                            You've requested access to the Campus Explorer Super Admin dashboard.
                          </p>
                          <p style="margin: 0 0 20px; color: #374151; font-size: 16px;">
                            Your authentication code is:
                          </p>
                        </td>
                      </tr>
                      
                      <!-- Code -->
                      <tr>
                        <td style="padding: 0 40px 20px;">
                          <div style="background-color: #f3f4f6; padding: 30px; text-align: center; border-radius: 8px; border: 2px solid #667eea;">
                            <h2 style="margin: 0; font-size: 36px; letter-spacing: 12px; color: #1e293b; font-family: 'Courier New', monospace;">
                              ${secretKey}
                            </h2>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Warning -->
                      <tr>
                        <td style="padding: 20px 40px;">
                          <div style="background-color: #fef3c7; padding: 15px; border-radius: 6px; border-left: 4px solid #f59e0b;">
                            <p style="margin: 0; color: #92400e; font-size: 14px;">
                              ⚠️ This code will expire in 10 minutes. For security reasons, do not share this code with anyone.
                            </p>
                          </div>
                        </td>
                      </tr>
                      
                      <!-- Footer -->
                      <tr>
                        <td style="padding: 20px 40px 40px; text-align: center;">
                          <p style="margin: 0; color: #9ca3af; font-size: 14px;">
                            If you didn't request this code, please ignore this email.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </body>
            </html>
        `
      })
    })

    const responseText = await res.text()
    let data
    
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('Failed to parse Resend response:', responseText)
      throw new Error(`Resend API error: ${responseText}`)
    }

    if (!res.ok) {
      console.error('Resend API error:', data)
      throw new Error(data.message || 'Failed to send email')
    }

    console.log('Email sent successfully:', data)

    return new Response(
      JSON.stringify({ success: true, data }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  } catch (error) {
    console.error('Error in send-super-admin-key function:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message || 'Failed to send email'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    )
  }
})
