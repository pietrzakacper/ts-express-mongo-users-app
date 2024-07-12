const ERROR_CODES = ['email-exists'] as const;

export class BadRequestError extends Error {
    constructor(message: string, public code: (typeof ERROR_CODES)[number]) {
        super(message);
        this.name = 'BadRequestError';
    }
}
