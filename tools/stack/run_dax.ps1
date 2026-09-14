param([Parameter(Mandatory = $true)][string]$QueryFile, [int]$Port = 57694, [int]$Preview = 160)
# Run a DAX query file against the local Power BI Desktop model and save each result column to stack_test\<name>.<col>.txt.
$ErrorActionPreference = "Stop"
$pbi = (Get-Process PBIDesktop | Select-Object -First 1).Path
$dll = Join-Path (Split-Path $pbi) "Microsoft.PowerBI.AdomdClient.dll"
if (-not (Test-Path $dll)) { $dll = Get-ChildItem (Split-Path (Split-Path $pbi)) -Recurse -Filter Microsoft.PowerBI.AdomdClient.dll | Select-Object -First 1 -ExpandProperty FullName }
$asm = [Reflection.Assembly]::LoadFrom($dll)
$conn = [Activator]::CreateInstance($asm.GetType("Microsoft.AnalysisServices.AdomdClient.AdomdConnection"), @("Data Source=localhost:$Port"))
$conn.Open()
try {
  $cmd = $conn.CreateCommand()
  $cmd.CommandText = Get-Content $QueryFile -Raw
  $reader = $cmd.ExecuteReader()
  $base = [IO.Path]::ChangeExtension($QueryFile, $null).TrimEnd(".")
  $namesFile = "$base.names.json"
  $names = if (Test-Path $namesFile) { Get-Content $namesFile -Raw | ConvertFrom-Json } else { @() }
  while ($reader.Read()) {
    for ($i = 0; $i -lt $reader.FieldCount; $i++) {
      $v = [string]$reader.GetValue($i)
      $label = if ($i -lt $names.Count) { $names[$i] } else { $reader.GetName($i) }
      Set-Content -Path "$base.m$i.txt" -Value $v -Encoding utf8
      $head = if ($v.StartsWith("data:image")) { ($v -replace '^.*?<svg[^>]*>', '') } else { $v }
      "{0} | {1} chars | {2}" -f $label, $v.Length, $head.Substring(0, [Math]::Min($Preview, $head.Length))
    }
  }
  $reader.Close()
} catch {
  "DAX ERROR: " + $_.Exception.InnerException.Message + $_.Exception.Message
} finally { $conn.Close() }
