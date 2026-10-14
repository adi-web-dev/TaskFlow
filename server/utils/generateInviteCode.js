const crypto = require("crypto");

const generateInviteCode = () => {
    return (
        "TF-" +
        crypto
            .randomBytes(4)
            .toString("hex")
            .toUpperCase()
    );
};

module.exports = generateInviteCode;