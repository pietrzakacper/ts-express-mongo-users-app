export const getValidDocuments = async <T extends unknown>(documentsPromised: Promise<T>[]) => {
    const results = await Promise.allSettled(documentsPromised);

    const invalidResults = results.filter(
        (result) => result.status === 'rejected',
    ) as PromiseRejectedResult[];
    if (invalidResults.length > 0) {
        const errors = invalidResults.map((result) => result.reason);
        console.error('Some documents failed to validate:', ...errors);
    }

    const validResults = results.filter(
        (result) => result.status === 'fulfilled',
    ) as PromiseFulfilledResult<T>[];
    const validDocuments = validResults.map((result) => result.value);

    return validDocuments;
};
