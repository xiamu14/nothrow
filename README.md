# @redchili/nothrow

> Errors are values, not exceptions.

A lightweight TypeScript library that brings Go-style error handling to JavaScript/TypeScript. Instead of throwing exceptions that disrupt control flow, treat errors as explicit return values that must be handled.

## Philosophy

In Go, error handling is explicit and visible:

```go
result, err := doSomething()
if err != nil {
    return err
}
```

This approach has several advantages:

- **Explicit Control Flow**: Errors don't invisibly jump up the call stack
- **Type Safety**: Errors are part of the type signature
- **Force Handling**: You can't accidentally ignore an error
- **Better Performance**: No exception stack unwinding

`@redchili/nothrow` brings this philosophy to TypeScript with a minimal API surface.

## Installation

```bash
npm install @redchili/nothrow
# or
bun install @redchili/nothrow
```

## Usage

### Basic Example

```typescript
import { safe, isErr } from '@redchili/nothrow';

const result = safe(() => {
  return JSON.parse('{"valid": "json"}');
});

if (isErr(result)) {
  console.error('Parse failed:', result.reason);
  return;
}

// TypeScript knows result is the success type here
console.log(result.valid);
```

### Async Operations

```typescript
import { safeAsync, isErr } from '@redchili/nothrow';

const result = await safeAsync(async () => {
  const response = await fetch('https://api.example.com/data');
  return await response.json();
});

if (isErr(result)) {
  console.error('Request failed:', result.reason);
  return;
}

console.log(result);
```

### Custom Error Types

```typescript
import { safe, isErr } from '@redchili/nothrow';

type DbError = { reason: 'DB_CONNECTION_FAILED' | 'DB_QUERY_ERROR'; details: string };

const result = safe<User[], DbError>(
  () => db.query('SELECT * FROM users'),
  (e) => ({
    reason: 'DB_QUERY_ERROR',
    details: (e as Error).message
  })
);

if (isErr(result)) {
  // result.reason is typed as 'DB_CONNECTION_FAILED' | 'DB_QUERY_ERROR'
  console.error(`Database error: ${result.reason}`, result.details);
  return;
}

// TypeScript knows result is User[] here
const users = result;
```

### Manual Error Construction

```typescript
import { ok, err, isErr } from '@redchili/nothrow';

function divide(a: number, b: number) {
  if (b === 0) {
    return err({ reason: 'DIVISION_BY_ZERO' });
  }
  return ok(a / b);
}

const result = divide(10, 2);
if (isErr(result)) {
  console.error('Cannot divide:', result.reason);
} else {
  console.log('Result:', result); // 5
}
```

### Chaining Operations

```typescript
import { safe, isErr } from '@redchili/nothrow';

function processUser(userId: string) {
  const user = safe(() => fetchUser(userId));
  if (isErr(user)) return user;

  const validated = safe(() => validateUser(user));
  if (isErr(validated)) return validated;

  const saved = safe(() => saveUser(validated));
  if (isErr(saved)) return saved;

  return ok(saved);
}
```

## API

### `ok<T>(value: T): Result<T, E>`
Wraps a successful value in a Result type.

### `err<E>(reason: E): Result<never, E & { stack: string }>`
Creates an error result with automatic stack trace capture.

### `isErr<T, E>(result: Result<T, E>): result is Err<E>`
Type guard to check if a result is an error.

### `isOk<T, E>(result: Result<T, E>): result is T`
Type guard to check if a result is successful.

### `safe<T, E>(fn: () => T, mapError?: (e: unknown) => E): Result<T, E>`
Executes a synchronous function and catches any thrown exceptions, returning a Result.

### `safeAsync<T, E>(fn: () => Promise<T>, mapError?: (e: unknown) => E): Promise<Result<T, E>>`
Executes an async function and catches any thrown exceptions, returning a Promise of Result.

## Why Not Try/Catch?

Traditional try/catch has several issues:

```typescript
// ❌ Error handling is optional - easy to forget
function parseJson(text: string) {
  return JSON.parse(text); // Can throw, but type signature doesn't show it
}

// ❌ Error type is unknown
try {
  parseJson(input);
} catch (error) {
  // What is error? Who knows!
}

// ✅ With noThrow, errors are explicit
const result = safe(() => JSON.parse(input));
if (isErr(result)) {
  // TypeScript knows the error shape
  console.error(result.reason);
}
```

## License

MIT
