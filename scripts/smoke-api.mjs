#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { spawn } from 'node:child_process'
import process from 'node:process'

const API_PORT = 8080
const DEFAULT_API_BASE = `http://127.0.0.1:${API_PORT}`
const REQ_TIMEOUT_MS = 8_000
const STARTUP_TIMEOUT_MS = 45_000

function findRepoRoot(startDir) {
  let current = path.resolve(startDir)

  while (true) {
    const gitDir = path.join(current, '.git')
    if (fs.existsSync(gitDir)) {
      return current
    }

    const parent = path.dirname(current)
    if (parent === current) {
      return startDir
    }

    current = parent
  }
}

function parseEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}

  const raw = fs.readFileSync(filePath, 'utf8')
  const parsed = {}

  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('export ')) continue

    const equalIndex = trimmed.indexOf('=')
    if (equalIndex <= 0) continue

    const key = trimmed.slice(0, equalIndex).trim()
    let value = trimmed.slice(equalIndex + 1).trim()

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1)
    }

    if (key) {
      parsed[key] = value
    }
  }

  return parsed
}

function mergeEnv(repoRoot) {
  const envCandidates = [
    path.join(repoRoot, '.env'),
    path.join(process.cwd(), '.env'),
    path.join(process.cwd(), '..', '.env'),
    path.join(process.cwd(), '..', '..', '.env'),
  ]

  let fileEnv = {}
  const envPath = envCandidates.find((candidate) => fs.existsSync(candidate))
  if (envPath) {
    fileEnv = parseEnvFile(envPath)
  }

  return {
    ...process.env,
    ...fileEnv,
  }
}

async function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs || REQ_TIMEOUT_MS)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeout)
  }
}

async function waitForHealthy(baseUrl) {
  const deadline = Date.now() + STARTUP_TIMEOUT_MS

  while (Date.now() < deadline) {
    try {
      const response = await fetchWithTimeout(`${baseUrl}/health`, { timeoutMs: 2000 })
      if (response.ok) {
        const body = await response.json()
        if (body?.ok) {
          return true
        }
      }
    } catch {
      // server not yet ready
    }

    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  return false
}

async function requestJson(url, options = {}, expectedStatus = 200) {
  const response = await fetchWithTimeout(url, options)
  if (response.status !== expectedStatus) {
    const body = await response.text().catch(() => '[unreadable]')
    throw new Error(`Unexpected status for ${options.method || 'GET'} ${url}: ${response.status} ${response.statusText}. Body: ${body}`)
  }

  const body = await response.json().catch((error) => {
    throw new Error(`Invalid JSON from ${url}: ${error?.message || error}`)
  })

  return body
}

function startApiServer(repoRoot, env) {
  const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm'

  const child = spawn(
    npmCommand,
    ['run', '--workspace', '@gohealt/api', 'dev'],
    {
      cwd: repoRoot,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
      // Node's CVE-2024-27980 fix makes spawn() throw EINVAL on Windows when the
      // target is a .cmd/.bat without a shell. Args here are static, so there is
      // no interpolation surface for the shell to reinterpret.
      shell: process.platform === 'win32',
    }
  )

  if (child.stdout) {
    child.stdout.on('data', (chunk) => {
      process.stdout.write(chunk.toString())
    })
  }

  if (child.stderr) {
    child.stderr.on('data', (chunk) => {
      process.stderr.write(chunk.toString())
    })
  }

  child.on('exit', (code, signal) => {
    if (code !== null && code !== 0 && code !== 130) {
      console.error(`API process exited with code ${code} signal ${signal || '-'}`)
    }
  })

  return child
}

function stopApiServer(child) {
  if (!child || child.killed) return

  child.removeAllListeners()
  child.stdout?.removeAllListeners()
  child.stderr?.removeAllListeners()
  child.kill('SIGINT')

  setTimeout(() => {
    if (!child.killed) {
      child.kill('SIGKILL')
    }
  }, 1000)
}

async function main() {
  const repoRoot = findRepoRoot(process.cwd())
  const env = mergeEnv(repoRoot)
  const baseUrl = process.env.API_BASE_URL || DEFAULT_API_BASE

  const required = ['SUPABASE_URL', 'SUPABASE_SERVICE_KEY']
  const missing = required.filter((key) => !env[key])
  if (missing.length > 0) {
    console.log(`SKIP: missing ${missing.join(', ')} in env`) 
    console.log('Set these values and rerun npm run --workspace @gohealt/api test to execute smoke checks.')
    return 0
  }

  const existingHealthy = await (async () => {
    try {
      const health = await requestJson(`${baseUrl}/health`, { timeoutMs: 500 }, 200)
      return health?.ok === true
    } catch {
      return false
    }
  })()

  let server = null
  if (!existingHealthy) {
    console.log('INFO: no healthy API at startup, launching local API server for smoke test')
    server = startApiServer(repoRoot, env)

    const healthy = await waitForHealthy(baseUrl)
    if (!healthy) {
      stopApiServer(server)
      throw new Error('FAIL: API did not become healthy in time')
    }
  }

  try {
    const health = await requestJson(`${baseUrl}/health`)
    if (!health?.ok) {
      throw new Error('Health endpoint did not return ok=true')
    }

    const trailsPayload = await requestJson(`${baseUrl}/trails`)
    if (!Array.isArray(trailsPayload?.trails)) {
      throw new Error('GET /trails response shape mismatch')
    }

    const alertsPayload = await requestJson(`${baseUrl}/alerts`)
    if (!Array.isArray(alertsPayload?.alerts)) {
      throw new Error('GET /alerts response shape mismatch')
    }

    const plansPayload = await requestJson(`${baseUrl}/plans?userId=smoke-test-user`)
    if (!Array.isArray(plansPayload?.plans)) {
      throw new Error('GET /plans response shape mismatch')
    }

    const manifestPayload = await requestJson(`${baseUrl}/offline-manifest`)
    if (!manifestPayload?.generatedAt || !manifestPayload?.version || !Array.isArray(manifestPayload?.trails)) {
      throw new Error('GET /offline-manifest response shape mismatch')
    }

    const sampleTrailId = trailsPayload.trails[0]?.id
    if (sampleTrailId) {
      const detailPayload = await requestJson(`${baseUrl}/trails/${sampleTrailId}`)
      if (!detailPayload?.trail?.id || detailPayload.trail.id !== sampleTrailId) {
        throw new Error('GET /trails/:id response shape mismatch')
      }
    }

    const sosPayload = await requestJson(
      `${baseUrl}/sos`,
      {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'smoke-test-user',
          latitude: 3.139,
          longitude: 101.686,
          contacts: ['+60123456789'],
          notes: 'Automated smoke test',
        }),
      },
      200
    )

    if (!sosPayload?.eventId || sosPayload?.status !== 'accepted') {
      throw new Error('POST /sos response mismatch')
    }

    console.log('PASS: API smoke checks succeeded')
    return 0
  } finally {
    if (server) {
      stopApiServer(server)
    }
  }
}

main()
  .then((code) => process.exit(code))
  .catch((error) => {
    console.error('FAIL:', error?.message || error)
    process.exit(1)
  })
