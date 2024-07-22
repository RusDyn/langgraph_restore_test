import { z } from 'zod';


export const exampleResultSchema = z.object({
  message: z.string().describe('Your thoughts on the chat')
});
