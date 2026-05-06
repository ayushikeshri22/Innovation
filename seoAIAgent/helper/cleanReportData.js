export default function cleanReportData(obj) {
  // Handle arrays
  if (Array.isArray(obj)) {
    const cleaned = obj
      .map(cleanReportData)
      .filter(
        (val) =>
          val !== null &&
          val !== undefined &&
          !(Array.isArray(val) && val.length === 0) &&
          !(
            typeof val === "object" &&
            !Array.isArray(val) &&
            Object.keys(val).length === 0
          ),
      );

    return cleaned;
  }

  // Handle objects
  if (typeof obj === "object" && obj !== null) {
    // Remove entire object based on conditions
    if (
      obj.scoreDisplayMode === "notApplicable" ||
      (typeof obj.score === "number" && obj.score > 0.8)
    ) {
      return undefined;
    }

    const cleanedObj = {};

    for (const key in obj) {
      const value = cleanReportData(obj[key]);

      if (
        value !== null &&
        value !== undefined &&
        !(Array.isArray(value) && value.length === 0) &&
        !(
          typeof value === "object" &&
          !Array.isArray(value) &&
          Object.keys(value).length === 0
        )
      ) {
        cleanedObj[key] = value;
      }
    }

    return cleanedObj;
  }

  return obj;
}
