$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Drawing

$RepoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$BlogDir = Join-Path $RepoRoot "blog"
$ImageDir = Join-Path $RepoRoot "assets\images\blog"
New-Item -ItemType Directory -Force -Path $ImageDir | Out-Null

function ConvertTo-PlainText {
  param([string]$Value)
  $plain = [regex]::Replace($Value, "<[^>]+>", "")
  return [System.Net.WebUtility]::HtmlDecode($plain).Trim()
}

function ConvertTo-AttrText {
  param([string]$Value)
  return [System.Net.WebUtility]::HtmlEncode($Value)
}

function ConvertFrom-HexColor {
  param([string]$Hex, [int]$Alpha = 255)
  $h = $Hex.TrimStart("#")
  $r = [Convert]::ToInt32($h.Substring(0, 2), 16)
  $g = [Convert]::ToInt32($h.Substring(2, 2), 16)
  $b = [Convert]::ToInt32($h.Substring(4, 2), 16)
  return [System.Drawing.Color]::FromArgb($Alpha, $r, $g, $b)
}

function New-Font {
  param([int]$Size, [System.Drawing.FontStyle]$Style = [System.Drawing.FontStyle]::Regular)
  return New-Object System.Drawing.Font("Segoe UI", $Size, $Style, [System.Drawing.GraphicsUnit]::Pixel)
}

function Get-Theme {
  param([string]$Slug, [string]$Category)

  if ($Slug -match "green-screen") {
    return @{ Bg1 = "#0B2C22"; Bg2 = "#18B85B"; Accent = "#B8FF4B"; Accent2 = "#F7FFF0"; Ink = "#FFFFFF"; Band = "#062017" }
  }
  if ($Slug -match "typography|lottie|svg|logo") {
    return @{ Bg1 = "#26103D"; Bg2 = "#D8487E"; Accent = "#FFD166"; Accent2 = "#A7F3D0"; Ink = "#FFFFFF"; Band = "#160C24" }
  }
  if ($Slug -match "pricing|client|freelancing|business|brand|portfolio|remote") {
    return @{ Bg1 = "#102A43"; Bg2 = "#0E8F7E"; Accent = "#FBD38D"; Accent2 = "#BEE3F8"; Ink = "#FFFFFF"; Band = "#07192B" }
  }
  if ($Slug -match "data|visualization|infographic|personalization") {
    return @{ Bg1 = "#111827"; Bg2 = "#2563EB"; Accent = "#5EEAD4"; Accent2 = "#F9A8D4"; Ink = "#FFFFFF"; Band = "#07111F" }
  }
  if ($Slug -match "coding|codex|claude|css|javascript|web-animation") {
    return @{ Bg1 = "#101828"; Bg2 = "#475467"; Accent = "#7DD3FC"; Accent2 = "#C084FC"; Ink = "#FFFFFF"; Band = "#0B1220" }
  }
  if ($Slug -match "copyright") {
    return @{ Bg1 = "#2A1C12"; Bg2 = "#A15C38"; Accent = "#FFE08A"; Accent2 = "#C7D2FE"; Ink = "#FFFFFF"; Band = "#160E09" }
  }
  if ($Slug -match "diffusion|neural|machine-learning|computer-vision|large-language|ai-assistants|ai-design|ai-motion") {
    return @{ Bg1 = "#15112B"; Bg2 = "#2155D9"; Accent = "#73FBD3"; Accent2 = "#FF8FAB"; Ink = "#FFFFFF"; Band = "#0D0A1C" }
  }
  return @{ Bg1 = "#161C2D"; Bg2 = "#D65A31"; Accent = "#78DCCA"; Accent2 = "#FFE0A3"; Ink = "#FFFFFF"; Band = "#0C101D" }
}

