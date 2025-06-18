import z from 'zod';
import z3 from 'zod/v3';
import z4 from 'zod/v4';

import zDefault from 'use-zod-default';
import zDefault3 from 'use-zod-default/v3';
import zDefault4 from 'use-zod-default/v4';

const schema = z.object({
	number: z.number().min(10)
});

const r = zDefault(schema);

console.log(r);

const schema3 = z3.object({
	number: z3.number().min(10)
});

const r3 = zDefault3(schema3);

console.log(r3);

const schema4 = z4.object({
	number: z4.number().min(10)
});

const r4 = zDefault4(schema4);

console.log(r4);
