module.exports = {
    formatDate: (date) => {
        const options = { year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(date).toLocaleDateString(undefined, options);
    },

    validateInput: (input, type) => {
        switch (type) {
            case 'string':
                return typeof input === 'string' && input.trim() !== '';
            case 'number':
                return typeof input === 'number' && !isNaN(input);
            // Add more validation cases as needed
            default:
                return false;
        }
    },

    generateUniqueID: () => {
        return 'id-' + Math.random().toString(36).substr(2, 16);
    }
};