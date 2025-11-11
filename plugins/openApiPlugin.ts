import { mkdir, rm, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";

import SwaggerParser from "@apidevtools/swagger-parser";
import type { RspressPlugin } from "@rspress/core";
import { micromark } from "micromark";
import type { OpenAPIV3_1 } from "openapi-types";

// Type aliases for OpenAPI 3.1
type OpenAPIDocument = OpenAPIV3_1.Document;
type SchemaObject = OpenAPIV3_1.SchemaObject;
type ReferenceObject = OpenAPIV3_1.ReferenceObject;
type OperationObject = OpenAPIV3_1.OperationObject;
type MediaType = OpenAPIV3_1.MediaTypeObject;
type RequestBody = OpenAPIV3_1.RequestBodyObject;

const OPENAPI_DIR = "openapi";
const OPENAPI_FILE = "openapi.yaml";

// Constants for magic strings and values
const DEFAULT_TAG = "Default";
const MODELS_DIR = "models";
const META_FILE = "_meta.json";
const TAG_DIR_COLLAPSIBLE = true;
const TAG_DIR_COLLAPSED = false;
const MODELS_DIR_COLLAPSED = true;

// Warning collection system
const warnings: string[] = [];

/**
 * Adds a warning message to the collection
 */
function addWarning(message: string): void {
  warnings.push(message);
}

/**
 * Displays all collected warnings
 */
function displayWarnings(): void {
  if (warnings.length === 0) return;

  console.log("⚠️  Warnings Summary:");
  for (const warning of warnings) {
    console.log(`   ${warning}`);
  }
  console.log("");
}

/**
 * Clears all collected warnings
 */
function clearWarnings(): void {
  warnings.length = 0;
}

/**
 * Type guard to check if a value is a reference object
 */
function isReference(schema: unknown): schema is { $ref: string } {
  return typeof schema === "object" && schema !== null && "$ref" in schema;
}

export interface PluginOpenApiOptions {
  /**
   * Delete the output directory before building.
   * @default true
   */
  clean?: boolean;

  /**
   * The path to the OpenAPI file. Can be JSON or YAML.
   * @default 'openapi.yaml'
   */
  openApiFile?: string;

  /**
   * The output directory.
   * @default 'openapi'
   */
  outDir?: string;
}

interface DirSideMeta {
  type: "dir";
  name: string;
  label?: string;
  collapsible?: boolean;
  collapsed?: boolean;
  tag?: string;
  overviewHeaders?: number[];
  context?: string;
}

interface DividerSideMeta {
  type: "divider";
  dashed?: boolean;
}

export type SideMetaItem = DirSideMeta | DividerSideMeta | string;

/**
 * An Rspress plugin to generate Markdown from OpenAPI documents.
 */
export const pluginOpenApi = (
  options?: PluginOpenApiOptions,
): RspressPlugin => {
  const {
    clean = true,
    openApiFile = OPENAPI_FILE,
    outDir = OPENAPI_DIR,
  } = options ?? {};

  let outDirPath: string;

  return {
    name: "openapi-plugin",
    config: async (config, _, isProd) => {
      console.time("openapi-plugin");
      clearWarnings(); // Clear any previous warnings

      const docRoot = config.root;

      if (!docRoot) {
        throw new Error("docRoot not set");
      }

      // /docs/openapi
      outDirPath = join(docRoot, outDir);

      // Clean the output directory only when building for development
      if (clean && !isProd) {
        console.info("OpenAPI Plugin: Cleaning output directory:", outDirPath);
        await rm(outDirPath, { recursive: true, force: true });
        await stat(outDirPath)
          .then(() => console.warn("Output directory not cleaned."))
          .catch(() => console.info("Output directory successfully cleaned."));
      }

      // Create the output directory
      await mkdir(outDirPath, { recursive: true });

      const openApiFilePath = join(docRoot, "public", openApiFile);

      // Bundle the OpenAPI document (keeps internal $refs intact)
      const schema = (await SwaggerParser.bundle(
        openApiFilePath,
      )) as OpenAPIDocument;

      // Track files per directory for meta files
      const rootFiles: SideMetaItem[] = [];
      const tagMeta: Record<string, string[]> = {};
      const modelFiles: string[] = [];

      /**
       * Generate home page
       */

      const index = generateMainPage(schema);

      await writeFile(join(outDirPath, "index.md"), index, {
        encoding: "utf8",
      });

      rootFiles.push("index");

      /**
       * Parse Operations (grouped by tag)
       */

      if (schema?.paths) {
        for (const [path, pathItem] of Object.entries(schema.paths)) {
          if (!pathItem) continue;

          for (const [methodName, operation] of Object.entries(pathItem)) {
            // Skip non-operation properties (parameters, servers, etc.)
            if (
              !operation ||
              typeof operation !== "object" ||
              !("operationId" in operation || "responses" in operation)
            ) {
              continue;
            }
            const method = methodName.toUpperCase();

            const { operationId } = operation;

            const opId =
              operationId || `${method}_${path.replace(/[/{}]/g, "_")}`;

            const filename = `${opId}.md`;

            const markdown = renderOperationMarkdown(
              path,
              method,
              operation,
              schema,
            );

            for (const tag of operation?.tags ?? [DEFAULT_TAG]) {
              const tagDir = join(outDirPath, tag.toLowerCase());
              await mkdir(tagDir, { recursive: true });

              await writeFile(join(tagDir, filename), markdown, {
                encoding: "utf8",
              });

              if (!tagMeta[tag]) {
                tagMeta[tag] = [];
              }
              tagMeta[tag].push(opId);
            }
          }
        }
      }

      // Write _meta.json for each tag folder
      for (const [tag, files] of Object.entries(tagMeta)) {
        const tagDir = join(outDirPath, tag.toLowerCase());
        await writeFile(
          join(tagDir, META_FILE),
          JSON.stringify(files, null, 2),
          {
            encoding: "utf8",
          },
        );
      }

      for (const tag of Object.keys(tagMeta)) {
        rootFiles.push({
          type: "dir",
          name: tag.toLowerCase(),
          label: tag,
          collapsible: TAG_DIR_COLLAPSIBLE,
          collapsed: TAG_DIR_COLLAPSED,
        });
      }

      /**
       * Parse Models
       */

      if (schema?.components?.schemas) {
        const modelsDir = join(outDirPath, MODELS_DIR);
        await mkdir(modelsDir, { recursive: true });

        // First, build a map of discriminator children to their parents
        const discriminatorMap = buildDiscriminatorMap(schema);

        for (const [modelName, modelSchema] of Object.entries(
          schema.components.schemas,
        )) {
          if (!modelSchema) continue;

          // Generate markdown for the model
          const markdown = renderModelMarkdown(
            modelName,
            modelSchema,
            discriminatorMap,
          );

          const filename = `${modelName}.md`;

          await writeFile(join(modelsDir, filename), markdown, {
            encoding: "utf8",
          });

          modelFiles.push(modelName);
        }

        // Write _meta.json for models
        await writeFile(
          join(modelsDir, META_FILE),
          JSON.stringify(modelFiles, null, 2),
          { encoding: "utf8" },
        );
      }

      if (modelFiles.length) {
        rootFiles.push({
          type: "dir",
          name: MODELS_DIR,
          label: "Models",
          collapsible: true,
          collapsed: MODELS_DIR_COLLAPSED,
        });
      }

      // Write root _meta.json
      await writeFile(
        join(outDirPath, META_FILE),
        JSON.stringify(rootFiles, null, 2),
        { encoding: "utf8" },
      );

      displayWarnings(); // Display any collected warnings
      console.timeEnd("openapi-plugin");

      return config;
    },
  };
};

/**
 * Generates the main API documentation page with overview information
 * @param schema - The complete OpenAPI 3.1 definition
 * @returns Formatted markdown string for the main page
 */
const generateMainPage = (schema: OpenAPIDocument): string => {
  const details: Record<string, string>[] = [];

  // Cache frequently accessed properties for performance
  const security = schema?.security ?? [];
  const securitySchemes = schema?.components?.securitySchemes ?? {};
  const servers = schema?.servers ?? [];
  const info = schema?.info;
  const contact = info?.contact;

  for (const securityItem of security) {
    const schemes = Object.keys(securityItem);

    for (const scheme of schemes) {
      const securityScheme = securitySchemes[scheme];

      if (securityScheme) {
        const detail: Record<string, string> = {};

        for (const [key, value] of Object.entries(securityScheme)) {
          detail[key] = String(value).trim();
        }

        details.push(detail);
      } else {
        addWarning(`Security scheme '${scheme}' not found in components`);
      }
    }
  }

  return `
---
title: Introduction
pageType: doc
footer: false
---

# ${info?.title || "API Documentation"}

${info?.description || ""}

### Contact

| Name | Email | URL |
| --- | --- | --- |
| ${contact?.name || "N/A"} | ${contact?.email || "N/A"} | ${contact?.url || "N/A"} |

### Servers

| URL |
| --- |
${servers.map((server) => `| \`${server.url}\` |`).join("\n")}