function Split-TextLines {
  param(
    [System.Drawing.Graphics]$Graphics,
    [string]$Text,
    [System.Drawing.Font]$Font,
    [int]$MaxWidth,
    [int]$MaxLines
  )

  $words = $Text -split "\s+"
  $lines = New-Object System.Collections.Generic.List[string]
  $line = ""

  foreach ($word in $words) {
    $candidate = if ($line.Length -eq 0) { $word } else { "$line $word" }
    if ($Graphics.MeasureString($candidate, $Font).Width -le $MaxWidth) {
      $line = $candidate
    } else {
      if ($line.Length -gt 0) {
        $lines.Add($line)
      }
      $line = $word
    }
  }

  if ($line.Length -gt 0) {
    $lines.Add($line)
  }

  if ($lines.Count -gt $MaxLines) {
    $kept = @()
    for ($i = 0; $i -lt ($MaxLines - 1); $i++) {
      $kept += $lines[$i]
    }
    $tail = ($lines[($MaxLines - 1)..($lines.Count - 1)] -join " ")
    while ($tail.Length -gt 8 -and $Graphics.MeasureString("$tail...", $Font).Width -gt $MaxWidth) {
      $tail = $tail.Substring(0, $tail.LastIndexOf(" "))
    }
    $kept += "$tail..."
    return $kept
  }

  return $lines.ToArray()
}

function Draw-RoundedRectangle {
  param(
    [System.Drawing.Graphics]$Graphics,
    [System.Drawing.Brush]$Brush,
    [int]$X,
    [int]$Y,
    [int]$Width,
    [int]$Height,
    [int]$Radius
  )

  $path = New-Object System.Drawing.Drawing2D.GraphicsPath
  $d = $Radius * 2
  $path.AddArc($X, $Y, $d, $d, 180, 90)
  $path.AddArc($X + $Width - $d, $Y, $d, $d, 270, 90)
  $path.AddArc($X + $Width - $d, $Y + $Height - $d, $d, $d, 0, 90)
  $path.AddArc($X, $Y + $Height - $d, $d, $d, 90, 90)
  $path.CloseFigure()
  $Graphics.FillPath($Brush, $path)
  $path.Dispose()
}

function Draw-NetworkVisual {
  param([System.Drawing.Graphics]$Graphics, [hashtable]$Theme)
  $pen = New-Object System.Drawing.Pen((ConvertFrom-HexColor $Theme.Accent 170), 3)
  $nodeBrush = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor $Theme.Accent2 230))
  $points = @(
    @{ X = 790; Y = 180 }, @{ X = 910; Y = 120 }, @{ X = 1030; Y = 210 },
    @{ X = 855; Y = 330 }, @{ X = 1010; Y = 390 }, @{ X = 1120; Y = 310 },
    @{ X = 930; Y = 500 }
  )
  $edges = @(@(0,1), @(1,2), @(0,3), @(3,4), @(2,5), @(4,5), @(3,6), @(4,6), @(1,3))
  foreach ($edge in $edges) {
    $a = $points[$edge[0]]
    $b = $points[$edge[1]]
    $Graphics.DrawLine($pen, $a.X, $a.Y, $b.X, $b.Y)
  }
  foreach ($p in $points) {
    $Graphics.FillEllipse($nodeBrush, $p.X - 14, $p.Y - 14, 28, 28)
  }
  $pen.Dispose()
  $nodeBrush.Dispose()
}

function Draw-CodeVisual {
  param([System.Drawing.Graphics]$Graphics, [hashtable]$Theme)
  $panel = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor "#0B1220" 190))
  Draw-RoundedRectangle $Graphics $panel 745 135 360 330 28
  $dotBrush = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor $Theme.Accent 220))
  $Graphics.FillEllipse($dotBrush, 782, 168, 14, 14)
  $Graphics.FillEllipse($dotBrush, 806, 168, 14, 14)
  $Graphics.FillEllipse($dotBrush, 830, 168, 14, 14)
  $linePen = New-Object System.Drawing.Pen((ConvertFrom-HexColor $Theme.Accent2 210), 6)
  $dimPen = New-Object System.Drawing.Pen((ConvertFrom-HexColor "#FFFFFF" 95), 6)
  for ($i = 0; $i -lt 8; $i++) {
    $y = 215 + ($i * 28)
    $x = 790 + (($i % 3) * 24)
    $w = 180 + (($i * 37) % 125)
    $Graphics.DrawLine($(if ($i % 2 -eq 0) { $linePen } else { $dimPen }), $x, $y, $x + $w, $y)
  }
  $panel.Dispose(); $dotBrush.Dispose(); $linePen.Dispose(); $dimPen.Dispose()
}

