const labels = {
    "benign": "Benign",
    "class1": "Class 1",
}

const matchers = {
    "class1": /the|right|left/di,
    
}

function mockClassifier(input) {
    for (const [className, regex] of Object.entries(matchers)) {
        if (regex.test(input)) {
            return labels[className];
        }
    }
    return "benign";
}
