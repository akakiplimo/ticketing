export const natsWrapper = {
  client: {
    publish: jest
      .fn()
      .mockImplementation( // we use this to ensure mock invocations
        (subject: string, data: string, callback: () => void) => {
          callback();
        }
      ),
  },
};
