const dummyCollection = () => ({
    getFullList: async () => [],
    getList: async () => ({ items: [] }),
    create: async () => ({}),
    update: async () => ({}),
    delete: async () => ({}),
});
export const pb = { collection: dummyCollection };
export default pb;
