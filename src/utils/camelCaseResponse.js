import camelcaseKeys from 'camelcase-keys';

const toCamelCase = (data) => camelcaseKeys(data, { deep: true });

export default toCamelCase;
