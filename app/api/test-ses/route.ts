import { NextRequest, NextResponse } from 'next/server'
import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  // Solo accesible para usuarios autenticados en el admin
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'No autorizado' }, { status: 401 })

  const key    = process.env.AWS_SES_ACCESS_KEY_ID
  const secret = process.env.AWS_SES_SECRET_ACCESS_KEY
  const region = process.env.AWS_SES_REGION ?? 'us-east-1'
  const from   = process.env.AWS_SES_FROM_EMAIL

  const diagnostics = {
    AWS_SES_ACCESS_KEY_ID:     key    ? `${key.slice(0, 4)}...` : 'FALTA',
    AWS_SES_SECRET_ACCESS_KEY: secret ? 'configurado' : 'FALTA',
    AWS_SES_REGION:            region,
    AWS_SES_FROM_EMAIL:        from   ?? 'FALTA',
  }

  if (!key || !secret || !from) {
    return NextResponse.json({ ok: false, diagnostics, error: 'Variables de entorno incompletas' })
  }

  const ses = new SESv2Client({
    region,
    credentials: { accessKeyId: key, secretAccessKey: secret },
  })

  try {
    await ses.send(new SendEmailCommand({
      FromEmailAddress: from,
      Destination: { ToAddresses: [user.email!] },
      Content: {
        Simple: {
          Subject: { Data: 'Test SES — OK', Charset: 'UTF-8' },
          Body: { Text: { Data: 'Si recibís este mail, SES está funcionando correctamente.', Charset: 'UTF-8' } },
        },
      },
    }))

    return NextResponse.json({
      ok: true,
      diagnostics,
      message: `Email de prueba enviado a ${user.email}`,
    })
  } catch (err: unknown) {
    const e = err as Record<string, unknown>
    return NextResponse.json({
      ok: false,
      diagnostics,
      error: {
        name:    e?.name,
        message: e?.message,
        code:    (e as { Code?: string })?.Code ?? (e as { code?: string })?.code,
      },
    })
  }
}
