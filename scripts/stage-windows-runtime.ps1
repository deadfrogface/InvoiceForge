$ErrorActionPreference = 'Stop'
if (!$env:CONDA_PREFIX) { throw 'Activate the build-time micromamba environment first' }
$target = Join-Path $PSScriptRoot '../vendor/tools/win32/x64'
New-Item -ItemType Directory -Force -Path $target | Out-Null
$runtime = Join-Path $target 'runtime'
New-Item -ItemType Directory -Force -Path $runtime | Out-Null
# Preserve the complete relocatable environment, DLLs, JRE, licences and conda provenance.
Copy-Item -Path (Join-Path $env:CONDA_PREFIX '*') -Destination $runtime -Recurse -Force
$tessdata = Join-Path $target 'tessdata'
New-Item -ItemType Directory -Force -Path $tessdata | Out-Null
foreach ($language in @('deu', 'eng')) {
  Copy-Item (Join-Path $runtime "share/tessdata/$language.traineddata") $tessdata -Force
}
python (Join-Path $PSScriptRoot 'stage-validator.py') --output $target
if ($LASTEXITCODE -ne 0) { throw 'Validator resource staging failed' }
