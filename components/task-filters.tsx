'use client'

import { TaskFilter } from "@/types"

interface TaskFiltersProps {
  currentFilter: TaskFilter
  onFilterChange: (filter: TaskFilter) => void
}

const FILTERS: TaskFilter[] = ["all", "pending", "completed"]

export function TaskFilters({ currentFilter, onFilterChange }: TaskFiltersProps) {
  return (
    <div className="flex gap-2 mb-6">
      {FILTERS.map((filterType) => (
        <button
          key={filterType}
          onClick={() => onFilterChange(filterType)}
          className={`px-4 py-2 rounded-lg capitalize transition-all duration-200 ${
            currentFilter === filterType
              ? "bg-gradient-to-r from-purple-500 to-blue-500 text-white"
              : "bg-black/20 text-white/60 hover:bg-white/10"
          }`}
        >
          {filterType}
        </button>
      ))}
    </div>
  )
}
