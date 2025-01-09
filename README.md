# URL to PDF Converter

A command-line tool to convert web pages to PDF using Puppeteer.

## Installation

To install globally:

```bash
npm install -g @your-npm-username/url-to-pdf
```

Alternatively, you can install locally and link the package:

```bash
npm install
npm link
```

## Usage

```bash
url-to-pdf <url> [options]

Options:
  -V, --version              output the version number
  -o, --output <filename>    output PDF file name (default: "output.pdf")
  -f, --format <format>      paper format (A4, A3, Letter, etc) (default: "A4")
  -w, --width <width>        page width in pixels (overrides format)
  -h, --height <height>      page height in pixels (overrides format)
  --margin-top <margin>      top margin in pixels (default: "0")
  --margin-right <margin>    right margin in pixels (default: "0")
  --margin-bottom <margin>   bottom margin in pixels (default: "0")
  --margin-left <margin>     left margin in pixels (default: "0")
  --scale <scale>           scale of the webpage rendering (default: "1")
  --background              print background graphics (default: true)
  --timeout <ms>           navigation timeout in milliseconds (default: "30000")
  --wait-for <selector>     wait for specific element to load
  --no-sandbox             disable sandbox (use with caution)
  --disable-dev-shm-usage  disable /dev/shm usage (for Docker/CI environments)
  --executable-path <path> path to Chrome executable
  -h, --help              display help for command
```

## Examples

Basic usage:
```bash
url-to-pdf https://example.com -o example.pdf
```

Custom paper size:
```bash
url-to-pdf https://example.com -w 1920 -h 1080 -o custom-size.pdf
```

Custom format with margins:
```bash
url-to-pdf https://example.com -f A3 --margin-top 20 --margin-left 20 -o with-margins.pdf
```

Wait for specific element and increase timeout:
```bash
url-to-pdf https://example.com --wait-for "#content" --timeout 60000 -o with-wait.pdf
```

Using with restricted environments:
```bash
url-to-pdf https://example.com --no-sandbox --disable-dev-shm-usage -o output.pdf
```

Using custom Chrome installation:
```bash
url-to-pdf https://example.com --executable-path "/path/to/chrome" -o output.pdf
```

## Troubleshooting

If you encounter errors, try these solutions:

1. **Socket hang up or connection errors**:
   - Check your internet connection
   - Try using `--no-sandbox --disable-dev-shm-usage` options
   - Increase timeout: `--timeout 60000`
   - Specify Chrome path: `--executable-path "/path/to/chrome"`

2. **Page not loading completely**:
   - Use `--wait-for` option to wait for specific elements
   - Increase the timeout value
   - Check if the website blocks automated access

3. **PDF generation fails**:
   - Verify the URL is correct and accessible
   - Try different paper formats or custom dimensions
   - Check if you have sufficient permissions in the output directory

4. **Docker/CI Environment Issues**:
   - Use `--no-sandbox --disable-dev-shm-usage` options
   - Make sure Chrome is installed in the container
   - Consider using a custom Chrome installation path
