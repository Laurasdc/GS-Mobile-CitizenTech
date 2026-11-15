$ErrorActionPreference = 'Stop'
# Remove somente os arquivos da antiga recuperacao de senha.
$marker = Join-Path $PSScriptRoot 'package.json'
if (-not (Test-Path -LiteralPath $marker -PathType Leaf)) {
    throw 'Extraia este pacote na raiz do projeto antes de executar o script.'
}
$files = @(
    'src/app/esqueci-senha.tsx',
    'src/app/redefinir-senha.tsx'
)
foreach ($relative in $files) {
    $path = Join-Path $PSScriptRoot $relative
    if (Test-Path -LiteralPath $path -PathType Leaf) {
        Remove-Item -LiteralPath $path -Force
        Write-Host "Removido: $relative"
    }
}
Write-Host 'Remocao concluida. Os dados e os demais arquivos foram preservados.'
