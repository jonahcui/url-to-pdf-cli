#!/usr/bin/env node

import { program } from 'commander';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 错误处理函数
const handleError = (error, phase) => {
  console.error('\n❌ Error occurred during:', phase);
  console.error('Error type:', error.name);
  console.error('Error message:', error.message);
  
  switch (error.name) {
    case 'TimeoutError':
      console.error('\nPossible solutions:');
      console.error('1. Check your internet connection');
      console.error('2. Increase the navigation timeout using --timeout option');
      console.error('3. The website might be blocking automated access');
      break;
    case 'Error':
      if (error.message.includes('socket hang up')) {
        console.error('\nPossible solutions:');
        console.error('1. Check your internet connection');
        console.error('2. Try using --no-sandbox option');
        console.error('3. Try using --disable-dev-shm-usage option');
        console.error('4. Make sure Chrome is installed on your system');
      }
      break;
    case 'ProtocolError':
      console.error('\nPossible solutions:');
      console.error('1. The website might require authentication');
      console.error('2. Try using --wait-for option to ensure page is fully loaded');
      break;
    default:
      console.error('\nPossible solutions:');
      console.error('1. Check if the URL is valid and accessible');
      console.error('2. Check your internet connection');
      console.error('3. The website might be blocking automated access');
  }
  
  process.exit(1);
};

program
  .version('1.0.0')
  .argument('<url>', 'URL to convert to PDF')
  .option('-o, --output <filename>', 'output PDF file name', 'output.pdf')
  .option('-f, --format <format>', 'paper format (A4, A3, Letter, etc)', 'A4')
  .option('-w, --width <width>', 'page width in pixels (overrides format)')
  .option('-h, --height <height>', 'page height in pixels (overrides format)')
  .option('--margin-top <margin>', 'top margin in pixels', '0')
  .option('--margin-right <margin>', 'right margin in pixels', '0')
  .option('--margin-bottom <margin>', 'bottom margin in pixels', '0')
  .option('--margin-left <margin>', 'left margin in pixels', '0')
  .option('--scale <scale>', 'scale of the webpage rendering', '1')
  .option('--background', 'print background graphics', true)
  .option('--timeout <ms>', 'navigation timeout in milliseconds', '30000')
  .option('--wait-for <selector>', 'wait for specific element to load')
  .option('--no-sandbox', 'disable sandbox (use with caution)')
  .option('--disable-dev-shm-usage', 'disable /dev/shm usage (for Docker/CI environments)')
  .option('--executable-path <path>', 'path to Chrome executable')
  .action(async (url, options) => {
    let browser;
    try {
      // 验证 URL
      try {
        new URL(url);
      } catch (e) {
        throw new Error(`Invalid URL: ${url}. Please provide a valid URL including protocol (e.g., https://)`);
      }

      console.log('🚀 Launching browser...');
      const launchOptions = {
        headless: 'new',
        args: []
      };

      // 添加启动参数
      if (options.noSandbox) {
        console.log('⚠️  Running without sandbox');
        launchOptions.args.push('--no-sandbox');
        launchOptions.args.push('--disable-setuid-sandbox');
      }

      if (options.disableDevShmUsage) {
        console.log('⚠️  Running with disabled /dev/shm usage');
        launchOptions.args.push('--disable-dev-shm-usage');
      }

      // 添加其他有用的参数
      launchOptions.args.push(
        '--disable-gpu',
        '--disable-software-rasterizer',
        '--disable-extensions',
        '--no-first-run',
        '--no-zygote'
      );

      if (options.executablePath) {
        console.log(`📍 Using Chrome at: ${options.executablePath}`);
        launchOptions.executablePath = options.executablePath;
      }

      // 设置更大的超时时间
      launchOptions.timeout = parseInt(options.timeout);

      console.log('Browser launch options:', launchOptions);
      browser = await puppeteer.launch(launchOptions).catch(e => {
        throw new Error(`Failed to launch browser: ${e.message}`);
      });

      const page = await browser.newPage();
      
      // 设置更多的页面选项
      await page.setDefaultNavigationTimeout(parseInt(options.timeout));
      await page.setJavaScriptEnabled(true);

      console.log(`🌐 Navigating to ${url}...`);
      const response = await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout: parseInt(options.timeout)
      });

      if (!response.ok()) {
        throw new Error(`Failed to load page: ${response.status()} ${response.statusText()}`);
      }

      // 如果指定了等待选择器
      if (options.waitFor) {
        console.log(`⏳ Waiting for element "${options.waitFor}"...`);
        await page.waitForSelector(options.waitFor, { timeout: parseInt(options.timeout) });
      }

      console.log('📑 Generating PDF...');
      const outputPath = path.resolve(process.cwd(), options.output);
      
      // 构建 PDF 选项
      const pdfOptions = {
        path: outputPath,
        printBackground: options.background,
        scale: parseFloat(options.scale)
      };

      // 如果指定了宽度和高度，使用自定义尺寸
      if (options.width && options.height) {
        pdfOptions.width = options.width;
        pdfOptions.height = options.height;
      } else {
        pdfOptions.format = options.format;
      }

      // 设置页边距
      pdfOptions.margin = {
        top: options.marginTop,
        right: options.marginRight,
        bottom: options.marginBottom,
        left: options.marginLeft
      };

      await page.pdf(pdfOptions);

      console.log(`✅ PDF has been saved to: ${outputPath}`);
    } catch (error) {
      handleError(error, error.message.includes('launch') ? 'browser launch' : 
                        error.message.includes('Navigation') ? 'page navigation' :
                        error.message.includes('PDF') ? 'PDF generation' : 'unknown phase');
    } finally {
      if (browser) {
        console.log('👋 Closing browser...');
        await browser.close().catch(() => {});
      }
    }
  });

program.parse();
