const { z } = require('zod');

const LoginConfigSchema = z.object({
  url: z.string().url({ message: 'login.url must be a valid URL' }),
  method: z.enum(['GET', 'POST', 'PUT']).default('POST'),
  env_username_key: z.string().min(1),
  env_password_key: z.string().min(1),
  successCriteria: z.object({
    statuses: z
      .array(z.number().int().min(100).max(599))
      .min(1, 'successCriteria.statuses must contain at least one status code'),
    responseIncludes: z.string().optional(),
  }),
});

const CategorySchema = z.object({
  enabled: z.boolean().default(true),
  timeout: z.number().int().min(500).max(30000).default(5000),
  urls: z
    .array(z.string().url({ message: 'Each entry in urls must be a valid URL' }))
    .min(1, 'A category must have at least one URL'),
  login: LoginConfigSchema.optional(),
});

/**
 * The full urls.json schema.
 * A record of category name → CategorySchema.
 * Category names must be non-empty strings.
 */
const UrlsConfigSchema = z
  .record(z.string().min(1), CategorySchema)
  .refine((config) => Object.keys(config).length > 0, {
    message: 'urls.json must define at least one category',
  });

module.exports = { UrlsConfigSchema, CategorySchema, LoginConfigSchema };