import { z } from 'zod';
declare const defaultInstance: <T extends z.ZodTypeAny>(schema: z.AnyZodObject | z.ZodDiscriminatedUnion<string, z.ZodObject<any>[]> | z.ZodEffects<any> | z.ZodUnion<[z.ZodTypeAny, ...z.ZodTypeAny[]]>, source?: Partial<z.infer<T>>) => z.infer<T>;
export default defaultInstance;
