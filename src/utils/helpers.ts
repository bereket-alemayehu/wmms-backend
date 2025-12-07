export const formatDate = (date: Date | string): string => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  return new Date(date).toLocaleDateString(undefined, options);
};

export const validateInput = (input: any, type: string): boolean => {
  switch (type) {
    case "string":
      return typeof input === "string" && input.trim() !== "";
    case "number":
      return typeof input === "number" && !isNaN(input);
    // Add more validation cases as needed
    default:
      return false;
  }
};

export const generateUniqueID = (): string => {
  return "id-" + Math.random().toString(36).substr(2, 16);
};

