@echo off

rmdir /Q /S .\out
mkdir .\out

deno run -A src\main.ts

copy .\src\page-index.html .\out\rocket.html
copy .\src\page-script.js .\out\script.js
copy .\src\page-style.css .\out\style.css

.\out\rocket.html
