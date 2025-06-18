# use-zod-default

Effortlessly create default instances from Zod schemas with intelligent type inference and flexible customization.

## 🚀 Features

- 📦 Create default instances from Zod schemas
- 🧠 Intelligent type inference
- 🛠 Support for nested objects, arrays, and complex types
- 🎛 Customizable with partial source objects
- 🔄 Handles discriminated unions and regular unions
- ✅ Supports both Zod v3 and v4
- 🏷 Full TypeScript support

## 📦 Installation

```bash
npm install use-zod-default
```

or

```bash
yarn add use-zod-default
```

## 🛠 Usage

This library supports both Zod v3 and v4. You need to import the `defaultInstance` function from the correct entry point depending on the version of Zod you are using.

### For Zod v3

The default import corresponds to Zod v3. You can also import it explicitly from the `/v3` entry point.

```typescript
// For Zod v3, you can use the main entry point
import { z } from 'zod'; // or 'zod/v3'
import defaultInstance from 'use-zod-default'; // or 'use-zod-default/v3'

// Define your Zod schema
const userSchema = z.object({
	name: z.string(),
	age: z.number(),
	isActive: z.boolean(),
	roles: z.array(z.string()),
	settings: z.object({
		theme: z.enum(['light', 'dark']),
		notifications: z.boolean()
	})
});

// Create a default instance
const defaultUser = defaultInstance(userSchema);

console.log(defaultUser);
// Output:
// {
//   name: '',
//   age: 0,
//   isActive: false,
//   roles: [],
//   settings: {
//     theme: 'light',
//     notifications: false
//   }
// }
```

### For Zod v4

To use with Zod v4, you must import from the `/v4` entry point.

```typescript
// For Zod v4, you must use the /v4 entry point
import { z } from 'zod/v4';
import defaultInstance from 'use-zod-default/v4';

// Define your Zod schema
const userSchemaV4 = z.object({
	name: z.string(),
	age: z.number(),
	isActive: z.boolean(),
	roles: z.array(z.string()),
	settings: z.object({
		theme: z.enum(['light', 'dark']),
		notifications: z.boolean()
	})
});

// Create a default instance
const defaultUserV4 = defaultInstance(userSchemaV4);

console.log(defaultUserV4);
// Output:
// {
//   name: '',
//   age: 0,
//   isActive: false,
//   roles: [],
//   settings: {
//     theme: 'light',
//     notifications: false
//   }
// }
```

### With Partial Source

You can provide a partial source object to override default values. This works for both Zod v3 and v4.

```typescript
import { z } from 'zod/v4';
import defaultInstance from 'use-zod-default/v4';

const userSchema = z.object({
	name: z.string(),
	age: z.number(),
	isActive: z.boolean(),
	roles: z.array(z.string()),
	settings: z.object({
		theme: z.enum(['light', 'dark']),
		notifications: z.boolean()
	})
});

const partialUser = {
	name: 'John Doe',
	settings: {
		theme: 'dark' as const // Use 'as const' for literal types with Zod
	}
};

const userWithCustomValues = defaultInstance(userSchema, partialUser);

console.log(userWithCustomValues);
// Output:
// {
//   name: 'John Doe',
//   age: 0,
//   isActive: false,
//   roles: [],
//   settings: {
//     theme: 'dark',
//     notifications: false
//   }
// }
```

## 🧩 Advanced Usage

The following examples use Zod v4, but the same patterns apply to Zod v3 (just change the imports).

### Discriminated Unions

```typescript
import { z } from 'zod/v4';
import defaultInstance from 'use-zod-default/v4';

const resultSchema = z.discriminatedUnion('status', [
	z.object({ status: z.literal('success'), data: z.string() }),
	z.object({ status: z.literal('error'), message: z.string() })
]);

const defaultResult = defaultInstance(resultSchema);
console.log(defaultResult); // { status: 'success', data: '' }
```

### Regular Unions

```typescript
import { z } from 'zod/v4';
import defaultInstance from 'use-zod-default/v4';

const dataSchema = z.union([
	z.object({ type: z.literal('string'), value: z.string() }),
	z.object({ type: z.literal('number'), value: z.number() }),
	z.string()
]);

const defaultData = defaultInstance(dataSchema);
console.log(defaultData); // { type: 'string', value: '' }
```

## 📝 License

MIT © [Felipe Rohde](mailto:feliperohdee@gmail.com)

## 👨‍💻 Author

**Felipe Rohde**

- Twitter: [@felipe_rohde](https://twitter.com/felipe_rohde)
- Github: [@feliperohdee](https://github.com/feliperohdee)
- Email: feliperohdee@gmail.com
