import { z } from 'zod/v4';
import cloneDeep from 'lodash/cloneDeep';
import isBoolean from 'lodash/isBoolean';
import isNumber from 'lodash/isNumber';
import isNil from 'lodash/isNil';
import isPlainObject from 'lodash/isPlainObject';
import isString from 'lodash/isString';

type DeepPartial<T> = T extends (infer U)[] ? DeepPartial<U>[] : T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

const cast = (schema: any): z.ZodType => {
	return schema as z.ZodType;
};

const defaultInstance = <T extends z.ZodType>(schema: T, source?: DeepPartial<z.input<T>>): z.output<T> => {
	const getDefaultValue = (schema: z.ZodType, defaultValue?: any): any => {
		if (schema instanceof z.ZodDefault) {
			const d = schema._zod.def.defaultValue;

			if (isPlainObject(d)) {
				return cloneDeep(d);
			}

			return d;
		}

		if (schema instanceof z.ZodAny) {
			return undefined;
		}

		if (schema instanceof z.ZodArray) {
			return [];
		}

		if (schema instanceof z.ZodBigInt) {
			if (schema._zod.bag?.minimum && schema._zod.bag?.minimum > 0) {
				return BigInt(schema._zod.bag?.minimum);
			}

			return BigInt(0);
		}

		if (schema instanceof z.ZodBoolean) {
			return false;
		}

		if (schema instanceof z.ZodCodec) {
			return defaultInstance(cast(schema._zod.def.out));
		}

		if (schema instanceof z.ZodDate) {
			return null;
		}

		if (schema instanceof z.ZodDiscriminatedUnion) {
			const firstOption = schema._zod.def.options[0];

			return defaultInstance(cast(firstOption));
		}

		if (schema instanceof z.ZodEnum) {
			return schema._zod.values.values().next().value;
		}

		if (schema instanceof z.ZodIntersection) {
			return defaultInstance(cast(schema._zod.def.left), source);
		}

		if (schema instanceof z.ZodLiteral) {
			return schema._zod.values.values().next().value;
		}

		if (schema instanceof z.ZodMap) {
			return new Map();
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

		if (schema instanceof z.ZodNumber) {
			if (schema._zod.bag?.minimum && schema._zod.bag?.minimum > 0) {
				return schema._zod.bag?.minimum;
			}

			return 0;
		}

		if (schema instanceof z.ZodObject) {
			return defaultInstance(schema, {});
		}

		if (schema instanceof z.ZodOptional) {
			return undefined;
		}

		if (schema instanceof z.ZodPipe) {
			if (schema._zod.def.out instanceof z.ZodTransform) {
				const defaultInValue = getDefaultValue(cast(schema._zod.def.in));

				return getDefaultValue(cast(schema._zod.def.out), defaultInValue);
			}

			return getDefaultValue(cast(schema._zod.def.out));
		}

		if (schema instanceof z.ZodPromise) {
			return Promise.resolve(getDefaultValue(cast(schema._zod.def.innerType)));
		}

		if (schema instanceof z.ZodRecord) {
			return {};
		}

		if (schema instanceof z.ZodSet) {
			return new Set();
		}

		if (
			schema instanceof z.ZodBase64 ||
			schema instanceof z.ZodBase64URL ||
			schema instanceof z.ZodCIDRv4 ||
			schema instanceof z.ZodCIDRv6 ||
			schema instanceof z.ZodCUID ||
			schema instanceof z.ZodCUID2 ||
			schema instanceof z.ZodCustomStringFormat ||
			schema instanceof z.ZodE164 ||
			schema instanceof z.ZodEmail ||
			schema instanceof z.ZodEmoji ||
			schema instanceof z.ZodGUID ||
			schema instanceof z.ZodIPv4 ||
			schema instanceof z.ZodIPv6 ||
			schema instanceof z.ZodISODate ||
			schema instanceof z.ZodISODateTime ||
			schema instanceof z.ZodISODuration ||
			schema instanceof z.ZodISOTime ||
			schema instanceof z.ZodJWT ||
			schema instanceof z.ZodKSUID ||
			schema instanceof z.ZodNanoID ||
			schema instanceof z.ZodString ||
			schema instanceof z.ZodULID ||
			schema instanceof z.ZodURL ||
			schema instanceof z.ZodUUID ||
			schema instanceof z.ZodXID
		) {
			return '';
		}

		if (schema instanceof z.ZodSymbol) {
			return '';
		}

		if (schema instanceof z.ZodTransform) {
			try {
				return schema._zod.def.transform(defaultValue, {
					value: defaultValue,
					issues: []
				});
			} catch {
				return defaultValue;
			}
		}

		if (schema instanceof z.ZodTuple) {
			return [];
		}

		if (schema instanceof z.ZodUnion) {
			return getDefaultValue(cast(schema._zod.def.options[0]));
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

		if ('innerType' in schema._zod?.def && schema._zod?.def.innerType) {
			return getDefaultValue(cast(schema._zod.def.innerType));
		}

		return undefined;
	};

	const processArray = (schema: z.ZodArray<any>, source: any[]): any[] => {
		if (!Array.isArray(source)) {
			return [];
		}

		const elementSchema = schema._zod.def.element;

		return source.map(item => {
			return processValue(elementSchema, item);
		});
	};

	const processDiscriminatedUnion = (schema: z.ZodDiscriminatedUnion, source: any): any => {
		if (!isPlainObject(source) || isNil(source)) {
			return getDefaultValue(schema);
		}

		const discriminator = schema._zod.def.discriminator;
		const discriminatorValue = source[discriminator];

		// Find matching option based on discriminator value
		const matchingSchema = schema._zod.def.options.find(option => {
			const { propValues } = option._zod;

			if (propValues && propValues[discriminator]) {
				return propValues[discriminator].has(discriminatorValue);
			}

			return false;
		});

		if (!matchingSchema) {
			const firstOption = schema._zod.def.options[0];
			// If no matching schema is found, use the first option as default
			return processObject(firstOption as z.ZodObject, source);
		}

		return processObject(matchingSchema as z.ZodObject, source);
	};

	const processValue = (schema: z.ZodType, value: any): any => {
		if (schema instanceof z.ZodArray) {
			return processArray(schema, value);
		}

		if (schema instanceof z.ZodBigInt) {
			if (typeof value === 'bigint') {
				return value;
			}

			return typeof value === 'number' ? BigInt(value) : BigInt(0);
		}

		if (schema instanceof z.ZodBoolean) {
			return isBoolean(value) ? value : false;
		}

		if (schema instanceof z.ZodCodec) {
			return schema.decode(value);
		}

		if (schema instanceof z.ZodDiscriminatedUnion) {
			return processDiscriminatedUnion(schema, value);
		}

		if (schema instanceof z.ZodDefault) {
			return processValue(cast(schema._zod.def.innerType), !isNil(value) ? value : getDefaultValue(schema));
		}

		if (schema instanceof z.ZodISODate) {
			return isString(value) ? value : new Date().toISOString().split('T')[0];
		}

		if (schema instanceof z.ZodISODateTime) {
			return isString(value) ? value : new Date().toISOString();
		}

		if (schema instanceof z.ZodISODuration) {
			return isString(value) ? value : 'P0D';
		}

		if (schema instanceof z.ZodISOTime) {
			return isString(value) ? value : new Date().toISOString().split('T')[1];
		}

		if (schema instanceof z.ZodMap) {
			return processMap(schema, value);
		}

		if (schema instanceof z.ZodNullable) {
			return isNil(value) ? null : processValue(schema._zod.def.innerType as any, value);
		}

		if (schema instanceof z.ZodNumber) {
			return isNumber(value) ? value : (schema._zod.bag?.minimum ?? 0);
		}

		if (schema instanceof z.ZodObject) {
			return processObject(schema, value);
		}

		if (schema instanceof z.ZodPipe) {
			if (schema._zod.def.out instanceof z.ZodTransform) {
				return processTransform(schema._zod.def.out, value);
			}

			return processValue(cast(schema._zod.def.in), value);
		}

		if (schema instanceof z.ZodRecord) {
			return processRecord(schema, value);
		}

		if (schema instanceof z.ZodSet) {
			return processSet(schema, value);
		}

		if (schema instanceof z.ZodString) {
			return isString(value) ? value : '';
		}

		if (schema instanceof z.ZodTransform) {
			return processTransform(schema, value);
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
			result.set(key, processValue(cast(valueSchema), value));
		});

		return result;
	};

	const processObject = (schema: z.ZodObject<any>, source: any): any => {
		const result: any = {};
		const shape = schema._zod.def.shape;

		// Process defined schema properties
		for (const [key, fieldSchema] of Object.entries(shape)) {
			// Create a proper ZodType from the field schema
			const zodFieldSchema = cast(fieldSchema);

			if (source && key in source) {
				result[key] = processValue(zodFieldSchema, source[key]);
			} else {
				result[key] = getDefaultValue(zodFieldSchema);
			}
		}

		// Handle catchall - preserve additional properties not in schema
		if (schema._zod.def.catchall && isPlainObject(source)) {
			for (const key in source) {
				if (!(key in shape)) {
					result[key] = source[key];
				}
			}
		}

		return result;
	};

	const processRecord = (schema: z.ZodRecord<any, any>, source: any): any => {
		if (!isPlainObject(source) || isNil(source)) {
			return {};
		}

		const valueSchema = schema._zod.def.valueType;
		const result: any = {};

		for (const key in source) {
			result[key] = processValue(cast(valueSchema), source[key]);
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
			result.add(processValue(cast(valueSchema), value));
		}

		return result;
	};

	const processTransform = (schema: z.ZodTransform<any, any>, source: any): any => {
		try {
			return schema._zod.def.transform(source, {
				value: source,
				issues: []
			});
		} catch {
			return source;
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

	if (schema instanceof z.ZodDiscriminatedUnion) {
		return processDiscriminatedUnion(schema, source);
	}

	if (schema instanceof z.ZodPipe) {
		if (schema._zod.def.out instanceof z.ZodTransform) {
			return processTransform(schema._zod.def.out, source);
		}

		return processValue(cast(schema._zod.def.in), source);
	}

	return processValue(schema, source);
};

export default defaultInstance;
