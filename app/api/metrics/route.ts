import { NextResponse } from "next/server"
import os from "os"

interface Metrics {
  timestamp: string
  uptime: number
  memory: {
    rss: number
    heapTotal: number
    heapUsed: number
    external: number
  }
  process: {
    pid: number
    version: string
    platform: string
    arch: string
  }
  system: {
    loadavg: number[]
    cpus: number
  }
  custom: {
    active_users?: number
    database_connections?: number
    cache_hit_rate?: number
  }
}

export async function GET() {
  try {
    const memUsage = process.memoryUsage()
    const loadAvg = process.platform !== "win32" ? os.loadavg() : [0, 0, 0]
    const cpus = os.cpus().length

    const metrics: Metrics = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: {
        rss: memUsage.rss,
        heapTotal: memUsage.heapTotal,
        heapUsed: memUsage.heapUsed,
        external: memUsage.external,
      },
      process: {
        pid: process.pid,
        version: process.version,
        platform: process.platform,
        arch: process.arch,
      },
      system: {
        loadavg: loadAvg,
        cpus: cpus,
      },
      custom: {
        // Add custom application metrics here
        active_users: 0, // TODO: Implement user tracking
        database_connections: 1, // TODO: Get actual DB connection count
        cache_hit_rate: 0.95, // TODO: Implement cache metrics
      },
    }

    // Convert to Prometheus format if requested
    const acceptHeader = headers().get("accept") || ""
    if (acceptHeader.includes("text/plain")) {
      const prometheusMetrics = convertToPrometheusFormat(metrics)
      return new Response(prometheusMetrics, {
        headers: {
          "Content-Type": "text/plain; version=0.0.4",
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      })
    }

    return NextResponse.json(metrics, {
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    })
  } catch (error) {
    console.error("Metrics collection failed:", error)

    return NextResponse.json(
      {
        error: "Failed to collect metrics",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
        },
      },
    )
  }
}

function convertToPrometheusFormat(metrics: Metrics): string {
  const lines: string[] = []

  // Process uptime
  lines.push("# HELP process_uptime_seconds Process uptime in seconds")
  lines.push("# TYPE process_uptime_seconds counter")
  lines.push(`process_uptime_seconds ${metrics.uptime}`)

  // Memory metrics
  lines.push("# HELP process_memory_rss_bytes Resident Set Size memory in bytes")
  lines.push("# TYPE process_memory_rss_bytes gauge")
  lines.push(`process_memory_rss_bytes ${metrics.memory.rss}`)

  lines.push("# HELP process_memory_heap_total_bytes Total heap memory in bytes")
  lines.push("# TYPE process_memory_heap_total_bytes gauge")
  lines.push(`process_memory_heap_total_bytes ${metrics.memory.heapTotal}`)

  lines.push("# HELP process_memory_heap_used_bytes Used heap memory in bytes")
  lines.push("# TYPE process_memory_heap_used_bytes gauge")
  lines.push(`process_memory_heap_used_bytes ${metrics.memory.heapUsed}`)

  // System metrics
  lines.push("# HELP system_cpu_count Number of CPU cores")
  lines.push("# TYPE system_cpu_count gauge")
  lines.push(`system_cpu_count ${metrics.system.cpus}`)

  if (metrics.system.loadavg.length > 0) {
    lines.push("# HELP system_load_average_1m System load average over 1 minute")
    lines.push("# TYPE system_load_average_1m gauge")
    lines.push(`system_load_average_1m ${metrics.system.loadavg[0]}`)
  }

  // Custom application metrics
  if (metrics.custom.active_users !== undefined) {
    lines.push("# HELP app_active_users Number of active users")
    lines.push("# TYPE app_active_users gauge")
    lines.push(`app_active_users ${metrics.custom.active_users}`)
  }

  if (metrics.custom.database_connections !== undefined) {
    lines.push("# HELP app_database_connections Number of database connections")
    lines.push("# TYPE app_database_connections gauge")
    lines.push(`app_database_connections ${metrics.custom.database_connections}`)
  }

  if (metrics.custom.cache_hit_rate !== undefined) {
    lines.push("# HELP app_cache_hit_rate Cache hit rate ratio")
    lines.push("# TYPE app_cache_hit_rate gauge")
    lines.push(`app_cache_hit_rate ${metrics.custom.cache_hit_rate}`)
  }

  return lines.join("\n") + "\n"
}

// Import headers function
function headers() {
  // This is a mock implementation - in real Next.js this would be imported from 'next/headers'
  return {
    get: (name: string) => null,
  }
}
