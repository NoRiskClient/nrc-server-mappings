#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const Ajv = require("ajv");
const addFormats = require("ajv-formats");

const ajv = new Ajv({
  allErrors: true,
  verbose: true,
});
addFormats(ajv);

const rootSchemaPath = path.join(
  __dirname,
  "..",
  "servers",
  "manifest-schema.json",
);
const rootSchema = JSON.parse(fs.readFileSync(rootSchemaPath, "utf8"));

const { logger, reportError } = require("./logger");

function prettyServerName(manifestPath) {
  const name = path.basename(path.dirname(manifestPath));
  return name.replace(/[-_]?smp$/i, "").replace(/[-_]?mc$/i, "");
}

function getSnippetAroundIndex(text, index, contextLines = 2) {
  const lines = text.split(/\r?\n/);
  index = Math.max(0, Math.min(index || 0, text.length));
  let charCount = 0;
  let lineNum = 0;
  for (; lineNum < lines.length; lineNum++) {
    const nextCount = charCount + lines[lineNum].length + 1;
    if (index < nextCount) break;
    charCount = nextCount;
  }

  const startLine = Math.max(0, lineNum - contextLines);
  const endLine = Math.min(lines.length - 1, lineNum + contextLines);

  const snippet = lines
    .slice(startLine, endLine + 1)
    .map((l, i) => `${String(startLine + i + 1).padStart(4)} | ${l}`)
    .join("\n");

  return { line: lineNum + 1, snippet };
}

function getLineAndColumnFromIndex(text, index) {
  const lines = text.split(/\r?\n/);
  let count = 0;
  for (let i = 0; i < lines.length; i++) {
    const lineLen = lines[i].length + 1;
    if (index < count + lineLen) {
      return { line: i + 1, column: index - count + 1, lineText: lines[i] };
    }
    count += lineLen;
  }
  return {
    line: lines.length,
    column: Math.max(1, lines[lines.length - 1].length),
    lineText: lines[lines.length - 1],
  };
}

function findPropertySnippet(manifestText, instancePath) {
  if (!instancePath || instancePath === "") return null;
  const parts = instancePath.split("/").filter(Boolean);
  const prop = parts[parts.length - 1];
  if (!prop) return null;

  const escaped = prop.replace(/[-\\/\\^$*+?.()|[\]{}]/g, "\\$&");
  const regex = new RegExp(`"${escaped}"\\s*:`, "i");
  const match = manifestText.match(regex);
  if (!match) return null;
  const index = match.index || 0;
  return getSnippetAroundIndex(manifestText, index, 2);
}

function suggestFixForAjvError(error) {
  const suggestions = [];
  switch (error.keyword) {
    case "enum":
      if (error.params && error.params.allowedValues) {
        suggestions.push(
          `Allowed values: ${JSON.stringify(error.params.allowedValues)}`,
        );
        suggestions.push(
          "Fix: choose one of the allowed values (check spelling and casing).",
        );
      }
      break;
    case "required":
      if (error.params && error.params.missingProperty) {
        suggestions.push(`Missing property: ${error.params.missingProperty}`);
        suggestions.push(
          "Fix: add the property to the manifest with an appropriate value.",
        );
      }
      break;
    case "type":
      if (error.params && error.params.type) {
        suggestions.push(`Expected type: ${error.params.type}`);
        suggestions.push(
          "Fix: ensure the value is the correct JSON type (number, string, boolean, object, array).",
        );
      }
      break;
    case "additionalProperties":
      if (error.params && error.params.additionalProperty) {
        suggestions.push(
          `Unexpected property: ${error.params.additionalProperty}`,
        );
        suggestions.push(
          "Fix: remove or rename the property, or update the schema if it should be allowed.",
        );
      }
      break;
    case "minLength":
    case "maxLength":
      suggestions.push(
        "Fix: adjust the string length to match schema constraints.",
      );
      break;
    default:
      suggestions.push(
        "Fix: review the schema rule and adjust the manifest accordingly.",
      );
  }

  suggestions.push(
    "Tip: run `npm run validate-manifest` after edits to re-check.",
  );
  return suggestions;
}

