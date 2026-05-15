import { Resend } from 'resend'
import { verifyEmailTemplate } from './templates/verify-email.js'
import { resetPasswordTemplate } from './templates/reset-password.js'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev'

export async function sendVerificationEmail({ to, name, token }) {
  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${token}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Verifica tu email — Mission List',
    html: verifyEmailTemplate({ name, verificationUrl }),
  })
}

export async function sendPasswordResetEmail({ to, name, token }) {
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Restablece tu contraseña — Mission List',
    html: resetPasswordTemplate({ name, resetUrl }),
  })
}
