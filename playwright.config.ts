import {defineConfig} from '@playwright/test';
const channel=process.env.RCRT_BROWSER_CHANNEL==='chrome'?'chrome':'msedge';
const baseURL=process.env.PLAYWRIGHT_BASE_URL||'http://localhost:5173';
export default defineConfig({testDir:'tests',fullyParallel:false,workers:1,use:{baseURL,browserName:'chromium',channel,headless:true,trace:'retain-on-failure'},webServer:process.env.PLAYWRIGHT_BASE_URL?[
  {command:'node node_modules/tsx/dist/cli.mjs server/src/index.ts',url:'http://localhost:4100/api/health',reuseExistingServer:false,timeout:30000},
  {command:'npm run dev -w client -- --port 5175',url:baseURL,reuseExistingServer:false,timeout:30000},
]:{command:'npm run dev',url:baseURL,reuseExistingServer:true,timeout:30000}});
