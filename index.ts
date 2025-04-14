import { z } from 'zod';
import { 
	$ZodDiscriminatedUnion
 } from '@zod/core';

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

		if (schema instanceof $ZodDiscriminatedUnion) {
			return defaultInstance(schema.options[0]);
		}

		// ZodEffects is now split into ZodTransform and checks directly in schemas
		if (schema instanceof z.ZodTransform) {
			const innerValue = getDefaultValue(schema._zod.def.in || schema._zod.def.innerType);
			return processTransform(schema, innerValue);
		}

		if (schema instanceof z.ZodEnum) {
			return schema.options[0];
		}

		// ZodFunction has changed in v4
		if ('type' in schema._zod.def && schema._zod.def.type === 'function') {
			return () => null;
		}

		if (schema instanceof z.ZodIntersection) {
			return defaultInstance(schema._zod.def.left, source);
		}

		if (schema instanceof z.ZodLiteral) {
			// In Zod 4, values are stored in an array
			return Array.isArray(schema._zod.def.values) ? schema._zod.def.values[0] : schema._zod.def.value;
		}

		if (schema instanceof z.ZodMap) {
			return new Map();
		}

		// ZodNativeEnum is deprecated in favor of ZodEnum
		if ('values' in schema._zod.def && schema._zod.def.type === 'enum') {
			const entries = schema._zod.def.entries;
			return entries[Object.keys(entries)[0]];
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
			// Get minimum value or default to 0
			const minValue = schema._zod.computed?.minimum ?? 0;
			return minValue;
		}

		if (schema instanceof z.ZodObject) {
			return defaultInstance(schema, {});
		}

		// ZodPipeline is now ZodPipe
		if (schema instanceof z.ZodPipe) {
			return getDefaultValue(schema._zod.def.out);
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

		// Fallback for schemas with innerType
		if (schema._zod.def && 'innerType' in schema._zod.def) {
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

	const processDiscriminatedUnion = (schema: z.ZodDiscriminatedUnion<string, any[]>, source: any): any => {
		if (typeof source !== 'object' || source === null) {
			return getDefaultValue(schema);
		}

		const discriminator = schema.discriminator;
		const discriminatorValue = source[discriminator];
		const matchingSchema = schema.options.find(option => {
			const shape = option._zod.def.shape;
			return shape[discriminator] instanceof z.ZodLiteral && shape[discriminator]._zod.values?.has(discriminatorValue);
		});

		if (!matchingSchema) {
			// If no matching schema is found, use the first option as default
			return processObject(schema.options[0], source);
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
			return value === null ? null : processValue(schema.unwrap(), value);
		}

		if (schema instanceof z.ZodNumber || schema instanceof z.ZodBigInt) {
			return typeof value === 'number' ? value : (schema._zod.computed?.minimum ?? 0);
		}

		if (schema instanceof z.ZodObject) {
			return processObject(schema, value);
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

	const processObject = (schema: z.ZodObject<any>, source: any): any => {
		const result: any = {};
		const shape = schema._zod.def.shape;

		for (const [key, fieldSchema] of Object.entries(shape)) {
			if (key in source) {
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

	const processTransform = (schema: z.ZodTransform<any, any>, source: any): any => {
		// Get the transform function from the schema
		const transform = schema._zod.def.transform;

		// Simple context object (minimal version of what Zod uses internally)
		const ctx = {
			addIssue: () => {},
			get data() {
				return source;
			},
			path: []
		};

		try {
			// Apply the transformation
			return transform(source, ctx);
		} catch {
			// If transformation fails, return source or inner default
			return source || getDefaultValue(schema._zod.def.in || schema._zod.def.innerType);
		}
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

	// Entry point logic
	if (schema instanceof z.ZodDiscriminatedUnion) {
		return processDiscriminatedUnion(schema, source);
	}

	// Handle transformations
	if (schema instanceof z.ZodTransform) {
		const innerSchema = schema._zod.def.in || schema._zod.def.innerType;
		const innerValue = processValue(innerSchema, source);
		return processTransform(schema, innerValue);
	}

	return processValue(schema, source);
};

export default defaultInstance;
