import { describe, expect, it } from 'vitest';
import { z } from 'zod/v4';

import zDefault from './v4';

describe('v4', () => {
	describe('empty object', () => {
		it('should handle empty object schema', () => {
			const schema = z.object({});
			const res = zDefault(schema);

			expect(res).toEqual({});
		});

		it('should handle all types', () => {
			const schema = z.object({
				any: z.any(),
				base64: z.base64(),
				base64url: z.base64url(),
				bigint: z.bigint(),
				boolean: z.boolean(),
				cidrv4: z.cidrv4(),
				cidrv6: z.cidrv6(),
				cuid: z.cuid(),
				cuid2: z.cuid2(),
				custom: z.custom(),
				date: z.date(),
				default: z.string().default('default'),
				discriminatedUnion: z.discriminatedUnion('type', [
					z.object({
						type: z.literal('a'),
						value: z.string()
					}),
					z.object({
						type: z.literal('b'),
						value: z.number()
					})
				]),
				e164: z.e164(),
				email: z.email(),
				emoji: z.emoji(),
				enum: z.enum(['A', 'B', 'C']),
				file: z.file(),
				float32: z.float32(),
				float64: z.float64(),
				guid: z.guid(),
				hostname: z.hostname(),
				instanceof: z.instanceof(Date),
				int: z.int(),
				int32: z.int32(),
				int64: z.int64(),
				intersection: z.intersection(z.string(), z.number()),
				ipv4: z.ipv4(),
				ipv6: z.ipv6(),
				isoDate: z.iso.date(),
				isoDateTime: z.iso.datetime(),
				isoDuration: z.iso.duration(),
				isoTime: z.iso.time(),
				jwt: z.jwt(),
				keyof: z.keyof(
					z.object({
						foo: z.string(),
						bar: z.number()
					})
				),
				ksuid: z.ksuid(),
				literal: z.literal('literal'),
				map: z.map(z.string(), z.string()),
				nan: z.nan(),
				nanoid: z.nanoid(),
				never: z.never(),
				null: z.null(),
				nullable: z.string().nullable(),
				number: z.number(),
				object: z.object({
					key: z.string()
				}),
				optional: z.string().optional(),
				promise: z.promise(z.string()),
				record: z.record(z.string(), z.string()),
				set: z.set(z.string()),
				string: z.string(),
				stringbool: z.stringbool(),
				symbol: z.symbol(),
				tuple: z.tuple([z.string(), z.number()]),
				uint32: z.uint32(),
				uint64: z.uint64(),
				ulid: z.ulid(),
				undefined: z.undefined(),
				union: z.union([z.string(), z.number()]),
				unknown: z.unknown(),
				url: z.url(),
				uuid: z.uuid(),
				uuidv4: z.uuidv4(),
				uuidv6: z.uuidv6(),
				uuidv7: z.uuidv7(),
				void: z.void(),
				xid: z.xid()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				any: undefined,
				base64: '',
				base64url: '',
				bigint: 0n,
				boolean: false,
				cidrv4: '',
				cidrv6: '',
				cuid: '',
				cuid2: '',
				custom: undefined,
				date: null,
				default: 'default',
				discriminatedUnion: {
					type: 'a',
					value: ''
				},
				e164: '',
				email: '',
				emoji: '',
				enum: 'A',
				file: undefined,
				float32: 0,
				float64: 0,
				guid: '',
				hostname: '',
				instanceof: undefined,
				int: 0,
				int32: 0,
				int64: 0n,
				intersection: '',
				ipv4: '',
				ipv6: '',
				isoDate: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/),
				isoDateTime: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
				isoDuration: 'P0D',
				isoTime: expect.stringMatching(/^\d{2}:\d{2}:\d{2}.\d{3}Z$/),
				jwt: '',
				keyof: 'foo',
				ksuid: '',
				literal: 'literal',
				map: new Map(),
				nan: NaN,
				nanoid: '',
				never: undefined,
				null: null,
				nullable: null,
				number: 0,
				object: {
					key: ''
				},
				optional: '',
				promise: Promise.resolve(''),
				record: {},
				set: new Set(),
				string: '',
				stringbool: false,
				symbol: '',
				tuple: [],
				uint32: 0,
				uint64: 0n,
				ulid: '',
				unknown: undefined,
				undefined: undefined,
				union: '',
				url: '',
				uuid: '',
				uuidv4: '',
				uuidv6: '',
				uuidv7: '',
				void: undefined,
				xid: ''
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
			const emptyObject = {};
			const schema = z.object({
				age: z.number().default(30),
				map: z.map(z.string(), z.string()).default(new Map([['key', 'value']])),
				object: z.object({}).default(emptyObject),
				name: z.string().default('John'),
				set: z.set(z.string()).default(new Set(['value']))
			});

			const res = zDefault(schema);

			expect(res.object).not.toBe(emptyObject);
			expect(res).toEqual({
				age: 30,
				map: new Map([['key', 'value']]),
				object: {},
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

	describe('any', () => {
		it('should handle any without source', () => {
			const schema = z.object({
				anything: z.any()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				anything: undefined
			});
		});

		it('should handle any with source', () => {
			const schema = z.object({
				anything: z.any()
			});

			const source = {
				anything: { complex: 'object', with: ['nested', 'values'] }
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				anything: { complex: 'object', with: ['nested', 'values'] }
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

	describe('bigint', () => {
		it('should handle bigint without source', () => {
			const schema = z.object({
				bigNumber: z.bigint()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				bigNumber: 0n
			});
		});

		it('should handle bigint with valid source', () => {
			const schema = z.object({
				bigNumber: z.bigint()
			});

			const source = {
				bigNumber: 123n
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				bigNumber: 123n
			});
		});

		it('should handle bigint with invalid source', () => {
			const schema = z.object({
				bigNumber: z.bigint()
			});

			const source = {
				bigNumber: 'not a bigint'
			};

			// @ts-expect-error - testing invalid input type
			const res = zDefault(schema, source);

			expect(res).toEqual({
				bigNumber: 0n
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

	describe('custom', () => {
		it('should handle custom without source', () => {
			const customValidator = z.custom<string>(data => typeof data === 'string');
			const schema = z.object({
				customValue: customValidator
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				customValue: undefined
			});
		});

		it('should handle custom with source', () => {
			const customValidator = z.custom<string>(data => typeof data === 'string');
			const schema = z.object({
				customValue: customValidator
			});

			const source = {
				customValue: 'valid custom value'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				customValue: 'valid custom value'
			});
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

	describe('file', () => {
		it('should handle file without source', () => {
			const schema = z.object({
				upload: z.file()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				upload: undefined
			});
		});

		it('should handle file with source', () => {
			const schema = z.object({
				upload: z.file()
			});

			const mockFile = new File(['content'], 'test.txt', { type: 'text/plain' });
			const source = {
				upload: mockFile
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				upload: mockFile
			});
		});
	});

	describe('instanceof', () => {
		it('should handle instanceof without source', () => {
			const schema = z.object({
				date: z.instanceof(Date)
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				date: undefined
			});
		});

		it('should handle instanceof with source', () => {
			const schema = z.object({
				date: z.instanceof(Date)
			});

			const testDate = new Date('2023-01-01');
			const source = {
				date: testDate
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				date: testDate
			});
		});
	});

	describe('intersection', () => {
		it('should handle intersection without source', () => {
			const schema = z.object({
				mixed: z.intersection(
					z.object({
						name: z.string()
					}),
					z.object({
						role: z.string()
					})
				)
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				mixed: {
					name: ''
				}
			});
		});

		it('should handle intersection with source', () => {
			const schema = z.object({
				mixed: z.intersection(
					z.object({
						name: z.string()
					}),
					z.object({
						role: z.string()
					})
				)
			});

			const source = {
				mixed: {
					name: 'test',
					role: 'test'
				}
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				mixed: {
					name: 'test',
					role: 'test'
				}
			});
		});
	});

	describe('isoDate', () => {
		it('should handle iso date without source', () => {
			const schema = z.object({
				createdAt: z.iso.date()
			});

			const res = zDefault(schema);

			expect(res.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});

		it('should handle iso date with valid source', () => {
			const schema = z.object({
				createdAt: z.iso.date()
			});

			const source = {
				createdAt: '2023-12-25'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				createdAt: '2023-12-25'
			});
		});

		it('should handle iso date with invalid source', () => {
			const schema = z.object({
				createdAt: z.iso.date()
			});

			const source = {
				createdAt: 12345
			};

			// @ts-expect-error - testing invalid input type
			const res = zDefault(schema, source);

			expect(res.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});
	});

	describe('isoDateTime', () => {
		it('should handle iso datetime without source', () => {
			const schema = z.object({
				createdAt: z.iso.datetime()
			});

			const res = zDefault(schema);

			expect(res.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
		});

		it('should handle iso datetime with valid source', () => {
			const schema = z.object({
				createdAt: z.iso.datetime()
			});

			const source = {
				createdAt: '2023-12-25T10:30:00.000Z'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				createdAt: '2023-12-25T10:30:00.000Z'
			});
		});

		it('should handle iso datetime with invalid source', () => {
			const schema = z.object({
				createdAt: z.iso.datetime()
			});

			const source = {
				createdAt: new Date()
			};

			// @ts-expect-error - testing invalid input type
			const res = zDefault(schema, source);

			expect(res.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
		});
	});

	describe('isoDuration', () => {
		it('should handle iso duration without source', () => {
			const schema = z.object({
				duration: z.iso.duration()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				duration: 'P0D'
			});
		});

		it('should handle iso duration with valid source', () => {
			const schema = z.object({
				duration: z.iso.duration()
			});

			const source = {
				duration: 'P1Y2M3DT4H5M6S'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				duration: 'P1Y2M3DT4H5M6S'
			});
		});

		it('should handle iso duration with invalid source', () => {
			const schema = z.object({
				duration: z.iso.duration()
			});

			const source = {
				duration: 123
			};

			// @ts-expect-error - testing invalid input type
			const res = zDefault(schema, source);

			expect(res).toEqual({
				duration: 'P0D'
			});
		});
	});

	describe('isoTime', () => {
		it('should handle iso time without source', () => {
			const schema = z.object({
				time: z.iso.time()
			});

			const res = zDefault(schema);

			expect(res.time).toMatch(/^\d{2}:\d{2}:\d{2}.\d{3}Z$/);
		});

		it('should handle iso time with valid source', () => {
			const schema = z.object({
				time: z.iso.time()
			});

			const source = {
				time: '10:30:00.000Z'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				time: '10:30:00.000Z'
			});
		});

		it('should handle iso time with invalid source', () => {
			const schema = z.object({
				time: z.iso.time()
			});

			const source = {
				time: 12345
			};

			// @ts-expect-error - testing invalid input type
			const res = zDefault(schema, source);

			expect(res.time).toMatch(/^\d{2}:\d{2}:\d{2}.\d{3}Z$/);
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

	describe('keyof', () => {
		it('should handle keyof without source', () => {
			const baseSchema = z.object({
				foo: z.string(),
				bar: z.number(),
				baz: z.boolean()
			});

			const schema = z.object({
				key: z.keyof(baseSchema)
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				key: 'foo'
			});
		});

		it('should handle keyof with source', () => {
			const baseSchema = z.object({
				foo: z.string(),
				bar: z.number(),
				baz: z.boolean()
			});

			const schema = z.object({
				key: z.keyof(baseSchema)
			});

			const source = {
				key: 'bar' as const
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				key: 'bar'
			});
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

		it('should handle minimum number', () => {
			const schema = z.object({
				number: z.number().min(10)
			});
			const res = zDefault(schema);

			expect(res).toEqual({ number: 10 });
		});
	});

	describe('numeric types', () => {
		it('should handle specialized number types', () => {
			const schema = z.object({
				float32: z.float32(),
				float64: z.float64(),
				int: z.int(),
				int32: z.int32(),
				int64: z.int64(),
				uint32: z.uint32(),
				uint64: z.uint64()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				float32: 0,
				float64: 0,
				int: 0,
				int32: 0,
				int64: 0n,
				uint32: 0,
				uint64: 0n
			});
		});

		it('should handle specialized number types with source', () => {
			const schema = z.object({
				float32: z.float32(),
				float64: z.float64(),
				int: z.int(),
				int32: z.int32(),
				int64: z.int64(),
				uint32: z.uint32(),
				uint64: z.uint64()
			});

			const source = {
				float32: 3.14159,
				float64: 3.141592653589793,
				int: 42,
				int32: 2147483647,
				int64: 9223372036854775807n,
				uint32: 4294967295,
				uint64: 18446744073709551615n
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				float32: 3.14159,
				float64: 3.141592653589793,
				int: 42,
				int32: 2147483647,
				int64: 9223372036854775807n,
				uint32: 4294967295,
				uint64: 18446744073709551615n
			});
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

	describe('nan', () => {
		it('should handle nan without source', () => {
			const schema = z.object({
				notANumber: z.nan()
			});

			const res = zDefault(schema);

			expect(res.notANumber).toBeNaN();
		});

		it('should handle nan with source', () => {
			const schema = z.object({
				notANumber: z.nan()
			});

			const source = {
				notANumber: NaN
			};

			const res = zDefault(schema, source);

			expect(res.notANumber).toBeNaN();
		});
	});

	describe('never', () => {
		it('should handle never without source', () => {
			const schema = z.object({
				impossible: z.never()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				impossible: undefined
			});
		});
	});

	describe('null', () => {
		it('should handle null without source', () => {
			const schema = z.object({
				nullValue: z.null()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				nullValue: null
			});
		});

		it('should handle null with source', () => {
			const schema = z.object({
				nullValue: z.null()
			});

			const source = {
				nullValue: null
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				nullValue: null
			});
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

			expect(res).toEqual({ number: 21 });
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
					.transform(val => {
						return Number(val);
					}),
				uppercase: z
					.string()
					.default('a')
					.transform(val => {
						return val.toUpperCase();
					})
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				complex: { value: 42 },
				number: 42,
				uppercase: 'A'
			});
		});
	});

	describe('promise', () => {
		it('should handle promise without source', async () => {
			const schema = z.object({
				asyncValue: z.promise(z.string())
			});

			const res = zDefault(schema);

			expect(res.asyncValue).toBeInstanceOf(Promise);
			await expect(res.asyncValue).resolves.toBe('');
		});

		it('should handle promise with source', () => {
			const schema = z.object({
				asyncValue: z.promise(z.string())
			});

			const sourcePromise = Promise.resolve('resolved value');
			const source = {
				asyncValue: sourcePromise
			};

			const res = zDefault(schema, source);

			expect(res.asyncValue).toBe(sourcePromise);
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

	describe('stringbool', () => {
		it('should handle stringbool without source', () => {
			const schema = z.object({
				boolString: z.stringbool()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				boolString: false
			});
		});

		it('should handle stringbool with source', () => {
			const schemaTrue = z.object({
				boolStringTrue: z.stringbool(),
				boolString1: z.stringbool(),
				boolStringYes: z.stringbool(),
				boolStringOn: z.stringbool(),
				boolStringY: z.stringbool(),
				boolStringEnabled: z.stringbool()
			});

			const schemaFalse = z.object({
				boolStringFalse: z.stringbool(),
				boolString0: z.stringbool(),
				boolStringNo: z.stringbool(),
				boolStringOff: z.stringbool(),
				boolStringN: z.stringbool(),
				boolStringDisabled: z.stringbool()
			});

			const sourceTrue = {
				boolStringTrue: 'true',
				boolString1: '1',
				boolStringYes: 'yes',
				boolStringOn: 'on',
				boolStringY: 'y',
				boolStringEnabled: 'enabled'
			};

			const sourceFalse = {
				boolStringFalse: 'false',
				boolString0: '0',
				boolStringNo: 'no',
				boolStringOff: 'off',
				boolStringN: 'n',
				boolStringDisabled: 'disabled'
			};

			const resTrue = zDefault(schemaTrue, sourceTrue);
			const resFalse = zDefault(schemaFalse, sourceFalse);

			expect(resTrue).toEqual({
				boolStringTrue: true,
				boolString1: true,
				boolStringYes: true,
				boolStringOn: true,
				boolStringY: true,
				boolStringEnabled: true
			});

			expect(resFalse).toEqual({
				boolStringFalse: false,
				boolString0: false,
				boolStringNo: false,
				boolStringOff: false,
				boolStringN: false,
				boolStringDisabled: false
			});
		});
	});

	describe('string formats', () => {
		it('should handle base64 types', () => {
			const schema = z.object({
				base64: z.base64(),
				base64url: z.base64url()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				base64: '',
				base64url: ''
			});
		});

		it('should handle base64 types with source', () => {
			const schema = z.object({
				base64: z.base64(),
				base64url: z.base64url()
			});

			const source = {
				base64: 'SGVsbG8gV29ybGQ=',
				base64url: 'SGVsbG8gV29ybGQ'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				base64: 'SGVsbG8gV29ybGQ=',
				base64url: 'SGVsbG8gV29ybGQ'
			});
		});

		it('should handle CIDR types', () => {
			const schema = z.object({
				cidrv4: z.cidrv4(),
				cidrv6: z.cidrv6()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				cidrv4: '',
				cidrv6: ''
			});
		});

		it('should handle CIDR types with source', () => {
			const schema = z.object({
				cidrv4: z.cidrv4(),
				cidrv6: z.cidrv6()
			});

			const source = {
				cidrv4: '192.168.1.0/24',
				cidrv6: '2001:db8::/32'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				cidrv4: '192.168.1.0/24',
				cidrv6: '2001:db8::/32'
			});
		});

		it('should handle CUID types', () => {
			const schema = z.object({
				cuid: z.cuid(),
				cuid2: z.cuid2()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				cuid: '',
				cuid2: ''
			});
		});

		it('should handle CUID types with source', () => {
			const schema = z.object({
				cuid: z.cuid(),
				cuid2: z.cuid2()
			});

			const source = {
				cuid: 'cjld2cjxh0000qzrmn831i7rn',
				cuid2: 'tz4a98xxat96iws9zmbrgj3a'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				cuid: 'cjld2cjxh0000qzrmn831i7rn',
				cuid2: 'tz4a98xxat96iws9zmbrgj3a'
			});
		});

		it('should handle email and phone formats', () => {
			const schema = z.object({
				email: z.email(),
				e164: z.e164()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				email: '',
				e164: ''
			});
		});

		it('should handle email and phone formats with source', () => {
			const schema = z.object({
				email: z.email(),
				e164: z.e164()
			});

			const source = {
				email: 'test@example.com',
				e164: '+1234567890'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				email: 'test@example.com',
				e164: '+1234567890'
			});
		});

		it('should handle emoji format', () => {
			const schema = z.object({
				emoji: z.emoji()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				emoji: ''
			});
		});

		it('should handle emoji format with source', () => {
			const schema = z.object({
				emoji: z.emoji()
			});

			const source = {
				emoji: '🚀'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				emoji: '🚀'
			});
		});

		it('should handle GUID and UUID types', () => {
			const schema = z.object({
				guid: z.guid(),
				uuid: z.uuid(),
				uuidv4: z.uuidv4(),
				uuidv6: z.uuidv6(),
				uuidv7: z.uuidv7()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				guid: '',
				uuid: '',
				uuidv4: '',
				uuidv6: '',
				uuidv7: ''
			});
		});

		it('should handle GUID and UUID types with source', () => {
			const schema = z.object({
				guid: z.guid(),
				uuid: z.uuid(),
				uuidv4: z.uuidv4(),
				uuidv6: z.uuidv6(),
				uuidv7: z.uuidv7()
			});

			const source = {
				guid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				uuidv4: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				uuidv6: '1e3a7b81-09da-6d11-80b4-00c04fd430c8',
				uuidv7: '01234567-89ab-7def-8123-456789abcdef'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				guid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				uuidv4: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				uuidv6: '1e3a7b81-09da-6d11-80b4-00c04fd430c8',
				uuidv7: '01234567-89ab-7def-8123-456789abcdef'
			});
		});

		it('should handle IP address formats', () => {
			const schema = z.object({
				ipv4: z.ipv4(),
				ipv6: z.ipv6()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				ipv4: '',
				ipv6: ''
			});
		});

		it('should handle IP address formats with source', () => {
			const schema = z.object({
				ipv4: z.ipv4(),
				ipv6: z.ipv6()
			});

			const source = {
				ipv4: '192.168.1.1',
				ipv6: '2001:db8::1'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				ipv4: '192.168.1.1',
				ipv6: '2001:db8::1'
			});
		});

		it('should handle other string formats', () => {
			const schema = z.object({
				hostname: z.hostname(),
				jwt: z.jwt(),
				ksuid: z.ksuid(),
				nanoid: z.nanoid(),
				ulid: z.ulid(),
				url: z.url(),
				xid: z.xid()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				hostname: '',
				jwt: '',
				ksuid: '',
				nanoid: '',
				ulid: '',
				url: '',
				xid: ''
			});
		});

		it('should handle other string formats with source', () => {
			const schema = z.object({
				hostname: z.hostname(),
				jwt: z.jwt(),
				ksuid: z.ksuid(),
				nanoid: z.nanoid(),
				ulid: z.ulid(),
				url: z.url(),
				xid: z.xid()
			});

			const source = {
				hostname: 'example.com',
				jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
				ksuid: '0ujtsYcgvSTl8PAuAdqWYSMnLOv',
				nanoid: 'V1StGXR8_Z5jdHi6B-myT',
				ulid: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
				url: 'https://example.com',
				xid: '9m4e2mr0ui3e8a215n4g'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				hostname: 'example.com',
				jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
				ksuid: '0ujtsYcgvSTl8PAuAdqWYSMnLOv',
				nanoid: 'V1StGXR8_Z5jdHi6B-myT',
				ulid: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
				url: 'https://example.com',
				xid: '9m4e2mr0ui3e8a215n4g'
			});
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

	describe('tuple', () => {
		it('should handle tuple without source', () => {
			const schema = z.object({
				pair: z.tuple([z.string(), z.number()])
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				pair: []
			});
		});

		it('should handle tuple with valid source', () => {
			const schema = z.object({
				pair: z.tuple([z.string(), z.number()])
			});

			const source = {
				pair: ['hello', 42]
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				pair: ['hello', 42]
			});
		});

		it('should handle tuple with partial source', () => {
			const schema = z.object({
				pair: z.tuple([z.string(), z.number()])
			});

			const source = {
				pair: ['hello']
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				pair: ['hello']
			});
		});
	});

	describe('undefined', () => {
		it('should handle undefined without source', () => {
			const schema = z.object({
				undefinedValue: z.undefined()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				undefinedValue: undefined
			});
		});

		it('should handle undefined with source', () => {
			const schema = z.object({
				undefinedValue: z.undefined()
			});

			const source = {
				undefinedValue: undefined
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				undefinedValue: undefined
			});
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

	describe('unknown with source', () => {
		it('should handle unknown with valid source', () => {
			const schema = z.object({
				unknownValue: z.unknown()
			});

			const source = {
				unknownValue: { complex: 'data', with: ['arrays', 'and', 'objects'] }
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				unknownValue: { complex: 'data', with: ['arrays', 'and', 'objects'] }
			});
		});

		it('should handle unknown with primitive source', () => {
			const schema = z.object({
				unknownValue: z.unknown()
			});

			const source = {
				unknownValue: 'just a string'
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				unknownValue: 'just a string'
			});
		});
	});

	describe('void', () => {
		it('should handle void without source', () => {
			const schema = z.object({
				voidValue: z.void()
			});

			const res = zDefault(schema);

			expect(res).toEqual({
				voidValue: undefined
			});
		});

		it('should handle void with source', () => {
			const schema = z.object({
				voidValue: z.void()
			});

			const source = {
				voidValue: undefined
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				voidValue: undefined
			});
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

		it('should handle preprocess', () => {
			const numberSchema = z.preprocess(val => {
				return Number(val) * 2;
			}, z.number());

			const schemaObject = z.object({
				number: numberSchema
			});

			const resNumber = zDefault(numberSchema, '21');
			const resObject = zDefault(schemaObject, {
				number: '21'
			});

			expect(resNumber).toEqual(42);
			expect(resObject).toEqual({ number: 42 });
		});

		it('should handle transform', () => {
			const numberSchema = z.string().transform(val => {
				return Number(val);
			});

			const objectSchema = z.object({
				number: numberSchema,
				uppercase: z.string().transform(val => {
					return val.toUpperCase();
				}),
				complex: z.number().transform(n => {
					return { value: n * 2 };
				})
			});

			const resNumber = zDefault(numberSchema, '42');
			const resObject = zDefault(objectSchema, {
				number: '42',
				uppercase: 'hello',
				complex: 21
			});

			expect(resNumber).toEqual(42);
			expect(resObject).toEqual({
				number: 42,
				uppercase: 'HELLO',
				complex: { value: 42 }
			});
		});

		it('should handle deeply nested objects', () => {
			const schema = z.object({
				objectWithDefault: z
					.object({
						prop1: z.string(),
						prop2: z.number()
					})
					.default({
						prop1: 'default',
						prop2: 20
					}),
				posts: z.array(
					z.object({
						content: z.string(),
						tags: z.array(z.string()),
						title: z.string(),
						subtitle: z.string().default('subtitle')
					})
				),
				user: z.object({
					personal: z.object({
						name: z.string(),
						age: z.number()
					}),
					settings: z.object({
						theme: z.enum(['light', 'dark']),
						notifications: z.boolean()
					})
				})
			});

			const source = {
				objectWithDefault: {
					prop1: 'default2'
				},
				posts: [
					{
						title: 'Hello',
						tags: ['greeting']
					}
				],
				user: {
					personal: { name: 'John' },
					settings: { theme: 'dark' as const }
				}
			};

			const res = zDefault(schema, source);

			expect(res).toEqual({
				objectWithDefault: {
					prop1: 'default2',
					prop2: 0
				},
				posts: [
					{
						content: '',
						tags: ['greeting'],
						title: 'Hello',
						subtitle: 'subtitle'
					}
				],
				user: {
					personal: { name: 'John', age: 0 },
					settings: { theme: 'dark', notifications: false }
				}
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
				base64: z.base64(),
				base64url: z.base64url(),
				bigint: z.bigint(),
				boolean: z.boolean(),
				booleanUndefined: z.boolean(),
				cidrv4: z.cidrv4(),
				cidrv6: z.cidrv6(),
				cuid: z.cuid(),
				cuid2: z.cuid2(),
				custom: z.custom(),
				date: z.date(),
				default: z.string().default('default'),
				discriminatedUnion: z.discriminatedUnion('type', [
					z.object({
						type: z.literal('a'),
						value: z.string()
					}),
					z.object({
						type: z.literal('b'),
						value: z.number()
					})
				]),
				e164: z.e164(),
				email: z.email(),
				emoji: z.emoji(),
				enum: z.enum(['A', 'B', 'C']),
				file: z.file(),
				float32: z.float32(),
				float64: z.float64(),
				guid: z.guid(),
				hostname: z.hostname(),
				instanceof: z.instanceof(Date),
				int: z.int(),
				int32: z.int32(),
				int64: z.int64(),
				intersection: z.intersection(z.string(), z.number()),
				ipv4: z.ipv4(),
				ipv6: z.ipv6(),
				isoDate: z.iso.date(),
				isoDateTime: z.iso.datetime(),
				isoDuration: z.iso.duration(),
				isoTime: z.iso.time(),
				jwt: z.jwt(),
				keyof: z.keyof(
					z.object({
						foo: z.string(),
						bar: z.number()
					})
				),
				ksuid: z.ksuid(),
				literal: z.literal('literal'),
				map: z.map(z.string(), z.string()),
				nan: z.nan(),
				nanoid: z.nanoid(),
				never: z.never(),
				null: z.null(),
				nullable: z.string().nullable(),
				number: z.number(),
				numberSet: z.set(z.number()),
				numberUndefined: z.number(),
				object: z.object({
					key: z.string()
				}),
				objectLoose: z
					.object({
						key1: z.string()
					})
					.loose(),
				optional: z.string().optional(),
				promise: z.promise(z.string()),
				record: z.record(z.string(), z.union([z.string(), z.number()])),
				string: z.string(),
				stringbool: z.stringbool(),
				stringSet: z.set(z.string()),
				stringUndefined: z.string(),
				symbol: z.symbol(),
				tuple: z.tuple([z.string(), z.number()]),
				uint32: z.uint32(),
				uint64: z.uint64(),
				ulid: z.ulid(),
				undefined: z.undefined(),
				union: z.union([z.string(), z.number()]),
				unknown: z.unknown(),
				url: z.url(),
				uuid: z.uuid(),
				uuidv4: z.uuidv4(),
				uuidv6: z.uuidv6(),
				uuidv7: z.uuidv7(),
				void: z.void(),
				xid: z.xid()
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
				base64: 'SGVsbG8gV29ybGQ=',
				base64url: 'SGVsbG8gV29ybGQ',
				bigint: 10n,
				boolean: true,
				booleanUndefined: undefined,
				cidrv4: '192.168.1.0/24',
				cidrv6: '2001:db8::/32',
				cuid: 'cjld2cjxh0000qzrmn831i7rn',
				cuid2: 'tz4a98xxat96iws9zmbrgj3a',
				custom: 'custom value',
				date: new Date('2023-01-01'),
				default: 'overridden',
				discriminatedUnion: {
					type: 'b',
					value: 123
				},
				e164: '+1234567890',
				email: 'test@example.com',
				emoji: '🚀',
				enum: 'B',
				file: new File(['content'], 'test.txt', { type: 'text/plain' }),
				float32: 3.14159,
				float64: 3.141592653589793,
				forbidden: 'forbidden',
				guid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				hostname: 'example.com',
				instanceof: new Date('2023-01-01'),
				int: 42,
				int32: 2147483647,
				int64: 9223372036854775807n,
				intersection: 42,
				ipv4: '192.168.1.1',
				ipv6: '2001:db8::1',
				isoDate: '2023-01-01',
				isoDateTime: '2023-01-01T00:00:00.000Z',
				isoDuration: 'P0D',
				isoTime: '00:00:00.000Z',
				jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
				keyof: 'bar',
				ksuid: '0ujtsYcgvSTl8PAuAdqWYSMnLOv',
				literal: 'literal',
				map: new Map([['key', 'value']]),
				nan: NaN,
				nanoid: 'V1StGXR8_Z5jdHi6B-myT',
				never: undefined,
				null: null,
				nullable: null,
				number: 42,
				numberSet: new Set([42]),
				numberUndefined: undefined,
				object: {
					forbidden: 'forbidden',
					key: 'source key'
				},
				objectLoose: {
					key1: 'key1',
					key2: 'key2'
				},
				optional: 'provided',
				promise: Promise.resolve('promise'),
				record: { string: 'value', number: 42 },
				string: 'source string',
				stringbool: 'true',
				stringSet: new Set(['value']),
				stringUndefined: undefined,
				symbol,
				tuple: ['tuple', 42],
				uint32: 4294967295,
				uint64: 18446744073709551615n,
				ulid: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
				undefined: undefined,
				union: 'union',
				unknown: { complex: 'data', with: ['arrays', 'and', 'objects'] },
				url: 'https://example.com',
				uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				uuidv4: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				uuidv6: '1e3a7b81-09da-6d11-80b4-00c04fd430c8',
				uuidv7: '01234567-89ab-7def-8123-456789abcdef',
				void: undefined,
				xid: '9m4e2mr0ui3e8a215n4g'
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
				base64: 'SGVsbG8gV29ybGQ=',
				base64url: 'SGVsbG8gV29ybGQ',
				bigint: 10n,
				boolean: true,
				booleanUndefined: false,
				cidrv4: '192.168.1.0/24',
				cidrv6: '2001:db8::/32',
				cuid: 'cjld2cjxh0000qzrmn831i7rn',
				cuid2: 'tz4a98xxat96iws9zmbrgj3a',
				custom: 'custom value',
				date: new Date('2023-01-01'),
				default: 'overridden',
				discriminatedUnion: {
					type: 'b',
					value: 123
				},
				e164: '+1234567890',
				email: 'test@example.com',
				emoji: '🚀',
				enum: 'B',
				file: new File(['content'], 'test.txt', { type: 'text/plain' }),
				float32: 3.14159,
				float64: 3.141592653589793,
				guid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				hostname: 'example.com',
				instanceof: new Date('2023-01-01'),
				int: 42,
				int32: 2147483647,
				int64: 9223372036854775807n,
				intersection: 42,
				ipv4: '192.168.1.1',
				ipv6: '2001:db8::1',
				isoDate: '2023-01-01',
				isoDateTime: '2023-01-01T00:00:00.000Z',
				isoDuration: 'P0D',
				isoTime: '00:00:00.000Z',
				jwt: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
				keyof: 'bar',
				ksuid: '0ujtsYcgvSTl8PAuAdqWYSMnLOv',
				literal: 'literal',
				map: new Map([['key', 'value']]),
				nan: NaN,
				nanoid: 'V1StGXR8_Z5jdHi6B-myT',
				never: undefined,
				null: null,
				nullable: null,
				number: 42,
				numberUndefined: 0,
				numberSet: new Set([42]),
				object: {
					key: 'source key'
				},
				objectLoose: {
					key1: 'key1',
					key2: 'key2'
				},
				optional: 'provided',
				promise: Promise.resolve('promise'),
				record: { number: 42, string: 'value' },
				string: 'source string',
				stringbool: true,
				stringSet: new Set(['value']),
				stringUndefined: '',
				symbol,
				tuple: ['tuple', 42],
				uint32: 4294967295,
				uint64: 18446744073709551615n,
				ulid: '01ARZ3NDEKTSV4RRFFQ69G5FAV',
				undefined: undefined,
				union: 'union',
				unknown: { complex: 'data', with: ['arrays', 'and', 'objects'] },
				url: 'https://example.com',
				uuid: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				uuidv4: '6ba7b810-9dad-11d1-80b4-00c04fd430c8',
				uuidv6: '1e3a7b81-09da-6d11-80b4-00c04fd430c8',
				uuidv7: '01234567-89ab-7def-8123-456789abcdef',
				void: undefined,
				xid: '9m4e2mr0ui3e8a215n4g'
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
