export function verifyEmailTemplate({ name, verificationUrl }) {
  return `
<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><title>Verifica tu email</title></head>
<body style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
  <h1 style="color:#111">Hola, ${name}</h1>
  <p>Gracias por registrarte. Verifica tu cuenta haciendo clic en el botón:</p>
  <a href="${verificationUrl}"
     style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;text-decoration:none;border-radius:6px;font-weight:600">
    Verificar email
  </a>
  <p style="color:#666;font-size:14px;margin-top:24px">
    Este link expira en 24 horas.<br>
    Si no creaste una cuenta, ignora este email.
  </p>
</body>
</html>`
}
