const formatNotificationMessage = ({
    dynamicValues = {},
    text
}) => {
    if(!text) return '';
    if(!dynamicValues) dynamicValues = {};

    for(const key of Object.keys(dynamicValues)){
        if(text.includes(`{${key}}`)){
            text = text.replace(`{${key}}`, dynamicValues[key])
        }
    }

    return text;
}

module.exports = {
    formatNotificationMessage
}