function Draw-ChartVisual {
  param([System.Drawing.Graphics]$Graphics, [hashtable]$Theme)
  $axis = New-Object System.Drawing.Pen((ConvertFrom-HexColor "#FFFFFF" 110), 4)
  $bar = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor $Theme.Accent 210))
  $bar2 = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor $Theme.Accent2 210))
  $Graphics.DrawLine($axis, 760, 470, 1110, 470)
  $Graphics.DrawLine($axis, 760, 190, 760, 470)
  $heights = @(95, 160, 120, 225, 175, 255)
  for ($i = 0; $i -lt $heights.Count; $i++) {
    $x = 800 + $i * 50
    $h = $heights[$i]
    $Graphics.FillRectangle($(if ($i % 2 -eq 0) { $bar } else { $bar2 }), $x, 470 - $h, 28, $h)
  }
  $curve = New-Object System.Drawing.Pen((ConvertFrom-HexColor "#FFFFFF" 210), 5)
  $Graphics.DrawBezier($curve, 795, 420, 875, 250, 970, 385, 1080, 225)
  $axis.Dispose(); $bar.Dispose(); $bar2.Dispose(); $curve.Dispose()
}

function Draw-TimelineVisual {
  param([System.Drawing.Graphics]$Graphics, [hashtable]$Theme)
  $pen = New-Object System.Drawing.Pen((ConvertFrom-HexColor "#FFFFFF" 155), 5)
  $accent = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor $Theme.Accent 235))
  $accent2 = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor $Theme.Accent2 220))
  for ($row = 0; $row -lt 4; $row++) {
    $y = 210 + $row * 78
    $Graphics.DrawLine($pen, 760, $y, 1095, $y)
    for ($i = 0; $i -lt 4; $i++) {
      $x = 790 + $i * 90 + (($row * 23) % 40)
      $Graphics.FillPolygon($(if ($i % 2 -eq 0) { $accent } else { $accent2 }), @(
        [System.Drawing.Point]::new($x, $y - 18),
        [System.Drawing.Point]::new($x + 18, $y),
        [System.Drawing.Point]::new($x, $y + 18),
        [System.Drawing.Point]::new($x - 18, $y)
      ))
    }
  }
  $pen.Dispose(); $accent.Dispose(); $accent2.Dispose()
}

function Draw-TypeVisual {
  param([System.Drawing.Graphics]$Graphics, [hashtable]$Theme)
  $bigFont = New-Font 180 ([System.Drawing.FontStyle]::Bold)
  $smallFont = New-Font 72 ([System.Drawing.FontStyle]::Bold)
  $brush = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor $Theme.Accent 235))
  $brush2 = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor $Theme.Accent2 220))
  $Graphics.DrawString("Aa", $bigFont, $brush, 760, 170)
  $Graphics.DrawString("TYPE", $smallFont, $brush2, 800, 365)
  $bigFont.Dispose(); $smallFont.Dispose(); $brush.Dispose(); $brush2.Dispose()
}

function Draw-BusinessVisual {
  param([System.Drawing.Graphics]$Graphics, [hashtable]$Theme)
  $brush = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor "#FFFFFF" 150))
  $accent = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor $Theme.Accent 230))
  for ($i = 0; $i -lt 3; $i++) {
    Draw-RoundedRectangle $Graphics $(if ($i -eq 1) { $accent } else { $brush }) (760 + $i * 105) (210 + (($i % 2) * 45)) 210 150 24
  }
  $pen = New-Object System.Drawing.Pen((ConvertFrom-HexColor $Theme.Accent2 220), 4)
  $Graphics.DrawLine($pen, 850, 405, 1070, 405)
  $Graphics.DrawLine($pen, 960, 320, 960, 495)
  $brush.Dispose(); $accent.Dispose(); $pen.Dispose()
}

