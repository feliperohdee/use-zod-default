import { z } from 'zod';
declare const defaultInstance: <T extends z.ZodSchema>(schema: T, source?: any) => z.output<T>;
export default defaultInstance;
