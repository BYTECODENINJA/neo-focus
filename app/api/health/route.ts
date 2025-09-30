import { NextResponse } from "next/server"
import { promises as fs } from "fs"
import path from "path"

interface HealthStatus {
  status: "healthy" | "unhealthy" | "degraded"
  timestamp: string
  version: string
  uptime: number
  checks: {
    database: {
      status: "healthy" | "unhealthy"
      responseTime?: number
      error?: string
    }
    filesystem: {
      status: "healthy" | "unhealthy"
      error?: string
    }
    memory: {
      status: "healthy" | "unhealthy"
      usage: {
        rss: number
        heapTotal: number
        heapUsed: number
        external: number
      }
    }
  }
}

export async function GET() {
  const startTime = Date.now()

  try {
    const health: HealthStatus = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      uptime: process.uptime(),
      checks: {
        database: await checkDatabase(),
        filesystem: await checkFilesystem(),
        memory: checkMemory(),
      },
    }

    // Determine overall health status
    const checkStatuses = Object.values(health.checks).map((check) => check.status)
    if (checkStatuses.includes("unhealthy")) {
      health.status = "unhealthy"
    } else if (checkStatuses.includes("degraded")) {
      health.status = "degraded"
    }

    const statusCode = health.status === "healthy" ? 200 : 503

    return NextResponse.json(health, {
      status: statusCode,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)

    return NextResponse.json(
      {
        status: "unhealthy",
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : "Unknown error",
        uptime: process.uptime(),
      },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      },
    )
  }
}

async function checkDatabase() {
  const startTime = Date.now()

  try {
    // Check if database directory exists and is writable
    const dbPath = process.env.DATABASE_URL?.replace("sqlite://", "") || "/app/data/aura-focus.db"
    const dbDir = path.dirname(dbPath)

    await fs.access(dbDir, fs.constants.W_OK)

    const responseTime = Date.now() - startTime

    return {
      status: "healthy" as const,
      responseTime,
    }
  } catch (error) {
    return {
      status: "unhealthy" as const,
      error: error instanceof Error ? error.message : "Database check failed",
    }
  }
}

async function checkFilesystem() {
  try {
    // Check if we can write to the data directory
    const dataDir = "/app/data"
    const testFile = path.join(dataDir, ".health-check")

    await fs.writeFile(testFile, "health-check")
    await fs.unlink(testFile)

    return {
      status: "healthy" as const,
    }
  } catch (error) {
    return {
      status: "unhealthy" as const,
      error: error instanceof Error ? error.message : "Filesystem check failed",
    }
  }
}

function checkMemory() {
  const memUsage = process.memoryUsage()
  const maxMemory = 1024 * 1024 * 1024 // 1GB limit

  const status = memUsage.heapUsed > maxMemory * 0.9 ? "unhealthy" : "healthy"

  return {
    status: status as "healthy" | "unhealthy",
    usage: {
      rss: Math.round(memUsage.rss / 1024 / 1024), // MB
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
      external: Math.round(memUsage.external / 1024 / 1024), // MB
    },
  }
}
