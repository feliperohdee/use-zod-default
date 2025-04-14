import { describe, expect, it } from 'vitest';
import { z } from 'zod';

import zDefault from './index';

describe('zDefault', () => {
	describe('empty object', () => {
		it('should handle empty object schema', () => {
			const schema = z.object({});
			const res = zDefault(schema);

			expect(res).toEqual({});
		});

		it('should handle all types', () => {
			const schema = z.object({
				any: z.any(),
				bigint: z.bigint(),
				boolean: z.boolean(),
				date: z.date(),
				default: z.string().default('default'),
				discriminatedUnion: z.discriminatedUnion('type', [
					z.object({ type: z.literal('a'), value: z.string() }),
					z.object({ type: z.literal('b'), value: z.number() })
				]),
				enum: z.enum(['A', 'B', 'C']),
				instanceof: z.instanceof(Date),
				interface: z.interface({
					key: z.string(),
					'optional?': z.string()
				}),
				intersection: z.intersection(z.string(), z.number()),
				map: z.map(z.string(), z.string()),
				nan: z.nan(),
				never: z.never(),
				null: z.null(),
				nullable: z.string().nullable(),
				number: z.number(),
				object: z.object({
					key: z.string()
				}),
				promise: z.promise(z.string()),
				record: z.record(z.string(), z.string()),
				set: z.set(z.string()),
				string: z.string(),
				optional: z.string().optional(),
				symbol: z.symbol(),
				tuple: z.tuple([z.string(), z.number()]),
				undefined: z.undefined(),
				union: z.union([z.string(), z.number()]),
				void: z.void()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				any: undefined,
				bigint: 0,
				boolean: false,
				date: null,
				default: 'default',
				discriminatedUnion: { type: 'a', value: '' },
				enum: 'A',
				instanceof: undefined,
				interface: { key: '', optional: '' },
				intersection: '',
				map: new Map(),
				nan: NaN,
				never: undefined,
				null: null,
				nullable: null,
				number: 0,
				object: { key: '' },
				promise: Promise.resolve(''),
				record: {},
				set: new Set(),
				string: '',
				optional: '',
				symbol: '',
				tuple: [],
				undefined: undefined,
				union: '',
				void: undefined
			});
		});

		it('should handle nested objects', () => {
			const schema = z.object({
				user: z.object({
					name: z.string(),
					age: z.number()
				}),
				settings: z.object({
					isActive: z.boolean()
				})
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				user: { name: '', age: 0 },
				settings: { isActive: false }
			});
		});

		it('should handle optional fields', () => {
			const schema = z.object({
				required: z.string(),
				optional: z.number().optional()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				required: '',
				optional: 0
			});
		});

		it('should handle default values', () => {
			const schema = z.object({
				age: z.number().default(30),
				map: z.map(z.string(), z.string()).default(new Map([['key', 'value']])),
				name: z.string().default('John'),
				set: z.set(z.string()).default(new Set(['value']))
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				age: 30,
				map: new Map([['key', 'value']]),
				name: 'John',
				set: new Set(['value'])
			});
		});

		it('should handle nullable types', () => {
			const schema = z.object({
				nullableString: z.string().nullable(),
				nullableNumber: z.number().nullable()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				nullableString: null,
				nullableNumber: null
			});
		});

		it('should handle unknown types', () => {
			const schema = z.object({
				unknownNullableType: z.unknown().nullable(),
				unknownOptionalType: z.unknown().optional(),
				unknownType: z.unknown(),
				unknwonWithDefault: z.unknown().default('default')
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				unknownNullableType: null,
				unknownOptionalType: undefined,
				unknownType: undefined,
				unknwonWithDefault: 'default'
			});
		});
	});

	describe('array', () => {
		it('should handle array', () => {
			const schema = z.object({
				items: z.array(z.string())
			});
			const res = zDefault(schema);

			expect(res).toEqual({
				items: []
			});
		});
	});

	describe('boolean', () => {
		it('should handle boolean', () => {
			const schema = z.object({
				enabled: z.boolean()
			});
			const res = zDefault(schema);

			expect(res).toEqual({ enabled: false });
		});
	});

	describe('date', () => {
		it('should handle date', () => {
			const schema = z.object({
				createdAt: z.date()
			});

			const res = zDefault(schema);

			expect(res.createdAt).toBeNull();
		});
	});

	describe('discriminated union', () => {
		it('should handle discriminated union', () => {
			const schema = z.discriminatedUnion('type', [
				z.object({
					type: z.literal('a'),
					value: z.string()
				}),
				z.object({
					type: z.literal('b'),
					value: z.number()
				})
			]);

			const res = zDefault(schema);

			expect(res).toEqual({ type: 'a', value: '' });
		});
	});

	describe('enum', () => {
		it('should handle with multiple enums', () => {
			const colorEnum = z.enum(['red', 'green', 'blue']);
			const sizeEnum = z.enum(['small', 'medium', 'large']);
			const schema = z.object({
				color: colorEnum,
				size: sizeEnum
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				color: 'red',
				size: 'small'
			});
		});
	});

	describe('interface', () => {
		it('should handle interface', () => {
			const schema = z.interface({
				interface: z.interface({
					key: z.string(),
					'optional?': z.string()
				})
			});
			const res = zDefault(schema);

			expect(res).toEqual({
				interface: {
					key: '',
					optional: ''
				}
			});
		});
	});

	describe('literal', () => {
		it('should handle literal', () => {
			const schema = z.object({
				literal: z.literal('value')
			});
			const res = zDefault(schema);

			expect(res).toEqual({ literal: 'value' });
		});
	});

	describe('map', () => {
		it('should handle map', () => {
			const schema = z.object({
				map: z.map(z.string(), z.string())
			});
			const res = zDefault(schema);

			expect(res.map).toEqual(new Map());
		});
	});

	describe('nullable', () => {
		it('should handle nullable', () => {
			const schema = z.object({
				nullable: z.string().nullable()
			});
			const res = zDefault(schema);

			expect(res).toEqual({ nullable: null });
		});
	});

	describe('number', () => {
		it('should handle number', () => {
			const schema = z.object({
				number: z.number()
			});
			const res = zDefault(schema);

			expect(res).toEqual({ number: 0 });
		});
	});

	describe('object', () => {
		it('should handle object', () => {
			const schema = z.object({
				object: z.object({
					key: z.string()
				})
			});
			const res = zDefault(schema);

			expect(res).toEqual({ object: { key: '' } });
		});
	});

	describe('preprocess / transform', () => {
		it('should handle preprocess', () => {
			const schema = z.object({
				number: z.preprocess(val => {
					return Number(val) * 2;
				}, z.number().default(21))
			});

			const res = zDefault(schema);

			expect(res).toEqual({ number: 42 });
		});

		it('should handle transform', () => {
			const schema = z.object({
				complex: z
					.number()
					.default(21)
					.transform(n => ({ value: n * 2 })),
				number: z
					.string()
					.default('42')
					.transform(val => Number(val)),
				uppercase: z
					.string()
					.default('a')
					.transform(val => val.toUpperCase())
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				complex: { value: 42 },
				number: 42,
				uppercase: 'A'
			});
		});
	});

	describe('refinements', () => {
		it('should handle refinements', () => {
			const schema = z
				.object({
					name: z.string(),
					age: z.number()
				})
				.refine(
					data => {
						return data.age >= 18;
					},
					{
						message: 'Must be 18 or older',
						path: ['age']
					}
				);

			const res = zDefault(schema);

			expect(res).toEqual({
				name: '',
				age: 0
			});
		});

		it('should handle nested refinements', () => {
			const innerSchema = z
				.object({
					value: z.number()
				})
				.refine(data => {
					return data.value > 0;
				});

			const outerSchema = z
				.object({
					field: innerSchema
				})
				.refine(data => {
					return data.field.value < 100;
				});

			const res = zDefault(outerSchema);

			expect(res).toEqual({
				field: { value: 0 }
			});
		});
	});

	describe('record', () => {
		it('should handle record', () => {
			const schema = z.object({
				mixed: z.record(z.string(), z.union([z.string(), z.number()])),
				string: z.record(z.string(), z.string())
			});

			const source = {
				mixed: {
					key1: 'value1',
					key2: 2
				},
				string: {
					key1: 'value1',
					key2: 'value2'
				}
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				mixed: {
					key1: 'value1',
					key2: 2
				},
				string: {
					key1: 'value1',
					key2: 'value2'
				}
			});
		});
	});

	describe('set', () => {
		it('should handle set', () => {
			const schema = z.object({
				set: z.set(z.string())
			});
			const res = zDefault(schema);

			expect(res.set).toEqual(new Set());
		});
	});

	describe('string', () => {
		it('should handle string', () => {
			const schema = z.object({
				string: z.string()
			});
			const res = zDefault(schema);

			expect(res).toEqual({ string: '' });
		});
	});

	describe('symbol', () => {
		it('should handle symbol', () => {
			const schema = z.object({
				symbol: z.symbol()
			});
			const res = zDefault(schema);

			expect(res).toEqual({ symbol: '' });
		});
	});

	describe('union', () => {
		it('should handle union', () => {
			const schema = z.object({
				union: z.union([z.string(), z.number()])
			});
			const res = zDefault(schema);

			expect(res).toEqual({ union: '' });
		});
	});

	describe('with source', () => {
		it('should merge arrays', () => {
			const schema = z.object({
				items: z.array(
					z.object({
						id: z.number(),
						name: z.string()
					})
				)
			});

			const source = {
				items: [{ id: 1, name: 'Item 1' }, { id: 2 }]
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				items: [
					{ id: 1, name: 'Item 1' },
					{ id: 2, name: '' }
				]
			});
		});

		it('should handle preprocess effect', () => {
			const schema = z.object({
				number: z.preprocess(val => Number(val) * 2, z.number())
			});

			const source = {
				number: '21'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({ number: 42 });
		});

		it('should handle transform effect', () => {
			const schema = z.object({
				number: z.string().transform(val => Number(val)),
				uppercase: z.string().transform(val => val.toUpperCase()),
				complex: z.number().transform(n => ({ value: n * 2 }))
			});

			const source = {
				number: '42',
				uppercase: 'hello',
				complex: 21
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				number: 42,
				uppercase: 'HELLO',
				complex: { value: 42 }
			});
		});

		it('should handle deeply nested objects', () => {
			const schema = z.object({
				user: z.object({
					personal: z.object({
						name: z.string(),
						age: z.number()
					}),
					settings: z.object({
						theme: z.enum(['light', 'dark']),
						notifications: z.boolean()
					})
				}),
				posts: z.array(
					z.object({
						content: z.string(),
						tags: z.array(z.string()),
						title: z.string(),
						subtitle: z.string().default('subtitle')
					})
				)
			});

			const source = {
				user: {
					personal: { name: 'John' },
					settings: { theme: 'dark' as const }
				},
				posts: [
					{
						title: 'Hello',
						tags: ['greeting']
					}
				]
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				user: {
					personal: { name: 'John', age: 0 },
					settings: { theme: 'dark', notifications: false }
				},
				posts: [
					{
						content: '',
						tags: ['greeting'],
						title: 'Hello',
						subtitle: 'subtitle'
					}
				]
			});
		});

		it('should handle all types', () => {
			const symbol = Symbol('symbol');
			const schema = z.object({
				any: z.any(),
				array: z.array(z.string()),
				arrayObject: z.array(
					z.object({
						a: z.string(),
						b: z.string()
					})
				),
				bigint: z.bigint(),
				boolean: z.boolean(),
				booleanUndefined: z.boolean(),
				date: z.date(),
				default: z.string().default('default'),
				enum: z.enum(['A', 'B', 'C']),
				instanceof: z.instanceof(Date),
				interface: z.interface({
					key: z.string(),
					'optional?': z.string()
				}),
				intersection: z.intersection(z.string(), z.number()),
				map: z.map(z.string(), z.string()),
				nan: z.nan(),
				never: z.never(),
				null: z.null(),
				nullable: z.string().nullable(),
				number: z.number(),
				numberUndefined: z.number(),
				numberSet: z.set(z.number()),
				object: z.object({
					key: z.string()
				}),
				optional: z.string().optional(),
				promise: z.promise(z.string()),
				record: z.record(z.string(), z.union([z.string(), z.number()])),
				string: z.string(),
				stringSet: z.set(z.string()),
				stringUndefined: z.string(),
				symbol: z.symbol(),
				tuple: z.tuple([z.string(), z.number()]),
				undefined: z.undefined(),
				union: z.union([z.string(), z.number()]),
				void: z.void()
			});

			const source = {
				any: 'any',
				array: ['source'],
				arrayObject: [
					{
						a: 'a',
						forbidden: 'forbidden'
					}
				],
				bigint: 10,
				boolean: true,
				booleanUndefined: undefined,
				date: new Date('2023-01-01'),
				default: 'overridden',
				enum: 'B',
				forbidden: 'forbidden',
				instanceof: new Date('2023-01-01'),
				interface: { key: 'source key', optional: 'provided' },
				intersection: 42,
				map: new Map([['key', 'value']]),
				nan: NaN,
				never: undefined,
				null: null,
				nullable: null,
				number: 42,
				numberUndefined: undefined,
				numberSet: new Set([42]),
				object: {
					forbidden: 'forbidden',
					key: 'source key'
				},
				optional: 'provided',
				promise: Promise.resolve('promise'),
				record: { string: 'value', number: 42 },
				string: 'source string',
				stringSet: new Set(['value']),
				stringUndefined: undefined,
				symbol,
				tuple: ['tuple', 42],
				undefined: undefined,
				union: 'union',
				void: undefined
			};

			// @ts-expect-error
			const res = zDefault(schema, source);

			expect(res).toEqual({
				any: 'any',
				array: ['source'],
				arrayObject: [
					{
						a: 'a',
						b: ''
					}
				],
				bigint: 10,
				boolean: true,
				booleanUndefined: false,
				date: new Date('2023-01-01'),
				default: 'overridden',
				enum: 'B',
				instanceof: new Date('2023-01-01'),
				interface: { key: 'source key', optional: 'provided' },
				intersection: 42,
				map: new Map([['key', 'value']]),
				nan: NaN,
				never: undefined,
				null: null,
				nullable: null,
				number: 42,
				numberUndefined: 0,
				numberSet: new Set([42]),
				object: {
					key: 'source key'
				},
				optional: 'provided',
				promise: Promise.resolve('promise'),
				record: { number: 42, string: 'value' },
				string: 'source string',
				stringSet: new Set(['value']),
				stringUndefined: '',
				symbol,
				tuple: ['tuple', 42],
				undefined: undefined,
				union: 'union',
				void: undefined
			});
		});

		it('should handle discriminated unions', () => {
			const schema = z.object({
				res: z.discriminatedUnion('status', [
					z.object({
						status: z.literal('success'),
						data: z.string()
					}),
					z.object({
						status: z.literal('error'),
						message: z.string()
					})
				])
			});

			const successSource = {
				res: {
					status: 'success' as const,
					data: 'Some data',
					extraField: 'should be removed'
				}
			};

			const errorSource = {
				res: {
					status: 'error' as const
				}
			};

			const invalidSource = {
				res: {
					status: 'invalid'
				}
			};

			const emptyRes = zDefault(schema);
			const successRes = zDefault(schema, successSource);
			const errorRes = zDefault(schema, errorSource);
			// @ts-expect-error
			const invalidRes = zDefault(schema, invalidSource);

			expect(emptyRes).toEqual({
				res: {
					status: 'success',
					data: ''
				}
			});

			expect(successRes).toEqual({
				res: {
					status: 'success',
					data: 'Some data'
				}
			});

			expect(errorRes).toEqual({
				res: {
					status: 'error',
					message: ''
				}
			});

			expect(invalidRes).toEqual({
				res: {
					status: 'invalid',
					data: ''
				}
			});
		});

		it('should handle unions', () => {
			const schema = z.object({
				data: z.union([
					z.object({ type: z.literal('string'), value: z.string() }),
					z.object({ type: z.literal('number'), value: z.number() }),
					z.string()
				])
			});

			const stringSource = {
				data: {
					type: 'string' as const,
					value: 'test',
					extraField: 'should be removed'
				}
			};

			const numberSource = {
				data: {
					type: 'number' as const,
					value: 42
				}
			};

			const directStringSource = {
				data: 'direct string'
			};

			const invalidSource = {
				data: {
					type: 'invalid'
				}
			};

			const emptyRes = zDefault(schema);
			const stringRes = zDefault(schema, stringSource);
			const numberRes = zDefault(schema, numberSource);
			const directStringRes = zDefault(schema, directStringSource);
			// @ts-expect-error
			const invalidRes = zDefault(schema, invalidSource);

			expect(emptyRes).toEqual({
				data: {
					type: 'string',
					value: ''
				}
			});

			expect(stringRes).toEqual({
				data: {
					type: 'string',
					value: 'test'
				}
			});

			expect(numberRes).toEqual({
				data: {
					type: 'number',
					value: 42
				}
			});

			expect(directStringRes).toEqual({
				data: 'direct string'
			});

			expect(invalidRes).toEqual({
				data: {
					type: 'string',
					value: ''
				}
			});
		});

		it('should handle deeply nested unions and discriminated unions', () => {
			const nestedSchema = z.object({
				data: z.union([
					z.string(),
					z.number(),
					z.object({
						nested: z.discriminatedUnion('type', [
							z.object({ type: z.literal('a'), value: z.string() }),
							z.object({ type: z.literal('b'), value: z.number() }),
							z.object({
								type: z.literal('c'),
								value: z.union([z.string(), z.number(), z.object({ deepNested: z.boolean() })])
							})
						])
					})
				])
			});

			const validSource1 = {
				data: {
					nested: {
						type: 'a' as const,
						value: 'test',
						extra: 'remove'
					}
				}
			};

			const validSource2 = {
				data: {
					nested: {
						type: 'c' as const,
						value: { deepNested: true, extra: 'remove' }
					}
				}
			};

			const invalidSource = {
				data: {
					nested: { type: 'invalid' }
				}
			};

			const emptyRes = zDefault(nestedSchema);
			const res1 = zDefault(nestedSchema, validSource1);
			const res2 = zDefault(nestedSchema, validSource2);
			// @ts-expect-error
			const invalidRes = zDefault(nestedSchema, invalidSource);

			expect(emptyRes).toEqual({
				data: ''
			});

			expect(res1).toEqual({
				data: {
					nested: { type: 'a', value: 'test' }
				}
			});

			expect(res2).toEqual({
				data: {
					nested: { type: 'c', value: { deepNested: true } }
				}
			});

			expect(invalidRes).toEqual({
				data: ''
			});
		});
	});
});
