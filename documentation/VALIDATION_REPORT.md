# DEERE // CYCLEBOOK — Validation Report

## Build revision

`1.1-m-parser-fix`

## Power BI load failure repaired

The first executable build failed in Power BI Desktop with:

```text
M Engine error: Microsoft.Data.Mashup.Preview; Token ',' expected.
```

Root cause: the generated embedded Power Query tables used field specifications such as `SegmentCode = type text` and `DilutedEPS = type number` inside `type table [...]`. In M table-type grammar, those fields must be written as `SegmentCode = text` and `DilutedEPS = number`.

The generator now normalizes primitive field types correctly, and the validator contains a dedicated regression check for this class of failure.

## Current static validation

```text
CHECKS
 + 127 JSON/PBI descriptor files parse
 + PBIP has one report artifact
 + PBIP report path exists
 + PBIR uses byPath semantic model ref
 + PBIR semantic-model path resolves
 + Page order has 7 pages
 + Page order exactly matches page dirs
 + Active page is in page order
 + Page id self-match 85e801881afa98c3cc2d
 + Page id self-match a656be65e12870af248f
 + Page id self-match 2f2c922a6f3436a46dd5
 + Page id self-match d91eaac0343ef21a4cd9
 + Page id self-match 65721da987f3a5fa0c79
 + Page id self-match a24fb8747b56660faf1b
 + Page id self-match aa26ab00db387bbd7409
 + Visual IDs globally unique
 + 112 visual containers have matching IDs and fit canvas
 + 14 TMDL tables discovered; 61 DAX measures discovered
 + All PBIR column/measure bindings resolve against authored TMDL metadata
 + Relationship endpoints resolve
 + Source bundled DE-1Q25-News-Release.pdf
 + Source bundled DE-2Q25-News-Release.pdf
 + Source bundled DE-3Q25-News-Release.pdf
 + Source bundled DE-4Q25-News-Release.pdf
 + Source bundled DE-1Q26-News-Release.pdf
 + Source bundled DE-2Q26-News-Release.pdf
 + Source bundled DE-3Q26-News-Release.pdf
 + ZIP includes PBIP
 + ZIP includes semantic model
 + ZIP includes report
 + ZIP readable with 162 entries
 + TMDL comment/format-string hygiene checked
 + M #table field-type grammar checked
WARNINGS
ERRORS
SUMMARY errors=0 warnings=0 checks=33
```

## Remaining validation boundary

This environment still cannot execute the Windows Power BI Desktop engine. The corrected package therefore needs one Desktop open/refresh pass to validate runtime parsing, DAX/model materialization, external FRED credentials, and final visual rendering. Any subsequent Desktop error can be patched directly because the PBIP/PBIR/TMDL project is text-based.
