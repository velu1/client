// Dynamic Field Mapper Utility for QR Code Data Resolution
// Handles dynamic field mapping based on printer configuration

export interface FieldMappingResult {
  value: string;
  source: "direct" | "alias" | "computed" | "default" | "missing";
  originalField: string;
  resolvedField?: string;
}

export interface FieldMappingConfig {
  data: Record<string, any>;
  entityTableRows?: Array<{ slNo: number; name: string; id: string }>;
  debugMode?: boolean;
}

export class DynamicFieldMapper {
  private debugMode: boolean = false;

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode;
  }

  /**
   * Create a comprehensive field map with all possible field variations
   */
  private createFieldMap(
    config: FieldMappingConfig
  ): Record<string, FieldMappingResult> {
    const { data, entityTableRows } = config;
    const fieldMap: Record<string, FieldMappingResult> = {};

    // Direct field mappings from data
    Object.keys(data).forEach((key) => {
      const normalizedKey = this.normalizeFieldName(key);
      fieldMap[normalizedKey] = {
        value: String(data[key] || ""),
        source: "direct",
        originalField: key,
        resolvedField: key,
      };
    });

    // Create aliases for common field variations
    const fieldAliases: Record<string, string[]> = {
      // Part Number variations
      partnumber: ["partNumber", "part_number", "part-number", "PartNumber"],

      // Lot Number variations
      lotnumber: [
        "lotNumber",
        "lot_number",
        "lot-number",
        "LotNumber",
        "LOT NUMBER",
        "batch",
      ],

      // Quantity variations
      quantity: ["qty", "Quantity", "QTY"],

      // Manufacturer variations
      manufacturer: ["manufacturer", "Manufacturer", "mfg", "vendor"],

      // Date variations
      manufdate: [
        "manufactureDate",
        "manufacture_date",
        "mfg_date",
        "Manuf Date",
      ],

      // ID variations
      uniqueid: ["uniqueId", "unique_id", "uid", "UID"],
      grn: ["invoiceNumber", "invoice_number", "receipt_number"],
      ipin: [
        "internalPartNumber",
        "internal_part_number",
        "internal-part-number",
      ],

      // Additional fields that might come from API
      partlocation: ["partLocation", "part_location", "location"],
      partdescription: ["partDescription", "part_description", "description"],
      internalpartnumber: [
        "internalPartNumber",
        "internal_part_number",
        "ipin",
      ],
      expiredate: ["expireDate", "expire_date", "expiry_date"],
      incrementid: ["incrementId", "increment_id", "id"],
    };

    // Add alias mappings
    Object.entries(fieldAliases).forEach(([normalizedName, aliases]) => {
      if (!fieldMap[normalizedName]) {
        // Find the first matching alias in the data
        const matchingAlias = aliases.find((alias) =>
          data.hasOwnProperty(alias)
        );
        if (matchingAlias && data[matchingAlias] !== undefined) {
          fieldMap[normalizedName] = {
            value: String(data[matchingAlias] || ""),
            source: "alias",
            originalField: matchingAlias,
            resolvedField: matchingAlias,
          };
        }
      }
    });

    // Add computed fields
    this.addComputedFields(fieldMap, data);

    // Add entity table row mappings if available
    if (entityTableRows && entityTableRows.length > 0) {
      entityTableRows.forEach((row) => {
        const normalizedName = this.normalizeFieldName(row.name);
        const normalizedId = this.normalizeFieldName(row.id);

        // Try to find matching data field
        const dataValue =
          data[row.name] ||
          data[row.id] ||
          data[normalizedName] ||
          data[normalizedId];

        if (dataValue !== undefined && !fieldMap[normalizedName]) {
          fieldMap[normalizedName] = {
            value: String(dataValue),
            source: "direct",
            originalField: row.name,
            resolvedField: row.id,
          };
        }
      });
    }

    if (this.debugMode) {
      console.log("[FieldMapper] Created field map:", fieldMap);
    }

    return fieldMap;
  }

  /**
   * Add computed fields that can be derived from existing data
   */
  private addComputedFields(
    fieldMap: Record<string, FieldMappingResult>,
    data: Record<string, any>
  ) {
    // Add today's date as default manufacture date if not provided
    if (!fieldMap["manufdate"] && !fieldMap["manufacturedate"]) {
      fieldMap["manufdate"] = {
        value: new Date().toISOString().split("T")[0],
        source: "computed",
        originalField: "computed_current_date",
      };
    }

    // Add formatted dates if raw dates exist
    if (data.manufactureDate && typeof data.manufactureDate === "string") {
      try {
        const date = new Date(data.manufactureDate);
        if (!isNaN(date.getTime())) {
          fieldMap["manufdate"] = {
            value: date.toISOString().split("T")[0],
            source: "computed",
            originalField: "manufactureDate",
            resolvedField: "formatted_manufacture_date",
          };
        }
      } catch (e) {
        console.warn(
          "[FieldMapper] Failed to parse manufacture date:",
          data.manufactureDate
        );
      }
    }
  }

  /**
   * Normalize field name for case-insensitive matching
   */
  private normalizeFieldName(name: string): string {
    if (!name || typeof name !== "string") return "";

    return name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "") // Remove all non-alphanumeric characters
      .trim();
  }

  /**
   * Resolve a field value based on the field name from printer configuration
   */
  public resolveField(
    fieldName: string,
    config: FieldMappingConfig
  ): FieldMappingResult {
    const fieldMap = this.createFieldMap(config);
    const normalizedFieldName = this.normalizeFieldName(fieldName);

    if (this.debugMode) {
      console.log(
        `[FieldMapper] Resolving field: "${fieldName}" (normalized: "${normalizedFieldName}")`
      );
    }

    // Direct match
    if (fieldMap[normalizedFieldName]) {
      if (this.debugMode) {
        console.log(
          `[FieldMapper] Found direct match:`,
          fieldMap[normalizedFieldName]
        );
      }
      return fieldMap[normalizedFieldName];
    }

    // Fallback: Try exact field name match (case sensitive)
    if (config.data[fieldName] !== undefined) {
      if (this.debugMode) {
        console.log(
          `[FieldMapper] Found exact field name match: "${fieldName}"`
        );
      }
      return {
        value: String(config.data[fieldName] || ""),
        source: "direct",
        originalField: fieldName,
        resolvedField: fieldName,
      };
    }

    // No match found
    if (this.debugMode) {
      console.warn(`[FieldMapper] No match found for field: "${fieldName}"`);
      console.log(
        "[FieldMapper] Available normalized fields:",
        Object.keys(fieldMap)
      );
    }

    return {
      value: "",
      source: "missing",
      originalField: fieldName,
    };
  }

  /**
   * Resolve multiple fields based on priority configuration
   */
  public resolveFields(
    priorityConfig: Array<{ priority: string; value: string; _id?: string }>,
    config: FieldMappingConfig
  ): Array<{
    priority: number;
    fieldName: string;
    result: FieldMappingResult;
  }> {
    const results: Array<{
      priority: number;
      fieldName: string;
      result: FieldMappingResult;
    }> = [];

    // Sort by priority
    const sortedPriorities = priorityConfig.sort(
      (a, b) => parseInt(a.priority) - parseInt(b.priority)
    );

    sortedPriorities.forEach((item) => {
      const result = this.resolveField(item.value, config);
      results.push({
        priority: parseInt(item.priority),
        fieldName: item.value,
        result,
      });
    });

    if (this.debugMode) {
      console.log("[FieldMapper] Resolved fields:", results);
    }

    return results;
  }

  /**
   * Generate QR content based on priority configuration and delimiter
   */
  public generateQRContent(
    priorityConfig: Array<{ priority: string; value: string; _id?: string }>,
    config: FieldMappingConfig,
    delimiter: string = "|"
  ): {
    content: string;
    debug: Array<{
      priority: number;
      fieldName: string;
      value: string;
      source: string;
    }>;
  } {
    const resolvedFields = this.resolveFields(priorityConfig, config);

    const qrParts: string[] = [];
    const debugInfo: Array<{
      priority: number;
      fieldName: string;
      value: string;
      source: string;
    }> = [];

    resolvedFields.forEach(({ priority, fieldName, result }) => {
      let cleanValue = result.value;

      // Clean the value to ensure it doesn't contain delimiter characters
      if (cleanValue && cleanValue.includes(delimiter)) {
        console.warn(
          `[FieldMapper] Value "${cleanValue}" contains delimiter character "${delimiter}". Replacing with "-"`
        );
        cleanValue = cleanValue.replace(
          new RegExp(delimiter.replace(/[|\\{}()[\]^$+*?.]/g, "\\$&"), "g"),
          "-"
        );
      }

      // Always add the value (even if empty) to maintain position
      qrParts.push(cleanValue);

      debugInfo.push({
        priority,
        fieldName,
        value: cleanValue,
        source: result.source,
      });

      if (this.debugMode) {
        console.log(
          `[FieldMapper] Priority ${priority}: "${fieldName}" = "${cleanValue}" (${result.source})`
        );
      }
    });

    const content = qrParts.join(delimiter);

    if (this.debugMode) {
      console.log(`[FieldMapper] Generated QR content: "${content}"`);
      console.log(`[FieldMapper] Debug info:`, debugInfo);
    }

    return {
      content,
      debug: debugInfo,
    };
  }
}

// Export convenience functions for backward compatibility
export const createFieldMapper = (debugMode: boolean = false) =>
  new DynamicFieldMapper(debugMode);

export const resolveQRContent = (
  priorityConfig: Array<{ priority: string; value: string; _id?: string }>,
  data: Record<string, any>,
  delimiter: string = "|",
  entityTableRows?: Array<{ slNo: number; name: string; id: string }>,
  debugMode: boolean = false
): {
  content: string;
  debug: Array<{
    priority: number;
    fieldName: string;
    value: string;
    source: string;
  }>;
} => {
  const mapper = new DynamicFieldMapper(debugMode);
  return mapper.generateQRContent(
    priorityConfig,
    {
      data,
      entityTableRows,
      debugMode,
    },
    delimiter
  );
};
