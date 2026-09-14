# CYCLEBOOK — Repair Notes

## Revision 1.1 — M parser fix

- Fixed invalid primitive type syntax in all generated embedded Power Query `#table` definitions.
- Before: `type table [Name = type text, Value = type number]`
- After: `type table [Name = text, Value = number]`
- The error manifested in Power BI Desktop as `Token ',' expected.` during PBIP model creation.
- Added a validator rule that scans every embedded `#table(type table [...])` declaration and rejects the invalid form.
- Rebuilt the PBIP package after the generator fix.
