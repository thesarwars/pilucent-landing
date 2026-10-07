type Leaf = string | number | boolean | null;
type ErrorValue = Leaf | Leaf[] | Record<string, any> | any[];

interface FlatError {
  path: string; // e.g., "profile.business.websites[1].url"
  messages: string[]; // one or more messages for that path
}

/**
 * Flattens any nested error object/array into path → messages[]
 * - Handles objects & arrays at any depth
 * - Supports string, array of strings, or other primitive leaves
 * - Produces bracket notation for array indices
 */
export function flattenErrors(input: ErrorValue, parentPath = ""): FlatError[] {
  const out: FlatError[] = [];

  const push = (path: string, val: any) => {
    // Normalize all leaf types into string[]
    if (Array.isArray(val)) {
      // Could be ["msg1","msg2"] or nested arrays; filter leaf strings
      const msgs = val
        .flat(Infinity)
        .filter((v) => typeof v === "string" && v.trim().length)
        .map((v) => String(v));
      if (msgs.length) out.push({ path, messages: msgs });
      else out.push({ path, messages: [String(JSON.stringify(val))] });
    } else if (typeof val === "string") {
      out.push({ path, messages: [val] });
    } else if (
      typeof val === "number" ||
      typeof val === "boolean" ||
      val === null
    ) {
      out.push({ path, messages: [String(val)] });
    } else {
      // Non-primitive leaf (e.g., Date/unknown)
      out.push({ path, messages: [String(JSON.stringify(val))] });
    }
  };

  const isPlainObject = (v: any) =>
    v && typeof v === "object" && !Array.isArray(v);

  const walk = (node: any, base: string) => {
    if (Array.isArray(node)) {
      node.forEach((item, idx) => {
        const next = `${base}[${idx}]`;
        if (isPlainObject(item) || Array.isArray(item)) walk(item, next);
        else push(next, item);
      });
      return;
    }

    if (isPlainObject(node)) {
      const keys = Object.keys(node);
      if (keys.length === 0 && base) {
        // empty object as a leaf
        push(base, node);
        return;
      }
      keys.forEach((key) => {
        const next = base ? `${base}.${key}` : key;
        const val = node[key];
        if (isPlainObject(val) || Array.isArray(val)) walk(val, next);
        else push(next, val);
      });
      return;
    }

    // Primitive at root
    if (!parentPath) push("(root)", node);
  };

  walk(input, parentPath);
  return out;
}
export function collectErrorMessages(input: any) {
  const messages: string[] = [];

  function walk(val: unknown, keyPath: string[] = []): void {
    if (Array.isArray(val)) {
      val.forEach((item) => walk(item, keyPath));
    } else if (val && typeof val === "object") {
      Object.entries(val as Record<string, unknown>).forEach(([k, v]) => {
        walk(v, [...keyPath, k]);
      });
    } else if (typeof val === "string") {
      const lastKey = keyPath[keyPath.length - 1] || "field";
      messages.push(`${lastKey} ${val}`);
    }
  }

  walk(input);
  return messages;
}