### Authentication

| HTTP Header Name | Description |
| ---------------- | ----------- |
${details.map(({ description, name }) => `| \`${name}\` | ${description}`).join("\n")}

${schema.paths ? renderApiOperations(schema) : ""}

${schema.components?.schemas ? renderApiModels(schema) : ""}

`.trim();
};

/**
 * Renders a complete operation (endpoint) as a markdown document
 * @param path - The API path (e.g., "/api/users/{id}")
 * @param method - HTTP method (GET, POST, PUT, etc.)
 * @param operation - The OpenAPI operation object
 * @param schema - The complete OpenAPI definition
 * @returns Formatted markdown document for the operation
 *
 * @example
 * ```typescript
 * const markdown = renderOperationMarkdown(
 *   "/api/users/{id}",
 *   "GET",
 *   operation,
 *   schema
 * );
 * ```
 */
function renderOperationMarkdown(
  path: string,
  method: string,
  operation: OperationObject,
  schema: OpenAPIDocument,
): string {
  const requestBody =
    operation.requestBody && !isReference(operation.requestBody)
      ? operation.requestBody
      : undefined;

  return `
---
title: ${operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`}
pageType: doc
footer: false
---

# ${operation.summary || operation.operationId || `${method.toUpperCase()} ${path}`}

**Method:** \`${method.toUpperCase()}\`

**Path:** \`${path}\`

${operation.description || ""}

${operation.parameters?.length ? renderParameters(operation) : ""}

${requestBody ? renderRequestBody(requestBody, schema) : ""}

## Responses

${
  operation.responses
    ? Object.entries(operation.responses)
        .map(([code, response]) => {
          if (isReference(response)) return "";
          return `### ${code}

${response.description || ""}

${response.content ? renderResponseContent(response.content, schema) : ""}
`;
        })
        .join("\n\n")
    : "_No responses_"
}

`.trim();
}

