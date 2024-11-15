import { describe, expect, it } from 'vitest';
import { boolean, z } from 'zod';

import defaultInstance from './index';

describe('defaultInstance', () => {
	it('should handle empty object schema', () => {
		const schema = z.object({});
		const result = defaultInstance(schema);

		expect(result).toEqual({});
	});

	it('should handle with basic types', () => {
		const schema = z.object({
			string: z.string(),
			number: z.number(),
			boolean: z.boolean(),
			date: z.date()
		});

		const result = defaultInstance(schema);

		expect(result).toEqual({
			string: '',
			number: 0,
			boolean: false,
			date: null
		});
	});

	it('should handle with nested objects', () => {
		const schema = z.object({
			user: z.object({
				name: z.string(),
				age: z.number()
			}),
			settings: z.object({
				isActive: z.boolean()
			})
		});

		const result = defaultInstance(schema);

		expect(result).toEqual({
			user: { name: '', age: 0 },
			settings: { isActive: false }
		});
	});

	it('should handle with optional fields', () => {
		const schema = z.object({
			required: z.string(),
			optional: z.number().optional()
		});

		const result = defaultInstance(schema);

		expect(result).toEqual({
			required: '',
			optional: 0
		});
	});

	it('should handle with default values', () => {
		const schema = z.object({
			name: z.string().default('John'),
			age: z.number().default(30)
		});

		const result = defaultInstance(schema);

		expect(result).toEqual({
			name: 'John',
			age: 30
		});
	});

	describe('enum', () => {
		it('should handle with multiple enums', () => {
			const ColorEnum = z.enum(['red', 'green', 'blue']);
			const SizeEnum = z.enum(['small', 'medium', 'large']);
			const schema = z.object({
				color: ColorEnum,
				size: SizeEnum
			});

			const result = defaultInstance(schema);

			expect(result).toEqual({
				color: 'red',
				size: 'small'
			});
		});
	});

	describe('effects', () => {
		it('should handle ZodEffects', () => {
			const schema = z
				.object({
					name: z.string(),
					age: z.number()
				})
				.refine(data => data.age >= 18, {
					message: 'Must be 18 or older',
					path: ['age']
				});

			const result = defaultInstance(schema);

			expect(result).toEqual({
				name: '',
				age: 0
			});
		});

		it('should handle nested ZodEffects', () => {
			const innerSchema = z
				.object({
					value: z.number()
				})
				.refine(data => data.value > 0);

			const outerSchema = z
				.object({
					field: innerSchema
				})
				.refine(data => data.field.value < 100);

			const result = defaultInstance(outerSchema);

			expect(result).toEqual({
				field: { value: 0 }
			});
		});
	});

	describe('array', () => {
		it('should handle array', () => {
			const schema = z.object({
				items: z.array(z.string())
			});
			const result = defaultInstance(schema);

			expect(result).toEqual({
				items: []
			});
		});
	});

	describe('date', () => {
		it('should handle date', () => {
			const schema = z.object({
				createdAt: z.date()
			});

			const result = defaultInstance(schema);

			expect(result.createdAt).toBeNull();
		});
	});

	describe('with source', () => {
		it('should use provided date from source', () => {
			const schema = z.object({
				created: z.date(),
				updated: z.date()
			});

			const source = {
				created: new Date('2023-01-01')
			};

			const result = defaultInstance(schema, source);

			expect(result.created).toEqual(new Date('2023-01-01'));
			expect(result.updated).toBeNull();
		});

		it('should use provided enum value from source', () => {
			const statusEnum = z.enum(['pending', 'active', 'inactive']);
			const schema = z.object({
				status: statusEnum,
				otherStatus: statusEnum
			});

			const source = {
				status: 'active'
			};

			const result = defaultInstance(schema, source);

			expect(result).toEqual({
				status: 'active',
				otherStatus: 'pending'
			});
		});

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

			const result = defaultInstance(schema, source);

			expect(result).toEqual({
				items: [
					{ id: 1, name: 'Item 1' },
					{ id: 2, name: '' }
				]
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
					settings: { theme: 'dark' }
				},
				posts: [
					{
						title: 'Hello',
						tags: ['greeting']
					}
				]
			};

			const result = defaultInstance(schema, source);

			expect(result).toEqual({
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
			const schema = z.object({
				array: z.array(z.string()),
				arrayObject: z.array(
					z.object({
						a: z.string(),
						b: z.string()
					})
				),
				boolean: z.boolean(),
				booleanUndefined: z.boolean(),
				date: z.date(),
				default: z.string().default('default'),
				enum: z.enum(['A', 'B', 'C']),
				nullable: z.string().nullable(),
				number: z.number(),
				numberUndefined: z.number(),
				object: z.object({
					key: z.string()
				}),
				optional: z.string().optional(),
				string: z.string(),
				stringUndefined: z.string()
			});

			const source = {
				array: ['source'],
				arrayObject: [
					{
						a: 'a',
						forbidden: 'forbidden'
					}
				],
				boolean: true,
				booleanUndefined: undefined,
				date: new Date('2023-01-01'),
				default: 'overridden',
				enum: 'B',
				forbidden: 'forbidden',
				nullable: null,
				number: 42,
				numberUndefined: undefined,
				object: {
					forbidden: 'forbidden',
					key: 'source key'
				},
				optional: 'provided',
				string: 'source string',
				stringUndefined: undefined
			};

			const result = defaultInstance(schema, source);

			expect(result).toEqual({
				array: ['source'],
				arrayObject: [
					{
						a: 'a',
						b: ''
					}
				],
				boolean: true,
				booleanUndefined: false,
				date: new Date('2023-01-01'),
				default: 'overridden',
				enum: 'B',
				nullable: null,
				number: 42,
				numberUndefined: 0,
				object: {
					key: 'source key'
				},
				optional: 'provided',
				string: 'source string',
				stringUndefined: ''
			});
		});

		it('should handle discriminated unions correctly', () => {
			const schema = z.object({
				result: z.discriminatedUnion('status', [
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
				result: {
					status: 'success',
					data: 'Some data',
					extraField: 'should be removed'
				}
			};

			const errorSource = {
				result: {
					status: 'error'
				}
			};

			const invalidSource = {
				result: {
					status: 'invalid'
				}
			};

			const emptyResult = defaultInstance(schema);
			const successResult = defaultInstance(schema, successSource);
			const errorResult = defaultInstance(schema, errorSource);
			const invalidResult = defaultInstance(schema, invalidSource);

			expect(emptyResult).toEqual({
				result: {
					status: 'success',
					data: ''
				}
			});

			expect(successResult).toEqual({
				result: {
					status: 'success',
					data: 'Some data'
				}
			});

			expect(errorResult).toEqual({
				result: {
					status: 'error',
					message: ''
				}
			});

			expect(invalidResult).toEqual({
				result: {
					status: 'success',
					data: ''
				}
			});
		});

		it('should handle unions correctly', () => {
			const schema = z.object({
				data: z.union([
					z.object({ type: z.literal('string'), value: z.string() }),
					z.object({ type: z.literal('number'), value: z.number() }),
					z.string()
				])
			});

			const stringSource = {
				data: {
					type: 'string',
					value: 'test',
					extraField: 'should be removed'
				}
			};

			const numberSource = {
				data: {
					type: 'number',
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

			const emptyResult = defaultInstance(schema);
			const stringResult = defaultInstance(schema, stringSource);
			const numberResult = defaultInstance(schema, numberSource);
			const directStringResult = defaultInstance(schema, directStringSource);
			const invalidResult = defaultInstance(schema, invalidSource);

			expect(emptyResult).toEqual({
				data: {
					type: 'string',
					value: ''
				}
			});

			expect(stringResult).toEqual({
				data: {
					type: 'string',
					value: 'test'
				}
			});

			expect(numberResult).toEqual({
				data: {
					type: 'number',
					value: 42
				}
			});

			expect(directStringResult).toEqual({
				data: 'direct string'
			});

			expect(invalidResult).toEqual({
				data: {
					type: 'string',
					value: ''
				}
			});
		});

		it('should handle deeply nested unions and discriminated unions correctly', () => {
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
					nested: { type: 'a', value: 'test', extra: 'remove' }
				}
			};

			const validSource2 = {
				data: {
					nested: { type: 'c', value: { deepNested: true, extra: 'remove' } }
				}
			};

			const invalidSource = {
				data: {
					nested: { type: 'invalid' }
				}
			};

			const emptyResult = defaultInstance(nestedSchema);
			const result1 = defaultInstance(nestedSchema, validSource1);
			const result2 = defaultInstance(nestedSchema, validSource2);
			const invalidResult = defaultInstance(nestedSchema, invalidSource);

			expect(emptyResult).toEqual({
				data: ''
			});

			expect(result1).toEqual({
				data: {
					nested: { type: 'a', value: 'test' }
				}
			});

			expect(result2).toEqual({
				data: {
					nested: { type: 'c', value: { deepNested: true } }
				}
			});

			expect(invalidResult).toEqual({
				data: ''
			});
		});
	});
});
