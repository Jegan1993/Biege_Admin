
export const skinTypeOptions = [
  "oily",
  "dry",
  "combination",
  "normal",
  "sensitive",
];

export const concernOptions = [
  "ACNE",
  "DARK_SPOTS",
  "PIGMENTATION",
  "REDNESS",
  "PORES",
  "FINE_LINES",
  "DARK_CIRCLES",
  "DULLNESS",
  "DEHYDRATION",
];
export const strengthOptions = [
  { label: "Low", value: 1 },
  { label: "Medium", value: 2 },
  { label: "High", value: 3 },
];

export const contraindicationOptions = [
  "pregnancy-unsafe",
  "not-with-retinoids",
  "not-for-sensitive-skin",
  "patch-test-needed",
];

export const routineStepOptions = [
  "cleanser",
  "toner",
  "serum",
  "moisturiser",
  "sunscreen",
  "mask",
  "treatment",
];

// Backend enum: AM, PM, BOTH
export const timeOfUseOptions = [
  "AM",
  "PM",
  "BOTH",
];

export const beautyRoleOptions = [
  "foundation",
  "concealer",
  "lipstick",
  "eyeliner",
  "mascara",
  "blush",
  "highlighter",
  "eyeshadow",
  "primer",
  "compact",
];

// Backend enum: MATTE, DEWY, SATIN, SHIMMER
export const finishOptions = [
  "matte",
  "dewy",
  "satin",
  "shimmer",
];

// Backend enum: SHEER, MEDIUM, FULL
export const coverageOptions = [
  "sheer",
  "medium",
  "full",
];

export const suitableLookOptions = [
  "natural",
  "bridal",
  "party",
  "office",
  "glam",
  "smokey",
  "everyday",
  "minimal",
];

// Backend enum: BUDGET, MID, PREMIUM
export const priceBandOptions = [
  "BUDGET",
  "MID",
  "PREMIUM",
];

export const formatLabel = (value = "") => {
  return String(value)
    .replace(/_/g, " ")
    .replace(/-/g, " ")
    .replace(/([A-Z])/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

// Converts camelCase / kebab-case / spaces to UPPERCASE_SNAKE_CASE
export const normalizeEnum = (value = "") => {
  return String(value)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[\s-]+/g, "_")
    .toUpperCase();
};

export const getArrayValue = (value) => {
  return Array.isArray(value) ? value : [];
};

// Converts frontend concern values into backend enum values
export const normalizeConcern = (value = "") => {
  return normalizeEnum(value);
};

// Converts strength labels into backend numeric values
export const normalizeStrength = (value) => {
  const strengthMap = {
    LOW: 1,
    MEDIUM: 2,
    HIGH: 3,
  };

  if (typeof value === "number") {
    return [1, 2, 3].includes(value) ? value : 2;
  }

  const normalized = String(value || "")
    .trim()
    .toUpperCase();

  return strengthMap[normalized] || 2;
};

export const getEmptyAiTagForm = () => ({
  productId: "",
  productType: "SKIN_CARE",
  skinTypes: [],
  concerns: [],
  routineStep: "",
  timeOfUse: "BOTH",
  contraindications: [],
  beauty: {
    productRole: "",
    finish: "",
    coverage: "",
    suitableLooks: [],
  },
  priceBand: "MID",
  includeInAIRecommendations: true,
});
