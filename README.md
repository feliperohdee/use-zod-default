# @simpleimg/zod-default-instance

Effortlessly create default instances from Zod schemas with intelligent type inference and flexible customization.

## 🚀 Features

- 📦 Create default instances from Zod schemas
- 🧠 Intelligent type inference
- 🛠 Support for nested objects, arrays, and complex types
- 🎛 Customizable with partial source objects
- 🔄 Handles discriminated unions and regular unions
- 🏷 Full TypeScript support

## 📦 Installation

```bash
npm install @simpleimg/zod-default-instance
```

or

```bash
yarn add @simpleimg/zod-default-instance
```

## 🛠 Usage

```typescript
import { z } from 'zod';
import defaultInstance from '@simpleimg/zod-default-instance';

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

### With Partial Source

You can provide a partial source object to override default values:

```typescript
const partialUser = {
  name: 'John Doe',
  settings: {
    theme: 'dark'
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

### Discriminated Unions

```typescript
const resultSchema = z.discriminatedUnion('status', [
  z.object({ status: z.literal('success'), data: z.string() }),
  z.object({ status: z.literal('error'), message: z.string() })
]);

const defaultResult = defaultInstance(resultSchema);
console.log(defaultResult); // { status: 'success', data: '' }
```

### Regular Unions

```typescript
const dataSchema = z.union([
  z.object({ type: z.literal('string'), value: z.string() }),
  z.object({ type: z.literal('number'), value: z.number() }),
  z.string()
]);

const defaultData = defaultInstance(dataSchema);
console.log(defaultData); // { type: 'string', value: '' }
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check [issues page](https://github.com/yourusername/zod-default-instance/issues).

## 📄 License

This project is [MIT](https://opensource.org/licenses/MIT) licensed.