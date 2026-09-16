import type { TextField } from 'payload'

export const seedKeyField: TextField = {
  name: 'seedKey',
  type: 'text',
  unique: true,
  admin: {
    disableBulkEdit: true,
    disableGroupBy: true,
    disableListColumn: true,
    disableListFilter: true,
    hidden: true,
  },
  access: {
    read: () => false,
  },
}
