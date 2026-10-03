<?php
// Descarga las fuentes de Google (Londrina Solid + Special Elite) a web/fonts/ para servirlas localmente.
$css_url = 'https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@400;900&family=Special+Elite&display=swap';
$ctx = stream_context_create(['http' => ['header' => "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36\r\n"]]);
$css = @file_get_contents($css_url, false, $ctx);
if (!$css) { die('No pude bajar el CSS: ' . print_r(error_get_last(), true)); }
@mkdir(__DIR__ . '/fonts');
preg_match_all("/\/\* latin \*\/\s*@font-face\s*\{(.*?)\}/s", $css, $m);
$out = [];
foreach ($m[1] as $b) {
  preg_match("/font-family: '([^']+)'/", $b, $f); preg_match('/font-weight: (\d+)/', $b, $w); preg_match('/url\(([^)]+)\)/', $b, $u);
  $name = strtolower(str_replace(' ', '-', $f[1])) . '-' . $w[1] . '.woff2';
  $data = @file_get_contents($u[1], false, $ctx);
  if ($data) { file_put_contents(__DIR__ . '/fonts/' . $name, $data); $out[] = "$name (" . strlen($data) . " bytes)"; }
}
echo "OK: " . implode(', ', $out);