/**
 * Renders schema information including type, properties, and references
 * @param schema - The schema to render
 * @param fullSchema - The complete OpenAPI definition for resolving references
 * @param renderReadOnly - Whether to include read-only properties
 * @returns Formatted markdown string with schema details
 */
function renderSchemaInfo(
  schema: SchemaObject | ReferenceObject,
  fullSchema: OpenAPIDocument,
  renderReadOnly: boolean,
): string {
  let result = "";

  if (isReference(schema)) {
    const refName = schema.$ref.split("/").pop() as string;
    result += `**Schema:** [${refName}](../models/${refName}.md)\n\n`;

    const refSchema = fullSchema.components?.schemas?.[refName] as
      | SchemaObject
      | undefined;
    if (!refSchema) {
      addWarning(`Reference ${refName} not found in components.schemas`);
      return result;
    }

    result += renderSchemaProperties(refSchema, renderReadOnly);
  } else if (schema.type === "object" && schema.properties) {
    result += renderSchemaProperties(schema, renderReadOnly);
  } else if (schema.type === "array" && schema.items) {
    const itemsSchema = schema.items;
    if (itemsSchema) {
      if (isReference(itemsSchema)) {
        const refName = itemsSchema.$ref.split("/").pop() as string;
        result += `**Type:** Array of [${refName}](../models/${refName}.md)\n\n`;
      } else {
        result += `**Type:** Array of ${itemsSchema.type || "objects"}\n\n`;
        if (itemsSchema.properties) {
          result += renderSchemaProperties(itemsSchema, renderReadOnly);
        }
      }
    }
  } else {
    result += `**Type:** ${schema.type || "unknown"}\n\n`;
  }

  return result;
}

