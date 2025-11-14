import nodemailer from "nodemailer"

export const sendEmail = async ({email, subject, message}) => {
    const transporter = nodemailer.createTransport({
        port: process.env.SMTP_PORT,
        host: process.env.SMTP_HOST,
        service: process.env.SMTP_SERVICE,
        auth: {
            user: process.env.SMTP_MAIL,
            pass: process.env.SMTP_PASSWORD
        }
    })

    const mailOptions = {
        from: process.env.SMTP_MAIL,
        to: email,
        subject: subject,
        html: message
    }
    await transporter.sendMail(mailOptions)
}