function Draw-GreenScreenVisual {
  param([System.Drawing.Graphics]$Graphics, [hashtable]$Theme)
  $screen = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor "#32D74B" 220))
  Draw-RoundedRectangle $Graphics $screen 760 150 355 250 30
  $camera = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor "#0B1220" 235))
  Draw-RoundedRectangle $Graphics $camera 835 425 150 70 20
  $Graphics.FillRectangle($camera, 985, 445, 95, 30)
  $Graphics.FillEllipse((New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor $Theme.Accent 235))), 885, 438, 44, 44)
  $screen.Dispose(); $camera.Dispose()
}

function Draw-CoverImage {
  param([string]$Slug, [string]$Title, [string]$Category, [string]$OutputPath)

  $theme = Get-Theme $Slug $Category
  $width = 1200
  $height = 630
  $bitmap = New-Object System.Drawing.Bitmap($width, $height)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

  $rect = New-Object System.Drawing.Rectangle(0, 0, $width, $height)
  $bg = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, (ConvertFrom-HexColor $theme.Bg1), (ConvertFrom-HexColor $theme.Bg2), 24)
  $graphics.FillRectangle($bg, $rect)

  $bandBrush = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor $theme.Band 150))
  $graphics.FillRectangle($bandBrush, 0, 0, 690, $height)

  $ringPen = New-Object System.Drawing.Pen((ConvertFrom-HexColor "#FFFFFF" 45), 2)
  for ($i = 0; $i -lt 9; $i++) {
    $graphics.DrawEllipse($ringPen, 700 + ($i * 32), 80 + ($i * 20), 420 - ($i * 18), 420 - ($i * 18))
  }

  if ($Slug -match "green-screen") {
    Draw-GreenScreenVisual $graphics $theme
  } elseif ($Slug -match "typography|lottie|svg|logo") {
    Draw-TypeVisual $graphics $theme
  } elseif ($Slug -match "data|visualization|infographic|personalization") {
    Draw-ChartVisual $graphics $theme
  } elseif ($Slug -match "coding|codex|claude|css|javascript|web-animation") {
    Draw-CodeVisual $graphics $theme
  } elseif ($Slug -match "pricing|client|freelancing|business|brand|portfolio|remote") {
    Draw-BusinessVisual $graphics $theme
  } elseif ($Slug -match "diffusion|neural|machine-learning|computer-vision|large-language|ai-assistants|ai-design|ai-motion") {
    Draw-NetworkVisual $graphics $theme
  } else {
    Draw-TimelineVisual $graphics $theme
  }

  $brandFont = New-Font 25 ([System.Drawing.FontStyle]::Bold)
  $categoryFont = New-Font 24 ([System.Drawing.FontStyle]::Bold)
  $titleSize = 52
  $titleFont = New-Font $titleSize ([System.Drawing.FontStyle]::Bold)
  $lines = Split-TextLines $graphics $Title $titleFont 590 4
  while ($lines.Count -gt 4 -and $titleSize -gt 38) {
    $titleFont.Dispose()
    $titleSize -= 4
    $titleFont = New-Font $titleSize ([System.Drawing.FontStyle]::Bold)
    $lines = Split-TextLines $graphics $Title $titleFont 590 4
  }

  $whiteBrush = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor $theme.Ink 245))
  $mutedBrush = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor "#FFFFFF" 170))
  $accentBrush = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor $theme.Accent 240))
  $pillBrush = New-Object System.Drawing.SolidBrush((ConvertFrom-HexColor "#FFFFFF" 32))

  $graphics.FillEllipse($accentBrush, 78, 67, 20, 20)
  $graphics.DrawString("PixabAnimation Blog", $brandFont, $mutedBrush, 112, 58)

  $catText = $Category.ToUpperInvariant()
  $catSize = $graphics.MeasureString($catText, $categoryFont)
  Draw-RoundedRectangle $graphics $pillBrush 78 143 ([int]$catSize.Width + 42) 50 18
  $graphics.DrawString($catText, $categoryFont, $accentBrush, 100, 153)

  $y = 222
  foreach ($line in $lines) {
    $graphics.DrawString($line, $titleFont, $whiteBrush, 76, $y)
    $y += $titleFont.Height + 4
  }

  $graphics.DrawLine((New-Object System.Drawing.Pen((ConvertFrom-HexColor $theme.Accent 210), 5)), 80, 545, 250, 545)

  $bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)

  $bg.Dispose(); $bandBrush.Dispose(); $ringPen.Dispose(); $brandFont.Dispose(); $categoryFont.Dispose()
  $titleFont.Dispose(); $whiteBrush.Dispose(); $mutedBrush.Dispose(); $accentBrush.Dispose(); $pillBrush.Dispose()
  $graphics.Dispose(); $bitmap.Dispose()
}

