export const matchException = (exception) => {
    const { exceptionType, startTime, missingLabellers } = exception;
    return `Punch not labelled by ${missingLabellers}`;
};

export const exceptionSummary = (exception) => {
    if (exception.exceptionType === 'MATCH_EXCEPTION') {
        const personText = exception.missingLabellers.length == 1 ? "person" : "people"
        return `punch not labelled by ${exception.missingLabellers.length} ${personText}`;
    }
    if (exception.exceptionType === 'ATTRIBUTE_EXCEPTION') {
        return `different values for ${exception.attrName}`;
    }
    return '';
    
}

export const attributeException = (exception) => {
    let { exceptionType, startTime, attrName, matchNode } = exception;
    const attrLabelling = generateLabelGroups(matchNode, attrName);
    
    const differenceString = Object.entries(attrLabelling).map(([k,v]) => {
        return v.join() + ': ' + k;
    });
    return `For ${attrName} ${differenceString}`;
}

function generateLabelGroups(obj, labelKey) {
    let labelGroups = {};

    obj.data_nodes.forEach(node => {
        // Use the labelKey to access the correct label value from the node
        const labelValue = node.data[labelKey];
        if (!labelGroups[labelValue]) {
            labelGroups[labelValue] = [];
        }
        labelGroups[labelValue].push(node.labeller_name);
    });

    return labelGroups;
}