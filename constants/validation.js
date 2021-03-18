const { EMAIL_PATTERN, DISPLAY_LENGTH, PASSWORD_PATTERN } = require('./constants')

const validateEmail = email => {
    return EMAIL_PATTERN.test(String(email).toLowerCase())
}

const validatePassword = password => {
    return PASSWORD_PATTERN.test(String(password))
}

const validateDisplayName = displayName => {
    return displayName.length >= DISPLAY_LENGTH
}

module.exports.validateCredentials = function(user) {
    return validateEmail(user.email) && validatePassword(user.password) && validateDisplayName(user.displayName)
}