$articles = @{}
$articleFiles = Get-ChildItem -Path $BlogDir -Filter "*.html" | Where-Object { $_.Name -ne "index.html" } | Sort-Object Name

foreach ($file in $articleFiles) {
  $slug = [System.IO.Path]::GetFileNameWithoutExtension($file.Name)
  $html = [System.IO.File]::ReadAllText($file.FullName)

  $titleMatch = [regex]::Match($html, "<h1>(.*?)</h1>", [System.Text.RegularExpressions.RegexOptions]::Singleline)
  if (-not $titleMatch.Success) {
    $titleMatch = [regex]::Match($html, '<meta property="og:title" content="([^"]+)"')
  }
  $categoryMatch = [regex]::Match($html, '<div class="blog-category">.*?</span>\s*(.*?)</div>', [System.Text.RegularExpressions.RegexOptions]::Singleline)

  $title = if ($titleMatch.Success) { ConvertTo-PlainText $titleMatch.Groups[1].Value } else { $slug }
  $category = if ($categoryMatch.Success) { ConvertTo-PlainText $categoryMatch.Groups[1].Value } else { "PixabAnimation Blog" }
  $imageName = "$slug.png"
  $absoluteUrl = "https://pixabanimation.github.io/assets/images/blog/$imageName"
  $relativeUrl = "../assets/images/blog/$imageName"
  $outputPath = Join-Path $ImageDir $imageName

  Draw-CoverImage $slug $title $category $outputPath

  $alt = ConvertTo-AttrText $title
  $html = [regex]::Replace($html, '(<meta property="og:image" content=")[^"]*(")', "`$1$absoluteUrl`$2")
  $html = [regex]::Replace($html, '(<meta name="twitter:image" content=")[^"]*(")', "`$1$absoluteUrl`$2")
  $html = [regex]::Replace($html, '("image":\s*")[^"]*(")', "`$1$absoluteUrl`$2")
  $html = [regex]::Replace(
    $html,
    '(<div class="blog-cover">\s*<img src=")[^"]+(" alt=")[^"]*(" loading="lazy"\s*>\s*</div>)',
    { param($m) $m.Groups[1].Value + $relativeUrl + $m.Groups[2].Value + $alt + $m.Groups[3].Value },
    [System.Text.RegularExpressions.RegexOptions]::Singleline
  )

  [System.IO.File]::WriteAllText($file.FullName, $html, (New-Object System.Text.UTF8Encoding($false)))

  $articles[$file.Name] = @{
    Slug = $slug
    Title = $title
    RelativeUrl = $relativeUrl
  }
}

$indexPath = Join-Path $BlogDir "index.html"
$indexHtml = [System.IO.File]::ReadAllText($indexPath)

foreach ($article in $articles.GetEnumerator()) {
  $fileName = [regex]::Escape($article.Key)
  $relativeUrl = $article.Value.RelativeUrl
  $alt = ConvertTo-AttrText $article.Value.Title
  $pattern = '(<a href="' + $fileName + '"[^>]*>.*?<img class="blog-home-card-img" src=")[^"]*(" alt=")[^"]*(")'
  $indexHtml = [regex]::Replace(
    $indexHtml,
    $pattern,
    { param($m) $m.Groups[1].Value + $relativeUrl + $m.Groups[2].Value + $alt + $m.Groups[3].Value },
    [System.Text.RegularExpressions.RegexOptions]::Singleline
  )
}

[System.IO.File]::WriteAllText($indexPath, $indexHtml, (New-Object System.Text.UTF8Encoding($false)))

Write-Host "Generated $($articleFiles.Count) blog cover images and updated article/image references."
