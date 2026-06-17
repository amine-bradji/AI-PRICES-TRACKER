$ErrorActionPreference = 'Stop'
$base = 'C:\Users\amine\ZCodeProject\ai-price-tracker'

$files = @(
    (Get-ChildItem "$base\src\components\*.tsx").FullName
    "$base\src\app\page.tsx"
    "$base\src\app\docs\page.tsx"
) | Where-Object { Test-Path $_ }

# Pass 1: Replace every slate class with a unique token + __DK__ prefixed dark variant.
# __DK__ prevents later replacements from catching the dark part.
# Patterns are ordered longest-first to prevent partial matches.
$pass1 = [ordered]@{
    'placeholder:text-slate-500' = 'placeholder:__PTSL500__ __DK__placeholder:text-slate-500'
    'hover:bg-slate-800/30' = '__HBG800_30__ __DK__hover:bg-slate-800/30'
    'hover:bg-slate-700/60' = '__HBG700_60__ __DK__hover:bg-slate-700/60'
    'hover:border-slate-500' = '__HBR500__ __DK__hover:border-slate-500'
    'hover:text-slate-200' = '__HTSL200__ __DK__hover:text-slate-200'
    'hover:text-white' = '__HTW__ __DK__hover:text-white'
    'bg-slate-900/60' = '__BG900_60__ __DK__bg-slate-900/60'
    'bg-slate-900/40' = '__BG900_40__ __DK__bg-slate-900/40'
    'bg-slate-800/80' = '__BG800_80__ __DK__bg-slate-800/80'
    'bg-slate-800/60' = '__BG800_60__ __DK__bg-slate-800/60'
    'bg-slate-800/30' = '__BG800_30__ __DK__bg-slate-800/30'
    'bg-slate-500/15' = '__BG500_15__ __DK__bg-slate-500/15'
    'bg-slate-500/10' = '__BG500_10__ __DK__bg-slate-500/10'
    'bg-slate-400/10' = '__BG400_10__ __DK__bg-slate-400/10'
    'border-slate-800/60' = '__BR800_60__ __DK__border-slate-800/60'
    'border-slate-800/80' = '__BR800_80__ __DK__border-slate-800/80'
    'border-slate-500/30' = '__BR500_30__ __DK__border-slate-500/30'
    'text-slate-100' = '__TSL100__ __DK__text-slate-100'
    'text-slate-200' = '__TSL200__ __DK__text-slate-200'
    'text-slate-300' = '__TSL300__ __DK__text-slate-300'
    'text-slate-400' = '__TSL400__ __DK__text-slate-400'
    'text-slate-500' = '__TSL500__ __DK__text-slate-500'
    'text-slate-600' = '__TSL600__ __DK__text-slate-600'
    'bg-slate-950' = '__BG950__ __DK__bg-slate-950'
    'bg-slate-900' = '__BG900__ __DK__bg-slate-900'
    'bg-slate-800' = '__BG800__ __DK__bg-slate-800'
    'bg-slate-700' = '__BG700__ __DK__bg-slate-700'
    'border-slate-800' = '__BR800__ __DK__border-slate-800'
    'border-slate-700' = '__BR700__ __DK__border-slate-700'
    'border-slate-600' = '__BR600__ __DK__border-slate-600'
}

# Pass 2: Replace tokens with light-mode values, then restore __DK__ -> dark:
$pass2 = [ordered]@{
    '__TSL100__' = 'text-slate-800'
    '__TSL200__' = 'text-slate-700'
    '__TSL300__' = 'text-slate-600'
    '__TSL400__' = 'text-slate-500'
    '__TSL500__' = 'text-slate-400'
    '__TSL600__' = 'text-slate-500'
    '__PTSL500__' = 'text-slate-400'
    '__BG950__' = 'bg-white'
    '__BG900__' = 'bg-white'
    '__BG900_60__' = 'bg-gray-50/80'
    '__BG900_40__' = 'bg-gray-50'
    '__BG800__' = 'bg-gray-200'
    '__BG800_80__' = 'bg-gray-100/80'
    '__BG800_60__' = 'bg-gray-100/80'
    '__BG800_30__' = 'bg-gray-100/60'
    '__BG700__' = 'bg-gray-300'
    '__BG500_15__' = 'bg-slate-100'
    '__BG500_10__' = 'bg-slate-100'
    '__BG400_10__' = 'bg-slate-100'
    '__BR800__' = 'border-slate-200'
    '__BR800_60__' = 'border-slate-200/60'
    '__BR800_80__' = 'border-slate-300/80'
    '__BR500_30__' = 'border-slate-300'
    '__BR700__' = 'border-slate-300'
    '__BR600__' = 'border-slate-400'
    '__HBG800_30__' = 'hover:bg-gray-100'
    '__HBG700_60__' = 'hover:bg-gray-200'
    '__HBR500__' = 'hover:border-slate-400'
    '__HTSL200__' = 'hover:text-slate-700'
    '__HTW__' = 'hover:text-slate-800'
    '__DK__' = 'dark:'
}

$updatedCount = 0
foreach ($file in $files) {
    $content = [System.IO.File]::ReadAllText($file)
    $original = $content
    # Pass 1: tokenize (longest patterns first — already ordered)
    foreach ($key in $pass1.Keys) {
        $content = $content.Replace($key, $pass1[$key])
    }
    # Pass 2: resolve tokens
    foreach ($key in $pass2.Keys) {
        $content = $content.Replace($key, $pass2[$key])
    }
    if ($content -ne $original) {
        [System.IO.File]::WriteAllText($file, $content)
        $name = [System.IO.Path]::GetFileName($file)
        Write-Output "Updated: $name"
        $updatedCount++
    }
}
Write-Output "`nDone. $updatedCount files updated."
