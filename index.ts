import { z } from 'zod';

type DeepPartial<T> = T extends (infer U)[] ? DeepPartial<U>[] : T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

const defaultInstance = <T extends z.ZodType>(schema: T, source: DeepPartial<z.input<T>> = {} as DeepPartial<z.input<T>>): z.output<T> => {
	const getDefaultValue = (schema: z.ZodType): any => {
		if (schema instanceof z.ZodDefault) {
			return schema._zod.def.defaultValue();
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
			return defaultInstance(schema._zod.def.options[0]);
		}

		if (schema instanceof z.ZodTransform) {
			const innerValue = getDefaultValue(schema._zod.def.in || schema);
			try {
				return schema._zod.def.transform(innerValue, {
					value: innerValue,
					issues: [],
					addIssue: () => {}
				});
			} catch {
				return innerValue;
			}
		}

		if (schema instanceof z.ZodEnum) {
			return schema._zod.values.values().next().value;
		}

		if (schema._zod?.def?.type === 'function') {
			return () => null;
		}

		if (schema instanceof z.ZodIntersection) {
			return defaultInstance(schema._zod.def.left, source);
		}

		if (schema instanceof z.ZodLiteral) {
			return schema._zod.values.values().next().value;
		}

		if (schema instanceof z.ZodMap) {
			return new Map();
		}

		// Handle enum in Zod 4 (both native and string enums use ZodEnum)
		if (schema._zod?.def?.entries) {
			const entries = schema._zod.def.entries;
			const keys = Object.keys(entries);
			return entries[keys[0]];
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
			return schema._zod.computed?.minimum ?? 0;
		}

		if (schema instanceof z.ZodObject || schema instanceof z.ZodInterface) {
			return defaultInstance(schema, {});
		}

		if (schema instanceof z.ZodPipe) {
			return getDefaultValue(schema._zod.def.out);
		}

		if (schema instanceof z.ZodPromise) {
			return Promise.resolve(getDefaultValue(schema._zod.def.innerType));
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
			return getDefaultValue(schema._zod.def.options[0]);
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

		if (schema._zod?.def?.innerType) {
			return getDefaultValue(schema._zod.def.innerType);
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

	const processDiscriminatedUnion = (schema: z.ZodDiscriminatedUnion<any, any>, source: any): any => {
		if (typeof source !== 'object' || source === null) {
			return getDefaultValue(schema);
		}

		const matchDiscriminators = (input: any, discs: Map<any, any>): boolean => {
			let matched = true;

			for (const [key, value] of discs.entries()) {
				const data = input?.[key];

				if (value.values?.size && !value.values.has(data)) {
					matched = false;
				}

				if (value.maps?.length > 0) {
					for (const m of value.maps) {
						if (!matchDiscriminators(data, m)) {
							matched = false;
						}
					}
				}
			}

			return matched;
		};

		const matchingSchema = schema._zod.def.options.find(option => {
			return option._zod?.disc && matchDiscriminators(source, option._zod.disc);
		});

		if (!matchingSchema) {
			// If no matching schema is found, use the first option as default
			return processObject(schema._zod.def.options[0], source);
		}

		return processObject(matchingSchema, source);
	};

	const processValue = (schema: z.ZodType, value: any): any => {
		if (schema instanceof z.ZodArray) {
			return processArray(schema, value);
		}

		if (schema instanceof z.ZodBoolean) {
			return typeof value === 'boolean' ? value : false;
		}

		if (schema instanceof z.ZodDiscriminatedUnion) {
			return processDiscriminatedUnion(schema, value);
		}

		if (schema instanceof z.ZodTransform) {
			return processTransform(schema, value);
		}

		if (schema instanceof z.ZodMap) {
			return processMap(schema, value);
		}

		if (schema instanceof z.ZodNullable) {
			return value === null ? null : processValue(schema._zod.def.innerType, value);
		}

		if (schema instanceof z.ZodNumber || schema instanceof z.ZodBigInt) {
			return typeof value === 'number' ? value : (schema._zod.computed?.minimum ?? 0);
		}

		if (schema instanceof z.ZodObject || schema instanceof z.ZodInterface) {
			return processObject(schema, value);
		}

		if (schema instanceof z.ZodPipe) {
			const inValue = processValue(schema._zod.def.in, value);
			return processValue(schema._zod.def.out, inValue);
		}

		if (schema instanceof z.ZodRecord) {
			return processRecord(schema, value);
		}

		if (schema instanceof z.ZodSet) {
			return processSet(schema, value);
		}

		if (schema instanceof z.ZodString) {
			return typeof value === 'string' ? value : '';
		}

		if (schema instanceof z.ZodUnion) {
			return processUnion(schema, value);
		}

		return value;
	};

	const processTransform = (schema: z.ZodTransform<any, any>, source: any): any => {
		try {
			const input = schema._zod.def.in ? processValue(schema._zod.def.in, source) : source;
			return schema._zod.def.transform(input, {
				value: input,
				issues: [],
				addIssue: () => {}
			});
		} catch {
			return source;
		}
	};

	const processMap = (schema: z.ZodMap<any, any>, source: any): any => {
		if (!(source instanceof Map)) {
			return new Map();
		}

		const valueSchema = schema._zod.def.valueType;
		const result: any = new Map();

		source.forEach((value, key) => {
			result.set(key, processValue(valueSchema, value));
		});

		return result;
	};

	const processObject = (schema: z.ZodObject<any> | z.ZodInterface<any>, source: any): any => {
		const result: any = {};
		const shape = schema._zod.def.shape;

		for (const [key, fieldSchema] of Object.entries(shape)) {
			if (source && key in source) {
				result[key] = processValue(fieldSchema as z.ZodType, source[key]);
			} else {
				result[key] = getDefaultValue(fieldSchema as z.ZodType);
			}
		}

		return result;
	};

	const processRecord = (schema: z.ZodRecord<any, any>, source: any): any => {
		if (typeof source !== 'object' || source === null) {
			return {};
		}

		const valueSchema = schema._zod.def.valueType;
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

		const valueSchema = schema._zod.def.valueType;
		const result: any = new Set();

		for (const value of source) {
			result.add(processValue(valueSchema, value));
		}

		return result;
	};

	const processUnion = (schema: z.ZodUnion<any>, source: any): any => {
		for (const optionSchema of schema._zod.def.options) {
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
		return getDefaultValue(schema._zod.def.options[0]);
	};

	if (schema instanceof z.ZodDiscriminatedUnion) {
		return processDiscriminatedUnion(schema, source);
	}

	if (schema instanceof z.ZodTransform) {
		return processTransform(schema, source);
	}

	if (schema instanceof z.ZodPipe) {
		const inValue = processValue(schema._zod.def.in, source);
		return processValue(schema._zod.def.out, inValue);
	}

	return processValue(schema, source);
};

export default defaultInstance;
