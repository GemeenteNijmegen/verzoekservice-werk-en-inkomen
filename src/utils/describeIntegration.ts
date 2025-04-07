export const describeIntegration = process.env.JEST_RUN_INTEGRATION_TESTS == 'TRUE' ? describe : describe.skip;
