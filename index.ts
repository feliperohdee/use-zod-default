import { z } from 'zod';

const defaultInstance = <T extends z.ZodTypeAny>(
	schema:
		| z.AnyZodObject
		| z.ZodDiscriminatedUnion<string, z.ZodObject<any>[]>
		| z.ZodEffects<any>
		| z.ZodUnion<[z.ZodTypeAny, ...z.ZodTypeAny[]]>,
	source: Partial<z.infer<T>> = {}
): z.infer<T> => {
	const getDefaultValue = (schema: z.ZodTypeAny): any => {
		if (schema instanceof z.ZodDefault) {
			return schema._def.defaultValue();
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

		if (schema instanceof z.ZodLiteral) {
			return schema.value;
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

		if (schema instanceof z.ZodString) {
			return '';
		}

		if (schema instanceof z.ZodSymbol) {
			return '';
		}

		if (schema instanceof z.ZodUnion) {
			return getDefaultValue(schema.options[0]);
		}

		return getDefaultValue(schema._def.innerType);
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

		if (matchingSchema) {
			return processObject(matchingSchema, source);
		} else {
			// If no matching schema is found, use the first option as default
			return processObject(schema.options[0], {});
		}
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
		} else if (schema instanceof z.ZodNumber) {
			return typeof value === 'number' ? value : schema.minValue ?? 0;
		} else {
			return value;
		}
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