/**
 * Renders example values for a schema
 * @param example - Single example value
 * @param examples - Multiple named examples
 * @param contentType - MIME type for proper formatting
 * @returns Formatted markdown string with examples
 */
function renderExamples(
  example: unknown,
  examples: unknown,
  contentType: string,
): string {
  let result = "";

  if (example) {
    result += "**Example:**\n\n";
    result += renderExample(example, contentType);
  } else if (examples) {
    result += "**Examples:**\n\n";
    result += Object.entries(examples as Record<string, unknown>)
      .map(([name, ex]) => {
        const exampleObj = ex as Record<string, unknown>;
        return `*${name}:*\n${renderExample(exampleObj.value || ex, contentType)}`;
      })
      .join("\n\n");
  }

  return result;
}

/**
 * Renders the request body section of an API operation
 * @param requestBody - The request body definition from the operation
 * @param schema - The complete OpenAPI definition
 * @returns Formatted markdown for the request body section
 */
function renderRequestBody(
  requestBody: RequestBody,
  schema: OpenAPIDocument,
): string {
  const contentTypes = Object.entries(requestBody.content);

  let content = "";

  if (contentTypes.length === 1) {
    const entry = contentTypes[0];
    if (entry) {
      const [type, val] = entry;
      content = renderSchemaContent(type, val, schema, false);
    }
  } else {
    content = contentTypes
      .map(([type, val]) => {
        return `
#### ${type}

${renderSchemaContent(type, val, schema, false)}
`;
      })
      .join("\n\n");
  }

  return `
## Request Body ${requestBody.required ? " (required)" : ""}

${requestBody.description || ""}

${content}
`;
}

/**
 * Renders content for a specific content type including schema and examples
 * @param contentType - MIME type of the content
 * @param content - Media type object containing schema and examples
 * @param fullSchema - The complete OpenAPI definition
 * @param renderReadOnly - Whether to include read-only properties
 * @returns Formatted markdown string
 */
function renderSchemaContent(
  contentType: string,
  content: MediaType,
  fullSchema: OpenAPIDocument,
  renderReadOnly = true,
): string {
  const { schema, example, examples } = content;

  let result = `Content-Type: \`${contentType}\`\n\n`;

  // Render schema if available
  if (schema) {
    result += renderSchemaInfo(schema, fullSchema, renderReadOnly);
  }

  // Render examples
  result += renderExamples(example, examples, contentType);

  return result;
}

/**
 * Renders schema properties as a markdown table
 * @param schema - The schema containing properties to render
 * @param renderReadOnly - Whether to include read-only properties
 * @returns Markdown table of properties, or empty string if no properties exist
 */
function renderSchemaProperties(
  schema: SchemaObject,
  renderReadOnly = true,
): string {
  if (!schema.properties || Object.keys(schema.properties).length === 0) {
    return "";
  }

  const required = schema.required ?? [];
  const properties = schema.properties;

  let result = `#### Properties

| Name | Type | Description |
|------|------|-------------|
`;

  for (const [propName, propSchema] of Object.entries(properties)) {
    // Handle references - they don't have readOnly property
    if (isReference(propSchema)) {
      const isRequired = required.includes(propName);
      const type = getPropertyType(propSchema);
      result += `| **${propName}** | ${type} | ${isRequired ? "**Required**." : ""} |\n`;
      continue;
    }

    // Skip read-only properties unless explicitly requested
    if (propSchema.readOnly && !renderReadOnly) {
      continue;
    }

    const isRequired = required.includes(propName);
    const isReadonly = propSchema.readOnly ?? false;
    const type = getPropertyType(propSchema);
    const description = propSchema.description ?? "";
    const formattedDescription = formatMarkdownListForTable(description);

    result += `| **${propName}** | ${type} | ${isRequired ? "**Required**." : ""} ${isReadonly ? "**Read-Only**." : ""} ${formattedDescription} |\n`;
  }

  return `${result}\n`;
}

