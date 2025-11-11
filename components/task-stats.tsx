'use client'

interface TaskStatsProps {
  total: number
  pending: number
  completed: number
}

export function TaskStats({ total, pending, completed }: TaskStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-4">
        <h3 className="text-white/60 text-sm">Total Tasks</h3>
        <p className="text-2xl font-bold">{total}</p>
      </div>
      <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-4">
        <h3 className="text-white/60 text-sm">Pending</h3>
        <p className="text-2xl font-bold text-yellow-400">{pending}</p>
      </div>
      <div className="bg-black/20 backdrop-blur-lg rounded-xl border border-white/10 p-4">
        <h3 className="text-white/60 text-sm">Completed</h3>
        <p className="text-2xl font-bold text-green-400">{completed}</p>
      </div>
    </div>
  )
}
