const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
});

async function enviarCodigoRecuperacao(email, codigo) {
    return transporter.sendMail({
        from: `"Guardia" <${process.env.GMAIL_USER}>`,
        to: email,
        subject: 'Código de recuperação de senha — Guardia',
        text: `Seu código de recuperação é: ${codigo}

Ele expira em 10 minutos. Se você não solicitou essa recuperação, ignore este e-mail.`,
        html: `
            <h2>Recuperação de senha — Guardia</h2>
            <p>Use o código abaixo para recuperar sua senha:</p>
            <h1 style="letter-spacing: 8px;">${codigo}</h1>
            <p>Este código expira em 10 minutos.</p>
            <p>Se você não solicitou essa recuperação, ignore este e-mail.</p>
        `,
    });
}

module.exports = { enviarCodigoRecuperacao };