function getPropertyType(schema: SchemaObject | ReferenceObject): string {
  if ("$ref" in schema) {
    const refName = schema.$ref.split("/").pop();
    return `[${refName}](../models/${refName}.md)`;
  }

  if (schema.type === "array") {
    const itemType = schema.items
      ? getPropertyType(schema.items as SchemaObject | ReferenceObject)
      : "unknown";
    return `Array\\<${itemType}\\>`;
  }

  if (schema.enum) {
    const enumValues = schema.enum as unknown[];
    return `enum: ${formatMarkdownListForTable(enumValues.map((v) => `- \`${v}\``).join("\n"))}`;
  }

  // Handle discriminator types (anyOf, oneOf, allOf)
  if (schema.anyOf || schema.oneOf || schema.allOf) {
    const variants = (schema.anyOf || schema.oneOf || schema.allOf) as (
      | SchemaObject
      | ReferenceObject
    )[];
    const variantTypes = variants.map((variant) => {
      if ("$ref" in variant) {
        const refName = variant.$ref.split("/").pop();
        return `[${refName}](../models/${refName}.md)`;
      }
      return variant.type || "unknown";
    });

    const separator = schema.anyOf ? " | " : schema.oneOf ? " | " : " & ";
    return variantTypes.join(separator);
  }

  if (Array.isArray(schema.type)) {
    return schema.type.map(capitalize).join(" | ");
  } else {
    return capitalize(schema.type || "unknown");
  }
}

function renderExample(example: unknown, contentType: string): string {
  if (contentType.includes("json")) {
    return `\`\`\`json\n${JSON.stringify(example, null, 2)}\n\`\`\`\n`;
  }
  if (contentType.includes("xml")) {
    return `\`\`\`xml\n${example}\n\`\`\`\n`;
  }
  if (contentType.includes("yaml")) {
    return `\`\`\`yaml\n${example}\n\`\`\`\n`;
  }
  return `\`\`\`\n${example}\n\`\`\`\n`;
}

function renderResponseContent(
  content: Record<string, MediaType>,
  schema: OpenAPIDocument,
): string {
  return Object.entries(content)
    .map(([type, val]) => {
      return renderSchemaContent(type, val, schema);
    })
    .join("\n\n");
}

/**
 * Renders a data model (schema) as a complete markdown document
 * @param modelName - Name of the model/schema
 * @param schema - The schema definition
 * @param discriminatorMap - Map of child schemas to their parent discriminators
 * @returns Formatted markdown document for the model
 */
function renderModelMarkdown(
  modelName: string,
  schema: SchemaObject,
  discriminatorMap?: Map<string, string[]>,
): string {
  const schemaObj = schema as unknown as Record<string, unknown>;

  return `
---
title: ${modelName}
pageType: doc
footer: false
---

# ${modelName}

${schemaObj.description || ""}

${renderParentTypes(modelName, discriminatorMap)}

${renderDiscriminator(schemaObj)}

${schemaObj.type === "object" && schemaObj.properties ? renderSchemaProperties(schemaObj, true) : ""}

${renderPolymorphicSchemas(schemaObj)} 

${schemaObj.enum ? `**Possible values:** ${(schemaObj.enum as unknown[]).map((v) => `\`${v}\``).join(", ")}\n\n` : ""}

${schemaObj.example ? `**Example:**\n\n\`\`\`json\n${JSON.stringify(schemaObj.example, null, 2)}\n\`\`\`\n` : ""}

`.trim();
}

const renderApiOperations = (schema: OpenAPIDocument): string => {
  if (!schema.paths) {
    return "";
  }

  return `
  ### API Operations

