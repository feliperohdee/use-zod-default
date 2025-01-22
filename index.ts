import { z } from 'zod';

const defaultInstance = <T extends z.ZodSchema>(schema: T, source: any = {}): z.output<T> => {
	const getDefaultValue = (schema: z.ZodTypeAny): any => {
		if (schema instanceof z.ZodDefault) {
			return schema._def.defaultValue();
		}

		if (schema instanceof z.ZodAny) {
			return undefined;
		}

		if (schema instanceof z.ZodArray) {
			return [];
		}

		if (schema instanceof z.ZodBoolean) {
			return false;
		}

		if (schema instanceof z.ZodDate) {
			return null;
		}

		if (schema instanceof z.ZodDiscriminatedUnion) {
			return defaultInstance(schema.options[0]);
		}

		if (schema instanceof z.ZodEffects) {
			return getDefaultValue(schema.innerType());
		}

		if (schema instanceof z.ZodEnum) {
			return schema.options[0];
		}

		if (schema instanceof z.ZodFunction) {
			return () => null;
		}

		if (schema instanceof z.ZodIntersection) {
			return defaultInstance(schema._def.left, source);
		}

		if (schema instanceof z.ZodLiteral) {
			return schema.value;
		}

		if (schema instanceof z.ZodMap) {
			return new Map();
		}

		if (schema instanceof z.ZodNativeEnum) {
			const keys = Object.keys(schema._def.values);
			
			return schema._def.values[keys[0]];
		}

		if (schema instanceof z.ZodNaN) {
			return NaN;
		}

		if (schema instanceof z.ZodNever) {
			return undefined;
		}

		if (schema instanceof z.ZodNull) {
			return null;
		}

		if (schema instanceof z.ZodNullable) {
			return null;
		}

		if (schema instanceof z.ZodNumber || schema instanceof z.ZodBigInt) {
			return schema.minValue ?? 0;
		}

		if (schema instanceof z.ZodObject) {
			return defaultInstance(schema, {});
		}

		if (schema instanceof z.ZodPipeline) {
			if (!('out' in schema._def)) {
				return undefined;
			}

			return getDefaultValue(schema._def.out);
		}

		if (schema instanceof z.ZodPromise) {
			return Promise.resolve(getDefaultValue(schema.unwrap()));
		}

		if (schema instanceof z.ZodRecord) {
			return {};
		}

		if (schema instanceof z.ZodSet) {
			return new Set();
		}

		if (schema instanceof z.ZodString) {
			return '';
		}

		if (schema instanceof z.ZodSymbol) {
			return '';
		}

		if (schema instanceof z.ZodTuple) {
			return [];
		}

		if (schema instanceof z.ZodUnion) {
			return getDefaultValue(schema.options[0]);
		}

		if (schema instanceof z.ZodUnknown) {
			return undefined;
		}

		if (schema instanceof z.ZodUndefined) {
			return undefined;
		}

		if (schema instanceof z.ZodVoid) {
			return undefined;
		}

		if (schema._def && schema._def.innerType) {
			return getDefaultValue(schema._def.innerType);
		}

		return undefined;
	};

	const processArray = (schema: z.ZodArray<any>, source: any[]): any[] => {
		if (!Array.isArray(source)) {
			return [];
		}

		const elementSchema = schema.element;

		return source.map(item => {
			return processValue(elementSchema, item);
		});
	};

	const processDiscriminatedUnion = (schema: z.ZodDiscriminatedUnion<string, z.ZodObject<any>[]>, source: any): any => {
		if (typeof source !== 'object' || source === null) {
			return getDefaultValue(schema);
		}

		const discriminator = schema.discriminator;
		const discriminatorValue = source[discriminator];
		const matchingSchema = schema.options.find(option => {
			return option.shape[discriminator] instanceof z.ZodLiteral && option.shape[discriminator].value === discriminatorValue;
		});

		if (!matchingSchema) {
			// If no matching schema is found, use the first option as default
			return processObject(schema.options[0], source);
		}

		return processObject(matchingSchema, source);
	};

	const processValue = (schema: z.ZodTypeAny, value: any): any => {
		if (schema instanceof z.ZodObject) {
			return processObject(schema, value);
		} else if (schema instanceof z.ZodArray) {
			return processArray(schema, value);
		} else if (schema instanceof z.ZodDiscriminatedUnion) {
			return processDiscriminatedUnion(schema, value);
		} else if (schema instanceof z.ZodUnion) {
			return processUnion(schema, value);
		} else if (schema instanceof z.ZodBoolean) {
			return typeof value === 'boolean' ? value : false;
		} else if (schema instanceof z.ZodMap) {
			return processMap(schema, value);
		} else if (schema instanceof z.ZodNumber) {
			return typeof value === 'number' ? value : (schema.minValue ?? 0);
		} else if (schema instanceof z.ZodRecord) {
			return processRecord(schema, value);
		} else if (schema instanceof z.ZodSet) {
			return processSet(schema, value);
		} else if (schema instanceof z.ZodString) {
			return typeof value === 'string' ? value : '';
		} else if (schema instanceof z.ZodNullable) {
			return value === null ? null : processValue(schema.unwrap(), value);
		} else {
			return value;
		}
	};

	const processMap = (schema: z.ZodMap<any, any>, source: any): any => {
		if (!(source instanceof Map)) {
			return new Map();
		}

		const valueSchema = schema._def.valueType;
		const result: any = new Map();

		source.forEach((value, key) => {
			result.set(key, processValue(valueSchema, value));
		});

		return result;
	};

	const processObject = (schema: z.ZodObject<any>, source: any): any => {
		const result: any = {};
		const shape = schema.shape;

		for (const [key, fieldSchema] of Object.entries(shape)) {
			if (key in source) {
				result[key] = processValue(fieldSchema as z.ZodTypeAny, source[key]);
			} else {
				result[key] = getDefaultValue(fieldSchema as z.ZodTypeAny);
			}
		}

		return result;
	};

	const processRecord = (schema: z.ZodRecord<any, any>, source: any): any => {
		if (typeof source !== 'object' || source === null) {
			return {};
		}

		const valueSchema = schema._def.valueType;
		const result: any = {};

		for (const key in source) {
			result[key] = processValue(valueSchema, source[key]);
		}

		return result;
	};

	const processSet = (schema: z.ZodSet<any>, source: Set<any>): any => {
		if (!(source instanceof Set)) {
			return new Set();
		}

		const valueSchema = schema._def.valueType;
		const result: any = new Set();

		for (const value of source) {
			result.add(processValue(valueSchema, value));
		}

		return result;
	};

	const processUnion = (schema: z.ZodUnion<[z.ZodTypeAny, ...z.ZodTypeAny[]]>, source: any): any => {
		for (const optionSchema of schema._def.options) {
			try {
				const parsed = optionSchema.safeParse(source);
				if (parsed.success) {
					return processValue(optionSchema, source);
				}
			} catch {
				// If parsing fails, try the next option
			}
		}

		// If no option matches, return the default value of the first option
		return getDefaultValue(schema._def.options[0]);
	};

	if (schema instanceof z.ZodDiscriminatedUnion) {
		return processDiscriminatedUnion(schema, source);
	}

	if (schema instanceof z.ZodEffects) {
		schema = schema.innerType();
	}

	return processValue(schema, source);
};

export default defaultInstance;
