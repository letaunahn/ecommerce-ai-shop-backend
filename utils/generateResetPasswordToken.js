import crypto from "crypto"

export const generateResetPasswordToken = () => {
    const resetToken = crypto.randomBytes(20).toString("hex")

    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex")

    const resetPasswordExpiredTime = Date.now() + 10 * 60 * 1000

    return{ resetToken, hashedToken, resetPasswordExpiredTime}
}