const validatePhone = (input_phone) => {
    return Boolean( input_phone.match(/^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/) );
}

function replaceSpaceWithUnderScore(str) {
    return str.trim().replace(/\s+/g, '_');
}

module.exports = {
    validatePhone,
    replaceSpaceWithUnderScore
}