| Operation | Method | Path | Description |
| --------- | ------ | ---- | ----------- |
${Object.entries(schema.paths)
  .map(([path, pathItem]) => {
    if (!pathItem) return "";
    return Object.entries(pathItem)
      .map(([methodName, operation]) => {
        if (
          !operation ||
          typeof operation !== "object" ||
          !("operationId" in operation || "responses" in operation)
        ) {
          return "";
        }
        const method = methodName.toUpperCase();
        const { operationId = "", summary = "", tags } = operation;

        const link = tags?.length ? tags[0]?.toLowerCase() : "default";

        return `| [${operationId}](./${link}/${operationId}.md) | \`${method.toUpperCase()}\` | \`${path}\` | ${summary.replace(/\n/g, " ")} |`;
      })
      .join("\n");
  })
  .join("\n")}`;
};

const renderApiModels = (schema: OpenAPIDocument): string => {
  if (!schema.components?.schemas) {
    return "";
  }

  return `
### API Models

| Model | Description |
| --------- | ----------- |
${Object.entries(schema.components.schemas)
  .map(([modelName, modelSchema]) => {
    if (!modelSchema || isReference(modelSchema)) return "";
    const description = modelSchema.description?.replace(/\n/g, " ");

    return `| [${modelName}](./models/${modelName}) | ${description || ""} |`;
  })
  .join("\n")}`;
};

/**
 * Renders operation parameters as a markdown table
 * @param operation - The operation containing parameters
 * @returns Markdown table of parameters, or empty string if no parameters exist
 */
function renderParameters(operation: OperationObject): string {
  if (!operation.parameters || operation.parameters.length === 0) {
    return "";
  }

  return `
## Parameters
| Name | In | Type | Required | Description |
| ---- | -- | ---- | -------- | ----------- |
${operation.parameters
  .map((param) => {
    if (isReference(param)) return "";
    const required = param.required ? "Yes" : "No";
    const paramSchema =
      param.schema && !isReference(param.schema) ? param.schema : null;

    return `| **${param.name}** | ${param.in} | ${paramSchema?.type || ""} | ${required} | ${formatMarkdownListForTable(param.description || "")} |`;
  })
  .join("\n")}`;
}

/**
 * Capitalizes the first letter of a string
 * @param name - String to capitalize
 * @returns Capitalized string, or empty string if input is falsy
 */
const capitalize = (name: string): string => {
  if (!name) return "";
  return name.charAt(0).toUpperCase() + name.slice(1);
};

/**
 * Renders discriminator information for polymorphic schemas
 * @param schema - The schema object that may contain a discriminator
 * @returns Formatted markdown for discriminator info, or empty string if none exists
 */
function renderDiscriminator(schema: Record<string, unknown>): string {
  const discriminator = schema.discriminator as
    | Record<string, unknown>
    | undefined;

  if (!discriminator) {
    return "";
  }

  const propertyName = discriminator.propertyName as string;
  const mapping = discriminator.mapping as Record<string, string> | undefined;

  let result = `#### Discriminator

This is a polymorphic schema that uses the \`${propertyName}\` property to determine the specific type.

`;

  if (mapping && Object.keys(mapping).length > 0) {
    result += `**Type Mapping:**

| Discriminator Value | Schema |
|-------------------|--------|
`;

    for (const [value, schemaRef] of Object.entries(mapping)) {
      const schemaName = schemaRef.split("/").pop();
      result += `| \`${value}\` | [${schemaName}](${schemaName}.md) |\n`;
    }

    result += "\n";
  }

  return result;
}

/**
 * Renders polymorphic schema variants (anyOf, oneOf, allOf)
 * @param schema - The schema object that may contain polymorphic variants
 * @returns Formatted markdown for all variant types, or empty string if none exist
 */
function renderPolymorphicSchemas(schema: Record<string, unknown>): string {
  let result = "";

  // Handle anyOf schemas
  if (schema.anyOf) {
    result += renderSchemaVariants("anyOf", schema.anyOf as unknown[]);
  }

  // Handle oneOf schemas
  if (schema.oneOf) {
    result += renderSchemaVariants("oneOf", schema.oneOf as unknown[]);
  }

  // Handle allOf schemas
  if (schema.allOf) {
    result += renderSchemaVariants("allOf", schema.allOf as unknown[]);
  }

  return result;
}

