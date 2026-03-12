const zod = require("zod");

exports.createUrlSchema = zod.object({
  longUrl: zod.string().url("Must be a valid URL"),
  customAlias: zod
    .string()
    .min(3, "Alias must be at least 3 characters")
    .max(20, "Alias must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Alias can only contain letters, numbers, hyphens and underscores"
    )
    .optional(),
});
