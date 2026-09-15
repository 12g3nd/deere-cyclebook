param([Parameter(Mandatory = $true)][string]$Jobs, [int]$Port = 0)
# Run a batch of DAX queries against the model open in Power BI Desktop.
# Jobs is a JSON file: [{ "query": "EVALUATE ...", "out": "C:\...\result.ndjson" }]. Each result row is written
# as one JSON array of strings in column order, with numbers in invariant culture.
$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Web

$pbi = Get-Process PBIDesktop -ErrorAction SilentlyContinue | Select-Object -First 1
if (-not $pbi) { throw "Power BI Desktop is not running. Open DEERE_CYCLEBOOK.pbip and wait for the report to load." }
if ($Port -eq 0) {
  $engine = Get-CimInstance Win32_Process -Filter "Name='msmdsrv.exe'" | Where-Object ParentProcessId -eq $pbi.Id | Select-Object -First 1
  $Port = (Get-NetTCPConnection -OwningProcess $engine.ProcessId -State Listen | Select-Object -First 1).LocalPort
}
$dll = Join-Path (Split-Path $pbi.Path) "Microsoft.PowerBI.AdomdClient.dll"
if (-not (Test-Path $dll)) { $dll = Get-ChildItem (Split-Path (Split-Path $pbi.Path)) -Recurse -Filter Microsoft.PowerBI.AdomdClient.dll | Select-Object -First 1 -ExpandProperty FullName }
$asm = [Reflection.Assembly]::LoadFrom($dll)
$conn = [Activator]::CreateInstance($asm.GetType("Microsoft.AnalysisServices.AdomdClient.AdomdConnection"), @("Data Source=localhost:$Port"))
$conn.Open()
$invariant = [Globalization.CultureInfo]::InvariantCulture
$utf8 = New-Object Text.UTF8Encoding($false)
try {
  foreach ($job in (Get-Content $Jobs -Raw -Encoding UTF8 | ConvertFrom-Json)) {
    $cmd = $conn.CreateCommand()
    $cmd.CommandText = $job.query
    $cmd.CommandTimeout = 900
    $reader = $cmd.ExecuteReader()
    $writer = New-Object IO.StreamWriter($job.out, $false, $utf8)
    try {
      while ($reader.Read()) {
        $cells = for ($i = 0; $i -lt $reader.FieldCount; $i++) {
          $v = $reader.GetValue($i)
          $s = if ($null -eq $v -or $v -is [DBNull]) { "" } elseif ($v -is [IFormattable]) { $v.ToString($null, $invariant) } else { [string]$v }
          [Web.HttpUtility]::JavaScriptStringEncode($s, $true)
        }
        $writer.WriteLine("[" + ($cells -join ",") + "]")
      }
    } finally {
      $writer.Close()
      $reader.Close()
    }
  }
} finally {
  $conn.Close()
}