function renderSchemaVariants(
  variantType: string,
  variants: unknown[],
): string {
  if (!variants || variants.length === 0) {
    return "";
  }

  let result = `#### ${variantType === "anyOf" ? "Any Of" : variantType === "oneOf" ? "One Of" : "All Of"} Schemas

The following schemas can be used:

`;

  for (const variant of variants) {
    const variantSchema = variant as Record<string, unknown>;

    if (variantSchema.$ref) {
      const schemaName = (variantSchema.$ref as string).split("/").pop();
      result += `- [${schemaName}](${schemaName}.md)\n`;
    } else if (variantSchema.title) {
      result += `- **${variantSchema.title}**\n`;
      if (variantSchema.description) {
        result += `  ${variantSchema.description}\n`;
      }
    } else if (variantSchema.type) {
      result += `- Type: \`${variantSchema.type}\`\n`;
      if (variantSchema.description) {
        result += `  ${variantSchema.description}\n`;
      }
    }
  }

  return `${result}\n`;
}

/**
 * Builds a map of discriminator relationships between schemas
 * Maps child schema names to their parent discriminator schemas
 * @param schema - The complete OpenAPI definition
 * @returns Map where keys are child schema names and values are arrays of parent schema names
 */
function buildDiscriminatorMap(schema: OpenAPIDocument): Map<string, string[]> {
  const discriminatorMap = new Map<string, string[]>();

  if (!schema.components?.schemas) {
    return discriminatorMap;
  }

  // Find all schemas with discriminators and map their children to parents
  for (const [schemaName, schemaObj] of Object.entries(
    schema.components.schemas,
  )) {
    if (!schemaObj || isReference(schemaObj)) continue;
    const { discriminator, oneOf, anyOf, allOf } = schemaObj;

    // If there's a discriminator, map children to this parent
    if (discriminator) {
      // First check for explicit mapping
      if (discriminator.mapping) {
        const { mapping } = discriminator;
        for (const [, schemaRef] of Object.entries(mapping)) {
          const childSchemaName = schemaRef.split("/").pop();
          if (childSchemaName) {
            if (!discriminatorMap.has(childSchemaName)) {
              discriminatorMap.set(childSchemaName, []);
            }
            const parentList = discriminatorMap.get(childSchemaName);
            if (parentList) {
              parentList.push(schemaName);
            }
          }
        }
      }

      // Also check oneOf, anyOf, allOf for references
      const variants = (oneOf || anyOf || allOf) as
        | (SchemaObject | ReferenceObject)[]
        | undefined;
      if (variants) {
        for (const variant of variants) {
          if (isReference(variant)) {
            const childSchemaName = variant.$ref.split("/").pop();
            if (childSchemaName) {
              if (!discriminatorMap.has(childSchemaName)) {
                discriminatorMap.set(childSchemaName, []);
              }
              const parentList = discriminatorMap.get(childSchemaName);
              if (parentList) {
                parentList.push(schemaName);
              }
            }
          }
        }
      }
    }
  }

  return discriminatorMap;
}

function renderParentTypes(
  modelName: string,
  discriminatorMap?: Map<string, string[]>,
): string {
  if (!discriminatorMap || !discriminatorMap.has(modelName)) {
    return "";
  }

  const parentTypes = discriminatorMap.get(modelName);
  if (!parentTypes || parentTypes.length === 0) {
    return "";
  }

  let result = `#### Parent Type${parentTypes.length > 1 ? "s" : ""}

This model is a variant of the following polymorphic type${parentTypes.length > 1 ? "s" : ""}:

`;

  for (const parentType of parentTypes) {
    result += `- [${parentType}](${parentType}.md)\n`;
  }

  return `${result}\n`;
}

/**
 * Format a markdown list for rendering in a markdown table cell.
 * @param markdownInput The markdown input string containing lists.
 *                      Supports bullet lists (- or *) and numbered lists (1. 2. etc.).
 *                      Each list item should be on a new line.
 *                      Example:
 *                      ```
 *                      - Item 1
 *                      - Item 2
 *                      - Item 3
 *                      ```
 * @returns The formatted HTML string.
 */

function formatMarkdownListForTable(markdownInput: string): string {
  if (!markdownInput) return "";

  const html = micromark(markdownInput, null);

  return html.replace(/\n/g, " ").trim();
}
