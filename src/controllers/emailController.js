const nodemailer = require('nodemailer');
require('dotenv').config();

async function sendEmail(req, res) {
    const { to, subject, body } = req.body;

    if (!to || !subject || !body) {
        return res.status(400).json({ error: 'Email, subject, and body are required.' });
    }

    // Create transporter (similar to SmtpClient in MailKit)
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false, // true for 465, false for 587
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        }
    });

    const mailOptions = {
        from: `"Wink Customer 🚨" <${process.env.SMTP_USER}>`,
        to,
        subject,
        text: body
    };

    try {
        await transporter.sendMail(mailOptions);
        return res.json({ message: 'Email sent successfully via POST!' });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ error: 'Failed to send email.' });
    }
}

function test(req, res) {
    return res.json({ message: 'API is working on Railway!' });
}

module.exports = { sendEmail, test };
