module.exports = {
    extends: 'google',
    env: { es6: true, browser: true },
    rules: {
        'max-params': 0, // this is in conflict with how Angular handles imports so disable
        'max-len': [1, 120 , 4],
        'padded-blocks': ['error', { 'classes': 'always' }],
        "indent": ["error", 4]
    }
};