function validateManifest(manifestPath, schemaPath = null) {
  const rel = path.relative(process.cwd(), manifestPath);
  if (!rel.match(/^[a-z0-9/._-]+$/)) {
    logger("error", `${rel}: Non [a-z0-9/._-] character in path`);
    return false;
  }

  let manifestText;
  try {
    manifestText = fs.readFileSync(manifestPath, "utf8");
  } catch (err) {
    logger("error", `${rel}: Failed to read: ${err.message}`);
    return false;
  }

  let manifest;
  try {
    manifest = JSON.parse(manifestText);
  } catch (err) {
    const msg = err && err.message ? err.message : String(err);
    const rel = path.join(
      "servers",
      path.basename(path.dirname(manifestPath)),
      path.basename(manifestPath),
    );

    let pos = null;
    const posMatch = msg.match(/position\s*(\d+)/i);
    if (posMatch) pos = parseInt(posMatch[1], 10);

    if (pos === null) {
      const trailing = manifestText.match(/,\s*[\]\}]/);
      if (trailing && typeof trailing.index === "number") pos = trailing.index;
    }

    if (pos === null) {
      const tokenMatch = msg.match(
        /Unexpected token ['"]?(.+?)['"]?(?: in JSON)?/i,
      );
      if (tokenMatch) {
        const tok = tokenMatch[1];
        const idx = manifestText.indexOf(tok);
        if (idx !== -1) pos = idx;
      }
    }

    if (pos !== null) {
      const { line, column } = getLineAndColumnFromIndex(manifestText, pos);
      const lines = manifestText.split(/\r?\n/);
      const start = Math.max(0, line - 3);
      const end = Math.min(lines.length - 1, line + 1);

      const snippetLines = [];
      for (let i = start; i <= end; i++) {
        const num = i + 1;
        const prefix = `${String(num).padStart(3)} | `;
        snippetLines.push(prefix + lines[i]);
        if (i === line - 1) {
          const caretPad = " ".repeat(prefix.length + Math.max(0, column - 1));
          snippetLines.push(caretPad + "^");
        }
      }

      snippetLines.push(
        "",
        "Suggestion: check for trailing commas, missing quotes, or incorrect brackets.",
      );

      logger(
        "error",
        `${rel}: SyntaxError: ${msg} (${line}:${column})`,
        snippetLines,
      );
    } else {
      // Last-resort fallback when we cannot determine a position.
      reportError(`JSON syntax error in ${rel}: ${msg}`, [
        "The JSON is malformed. Common causes: trailing commas, missing quotes, or stray characters.",
      ]);
    }

    return false;
  }

  const schema = schemaPath
    ? JSON.parse(fs.readFileSync(schemaPath, "utf8"))
    : rootSchema;
  const validate = ajv.compile(schema);
  const valid = validate(manifest);

  if (!valid) {
    reportError(`Validation failed for ${rel}:`, []);
    validate.errors.forEach((error) => {
      const pathString =
        error.instancePath && error.instancePath !== ""
          ? error.instancePath
          : "/";
      const lines = [`${pathString}: ${error.message}`];

      const snippetInfo = findPropertySnippet(manifestText, error.instancePath);
      if (snippetInfo) {
        lines.push(
          "",
          `code (around line ${snippetInfo.line}):`,
          ...snippetInfo.snippet.split("\n"),
        );
      }

      const suggestions = suggestFixForAjvError(error);
      if (suggestions && suggestions.length) {
        lines.push("", "suggestions:");
        for (const s of suggestions) lines.push(`  - ${s}`);
      }

      reportError(`  ${pathString}`, lines);
    });

    return false;
  }

  return true;
}

function validateAssets(manifestPath) {
  try {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    const manifestDir = path.dirname(manifestPath);

    const assets = manifest.assets;
    if (!assets) {
      reportError(
        `No assets section found for ${prettyServerName(manifestPath)}`,
      );
      return false;
    }

    let allValid = true;

    if (assets.icon) {
      const iconPath = path.join(manifestDir, assets.icon);
      if (!fs.existsSync(iconPath)) {
        reportError(
          `Icon file not found for ${prettyServerName(manifestPath)}: ${assets.icon}`,
        );
        allValid = false;
      }
    }

    if (assets.background) {
      const backgroundPath = path.join(manifestDir, assets.background);
      if (!fs.existsSync(backgroundPath)) {
        reportError(
          `Background file not found for ${prettyServerName(manifestPath)}: ${assets.background}`,
        );
        allValid = false;
      }
    }

    return allValid;
  } catch (_) {
    return false;
  }
}

function findManifestFiles() {
  const serversDir = path.join(__dirname, "..", "servers");
  const manifests = [];
  const missing = [];

  const entries = fs.readdirSync(serversDir);
  for (const entry of entries) {
    const fullPath = path.join(serversDir, entry);
    const stat = fs.statSync(fullPath);
    if (!stat.isDirectory()) continue;

    const manifestPath = path.join(fullPath, "manifest.json");
    if (fs.existsSync(manifestPath)) {
      manifests.push(manifestPath);
    } else {
      missing.push(entry);
    }
  }

  return { manifests, missing };
}

function main() {
  const { manifests: manifestFiles, missing: missingManifests } =
    findManifestFiles();

  if (manifestFiles.length === 0 && missingManifests.length === 0) {
    logger("error", "No manifest files found.");
    process.exit(1);
  }

  let allValid = true;

  if (missingManifests.length > 0) {
    for (const dirName of missingManifests) {
      reportError(`Missing manifest.json for server: ${dirName}`);
      allValid = false;
    }
  }

  for (const manifestPath of manifestFiles) {
    const manifestDir = path.dirname(manifestPath);
    const localSchemaPath = path.join(manifestDir, "manifest-schema.json");
    const schemaPath = fs.existsSync(localSchemaPath) ? localSchemaPath : null;

    const manifestValid = validateManifest(manifestPath, schemaPath);
    const assetsValid = validateAssets(manifestPath);

    if (!manifestValid || !assetsValid) {
      allValid = false;
    }
  }

  if (allValid) {
    logger("info", "All checks passed!");
    process.exit(0);
  }

  process.exit(1);
}

if (require.main === module) {
  main();
}

module.exports = { validateManifest, validateAssets, findManifestFiles };
