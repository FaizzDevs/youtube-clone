import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { TRPCError } from '@trpc/server';
export const appRouter = createTRPCRouter({
  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      throw new TRPCError({ code: "BAD_REQUEST" });

      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;