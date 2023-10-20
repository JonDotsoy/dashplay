import { AppContext } from "../app/app-context";
import { AstroUserConfig, defineConfig } from "astro/config"
import { APIRoute, dev } from "astro"
import tailwind from "@astrojs/tailwind"
import react from "@astrojs/react"
import node from "@astrojs/node"
import tickStore from "./components/store/tick-store";
import { Hono } from "hono";
import express, { type Handler } from "express"
import * as logGroupApi from "./api/log-groups"

type ServeOption = {
  port?: number
  host?: string
}

export default async (ctx: AppContext, options?: ServeOption) => {
  tickStore.set(ctx)

  const { host = 'localhost', port = 3000 } = options ?? {}

  const server = await dev({
    root: new URL('./', import.meta.url).pathname,
    srcDir: new URL('./', import.meta.url).pathname,
    cacheDir: new URL('./.cache/', import.meta.url).pathname,
    publicDir: new URL('./public/', import.meta.url).pathname,
    outDir: new URL('./dist/', import.meta.url).pathname,
    output: 'server',
    adapter: node({
      mode: 'middleware',
    }),
    mode: 'production',
    compressHTML: false,
    integrations: [
      react(),
      // react({ include: './pages/**/*.tsx' }),
      tailwind({
        applyBaseStyles: true,
        configFile: new URL('./tailwind.config.js', import.meta.url).pathname,
      }),
    ],
  })

  const app = express()

  const asyncHandler = (cb: Handler): Handler => {
    return (req, res, next) => {
      const e: any = cb(req, res, next)

      Promise.resolve(e)
        .catch(err => {
          console.log(err)
          res.status(500).end()
        })
    }
  }

  app.get('/api/log-groups', asyncHandler(logGroupApi.get))

  app.use(server.handle)

  app.listen(port, host, () => {
    console.log(`server ready on http://${host}:${port}`)
  })
}