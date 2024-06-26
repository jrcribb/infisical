// Code generated by automation script, DO NOT EDIT.
// Automated by pulling database and generating zod schema
// To update. Just run npm run generate:schema
// Written by akhilmhdh.

import { z } from "zod";

import { TImmutableDBKeys } from "./models";

export const LdapConfigsSchema = z.object({
  id: z.string().uuid(),
  orgId: z.string().uuid(),
  isActive: z.boolean(),
  url: z.string(),
  encryptedBindDN: z.string(),
  bindDNIV: z.string(),
  bindDNTag: z.string(),
  encryptedBindPass: z.string(),
  bindPassIV: z.string(),
  bindPassTag: z.string(),
  searchBase: z.string(),
  encryptedCACert: z.string(),
  caCertIV: z.string(),
  caCertTag: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  groupSearchBase: z.string().default(""),
  groupSearchFilter: z.string().default(""),
  searchFilter: z.string().default("")
});

export type TLdapConfigs = z.infer<typeof LdapConfigsSchema>;
export type TLdapConfigsInsert = Omit<z.input<typeof LdapConfigsSchema>, TImmutableDBKeys>;
export type TLdapConfigsUpdate = Partial<Omit<z.input<typeof LdapConfigsSchema>, TImmutableDBKeys>>;
