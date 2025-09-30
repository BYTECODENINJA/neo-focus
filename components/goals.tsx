"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Switch } from "@/components/ui/switch"
import { Plus, Target, Trophy, Calendar, Edit, Trash2, CheckCircle2, Flag, TrendingUp } from "lucide-react"

interface Milestone {
  id: string
  name: string
  completed: boolean
  createdAt: string
}

interface Goal {
  id: string
  title: string
  description: string
  category: string
  targetValue: number
  currentValue: number
  unit: string
  completed: boolean
  hasMilestones: boolean
  milestones: Milestone[]
  dueDate?: string
  createdAt: string
  updatedAt: string
}

const categories = [
  { value: "personal", label: "Personal", color: "#8b5cf6" },
  { value: "professional", label: "Professional", color: "#3b82f6" },
  { value: "health", label: "Health", color: "#10b981" },
  { value: "learning", label: "Learning", color: "#f59e0b" },
  { value: "financial", label: "Financial", color: "#ef4444" },
  { value: "creative", label: "Creative", color: "#ec4899" },
  { value: "social", label: "Social", color: "#06b6d4" },
]

export default function Goals() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)
  const [showNewGoalDialog, setShowNewGoalDialog] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [filterCategory, setFilterCategory] = useState<string>("all")
  const [filterStatus, setFilterStatus] = useState<string>("all")

  // Form state
  const [goalForm, setGoalForm] = useState({
    title: "",
    description: "",
    category: "personal",
    targetValue: 1,
    unit: "",
    hasMilestones: false,
    milestones: [] as string[],
    dueDate: "",
  })

  const [newMilestone, setNewMilestone] = useState("")

  useEffect(() => {
    loadGoals()
  }, [])

  const loadGoals = () => {
    const saved = localStorage.getItem("aura-goals")
    if (saved) {
      const parsedGoals = JSON.parse(saved)
      setGoals(
        parsedGoals.sort((a: Goal, b: Goal) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()),
      )
    }
  }

  const saveGoals = (updatedGoals: Goal[]) => {
    const sortedGoals = updatedGoals.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    localStorage.setItem("aura-goals", JSON.stringify(sortedGoals))
    setGoals(sortedGoals)
  }

  const createGoal = () => {
    if (!goalForm.title.trim()) return

    const milestones: Milestone[] = goalForm.hasMilestones
      ? goalForm.milestones
          .filter((m) => m.trim())
          .map((name) => ({
            id: Date.now().toString() + Math.random(),
            name: name.trim(),
            completed: false,
            createdAt: new Date().toISOString(),
          }))
      : []

    const newGoal: Goal = {
      id: Date.now().toString(),
      title: goalForm.title,
      description: goalForm.description,
      category: goalForm.category,
      targetValue: goalForm.targetValue,
      currentValue: 0,
      unit: goalForm.unit,
      completed: false,
      hasMilestones: goalForm.hasMilestones,
      milestones,
      dueDate: goalForm.dueDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const updatedGoals = [newGoal, ...goals]
    saveGoals(updatedGoals)
    setSelectedGoal(newGoal)
    resetForm()
    setShowNewGoalDialog(false)
  }

  const updateGoal = () => {
    if (!editingGoal || !goalForm.title.trim()) return

    const milestones: Milestone[] = goalForm.hasMilestones
      ? [
          ...editingGoal.milestones.filter((m) => m.id), // Keep existing milestones
          ...goalForm.milestones
            .filter((m) => m.trim())
            .map((name) => ({
              id: Date.now().toString() + Math.random(),
              name: name.trim(),
              completed: false,
              createdAt: new Date().toISOString(),
            })),
        ]
      : []

    const updatedGoal: Goal = {
      ...editingGoal,
      title: goalForm.title,
      description: goalForm.description,
      category: goalForm.category,
      targetValue: goalForm.targetValue,
      unit: goalForm.unit,
      hasMilestones: goalForm.hasMilestones,
      milestones,
      dueDate: goalForm.dueDate || undefined,
      updatedAt: new Date().toISOString(),
    }

    const updatedGoals = goals.map((goal) => (goal.id === editingGoal.id ? updatedGoal : goal))
    saveGoals(updatedGoals)
    setSelectedGoal(updatedGoal)
    setEditingGoal(null)
    resetForm()
  }

  const deleteGoal = (goalId: string) => {
    const updatedGoals = goals.filter((goal) => goal.id !== goalId)
    saveGoals(updatedGoals)
    if (selectedGoal?.id === goalId) {
      setSelectedGoal(null)
    }
  }

  const updateProgress = (goalId: string, newValue: number) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === goalId) {
        const completed = newValue >= goal.targetValue
        return {
          ...goal,
          currentValue: Math.min(newValue, goal.targetValue),
          completed,
          updatedAt: new Date().toISOString(),
        }
      }
      return goal
    })
    saveGoals(updatedGoals)

    if (selectedGoal?.id === goalId) {
      const updatedGoal = updatedGoals.find((g) => g.id === goalId)
      if (updatedGoal) setSelectedGoal(updatedGoal)
    }
  }

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    const updatedGoals = goals.map((goal) => {
      if (goal.id === goalId) {
        const updatedMilestones = goal.milestones.map((milestone) =>
          milestone.id === milestoneId ? { ...milestone, completed: !milestone.completed } : milestone,
        )
        return {
          ...goal,
          milestones: updatedMilestones,
          updatedAt: new Date().toISOString(),
        }
      }
      return goal
    })
    saveGoals(updatedGoals)

    if (selectedGoal?.id === goalId) {
      const updatedGoal = updatedGoals.find((g) => g.id === goalId)
      if (updatedGoal) setSelectedGoal(updatedGoal)
    }
  }

  const addMilestone = () => {
    if (!newMilestone.trim()) return

    setGoalForm((prev) => ({
      ...prev,
      milestones: [...prev.milestones, newMilestone.trim()],
    }))
    setNewMilestone("")
  }

  const removeMilestone = (index: number) => {
    setGoalForm((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((_, i) => i !== index),
    }))
  }

  const startEditing = (goal: Goal) => {
    setEditingGoal(goal)
    setGoalForm({
      title: goal.title,
      description: goal.description,
      category: goal.category,
      targetValue: goal.targetValue,
      unit: goal.unit,
      hasMilestones: goal.hasMilestones,
      milestones: [], // Only show new milestones in form
      dueDate: goal.dueDate || "",
    })
  }

  const resetForm = () => {
    setGoalForm({
      title: "",
      description: "",
      category: "personal",
      targetValue: 1,
      unit: "",
      hasMilestones: false,
      milestones: [],
      dueDate: "",
    })
    setNewMilestone("")
    setEditingGoal(null)
  }

  const getCategoryData = (category: string) => {
    return categories.find((cat) => cat.value === category) || categories[0]
  }

  const getProgressPercentage = (goal: Goal) => {
    if (goal.hasMilestones && goal.milestones.length > 0) {
      const completedMilestones = goal.milestones.filter((m) => m.completed).length
      return (completedMilestones / goal.milestones.length) * 100
    }
    return (goal.currentValue / goal.targetValue) * 100
  }

  const filteredGoals = goals.filter((goal) => {
    const matchesCategory = filterCategory === "all" || goal.category === filterCategory
    const matchesStatus =
      filterStatus === "all" ||
      (filterStatus === "completed" && goal.completed) ||
      (filterStatus === "active" && !goal.completed)
    return matchesCategory && matchesStatus
  })

  const completedGoals = goals.filter((g) => g.completed).length
  const totalGoals = goals.length

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6" />
            Goals
          </h1>
          <p className="text-muted-foreground">Track your progress and achieve your dreams</p>
        </div>

        <Dialog open={showNewGoalDialog} onOpenChange={setShowNewGoalDialog}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Goal
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Goal title"
                value={goalForm.title}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, title: e.target.value }))}
              />

              <Textarea
                placeholder="Goal description"
                value={goalForm.description}
                onChange={(e) => setGoalForm((prev) => ({ ...prev, description: e.target.value }))}
                rows={3}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select
                    value={goalForm.category}
                    onValueChange={(value) => setGoalForm((prev) => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                            {category.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Due Date (optional)</label>
                  <Input
                    type="date"
                    value={goalForm.dueDate}
                    onChange={(e) => setGoalForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Target Value</label>
                  <Input
                    type="number"
                    min="1"
                    value={goalForm.targetValue}
                    onChange={(e) =>
                      setGoalForm((prev) => ({ ...prev, targetValue: Number.parseInt(e.target.value) || 1 }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Unit (optional)</label>
                  <Input
                    placeholder="e.g., books, hours, kg"
                    value={goalForm.unit}
                    onChange={(e) => setGoalForm((prev) => ({ ...prev, unit: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="milestones"
                  checked={goalForm.hasMilestones}
                  onCheckedChange={(checked) => setGoalForm((prev) => ({ ...prev, hasMilestones: checked }))}
                />
                <label htmlFor="milestones" className="text-sm font-medium">
                  Track with milestones instead of numeric progress
                </label>
              </div>

              {goalForm.hasMilestones && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Milestones</label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add milestone"
                      value={newMilestone}
                      onChange={(e) => setNewMilestone(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          addMilestone()
                        }
                      }}
                    />
                    <Button type="button" onClick={addMilestone} disabled={!newMilestone.trim()}>
                      Add
                    </Button>
                  </div>

                  {goalForm.milestones.length > 0 && (
                    <div className="space-y-2">
                      {goalForm.milestones.map((milestone, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                          <span className="text-sm">{milestone}</span>
                          <Button type="button" variant="ghost" size="sm" onClick={() => removeMilestone(index)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                <Button onClick={createGoal} disabled={!goalForm.title.trim()}>
                  Create Goal
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewGoalDialog(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{totalGoals}</div>
            <div className="text-sm text-muted-foreground">Total Goals</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{completedGoals}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{totalGoals - completedGoals}</div>
            <div className="text-sm text-muted-foreground">In Progress</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">
              {totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0}%
            </div>
            <div className="text-sm text-muted-foreground">Success Rate</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                  {category.label}
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Goals</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGoals.map((goal) => {
          const categoryData = getCategoryData(goal.category)
          const progress = getProgressPercentage(goal)

          return (
            <Card
              key={goal.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                goal.completed ? "ring-2 ring-green-500" : ""
              }`}
              onClick={() => setSelectedGoal(goal)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: categoryData.color }} />
                      <Badge variant="secondary" className="text-xs">
                        {categoryData.label}
                      </Badge>
                      {goal.completed && <Trophy className="h-4 w-4 text-yellow-500" />}
                    </div>
                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                    {goal.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{goal.description}</p>
                    )}
                  </div>

                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        startEditing(goal)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteGoal(goal.id)
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Progress */}
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>Progress</span>
                      <span className="font-medium">{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  {/* Progress Details */}
                  {goal.hasMilestones ? (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        {goal.milestones.filter((m) => m.completed).length} of {goal.milestones.length} milestones
                        completed
                      </div>
                      <div className="space-y-1 max-h-20 overflow-y-auto">
                        {goal.milestones.slice(0, 3).map((milestone) => (
                          <div key={milestone.id} className="flex items-center gap-2 text-sm">
                            <Checkbox
                              checked={milestone.completed}
                              onCheckedChange={() => toggleMilestone(goal.id, milestone.id)}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <span className={milestone.completed ? "line-through text-muted-foreground" : ""}>
                              {milestone.name}
                            </span>
                          </div>
                        ))}
                        {goal.milestones.length > 3 && (
                          <div className="text-xs text-muted-foreground">
                            +{goal.milestones.length - 3} more milestones
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min="0"
                          max={goal.targetValue}
                          value={goal.currentValue}
                          onChange={(e) => updateProgress(goal.id, Number.parseInt(e.target.value) || 0)}
                          onClick={(e) => e.stopPropagation()}
                          className="w-20 h-8 text-sm"
                        />
                        <span className="text-sm text-muted-foreground">
                          / {goal.targetValue} {goal.unit}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Due Date */}
                  {goal.dueDate && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Due: {new Date(goal.dueDate).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}

        {filteredGoals.length === 0 && (
          <div className="col-span-full text-center text-muted-foreground py-12">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No goals found</p>
            <p className="text-sm">
              {goals.length === 0
                ? "Create your first goal to get started!"
                : "Try adjusting your filters or create a new goal."}
            </p>
          </div>
        )}
      </div>

      {/* Goal Detail Dialog */}
      <Dialog open={!!selectedGoal} onOpenChange={(open) => !open && setSelectedGoal(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selectedGoal && (
            <>
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: getCategoryData(selectedGoal.category).color }}
                    />
                    <DialogTitle>{selectedGoal.title}</DialogTitle>
                    {selectedGoal.completed && <Trophy className="h-5 w-5 text-yellow-500" />}
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-6">
                {selectedGoal.description && <p className="text-muted-foreground">{selectedGoal.description}</p>}

                {/* Progress Overview */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Progress</h3>
                    <Badge variant={selectedGoal.completed ? "default" : "secondary"}>
                      {selectedGoal.completed ? "Completed" : "In Progress"}
                    </Badge>
                  </div>

                  <Progress value={getProgressPercentage(selectedGoal)} className="h-3" />

                  <div className="text-sm text-muted-foreground text-center">
                    {Math.round(getProgressPercentage(selectedGoal))}% Complete
                  </div>
                </div>

                {/* Milestones or Numeric Progress */}
                {selectedGoal.hasMilestones ? (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Flag className="h-4 w-4" />
                      Milestones ({selectedGoal.milestones.filter((m) => m.completed).length}/
                      {selectedGoal.milestones.length})
                    </h3>

                    <ScrollArea className="h-48">
                      <div className="space-y-2">
                        {selectedGoal.milestones.map((milestone) => (
                          <div key={milestone.id} className="flex items-center gap-3 p-2 rounded border">
                            <Checkbox
                              checked={milestone.completed}
                              onCheckedChange={() => toggleMilestone(selectedGoal.id, milestone.id)}
                            />
                            <span
                              className={`flex-1 ${milestone.completed ? "line-through text-muted-foreground" : ""}`}
                            >
                              {milestone.name}
                            </span>
                            {milestone.completed && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      Numeric Progress
                    </h3>

                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-sm font-medium">Current:</label>
                        <Input
                          type="number"
                          min="0"
                          max={selectedGoal.targetValue}
                          value={selectedGoal.currentValue}
                          onChange={(e) => updateProgress(selectedGoal.id, Number.parseInt(e.target.value) || 0)}
                          className="w-24"
                        />
                      </div>
                      <div className="text-sm text-muted-foreground">
                        / {selectedGoal.targetValue} {selectedGoal.unit}
                      </div>
                    </div>
                  </div>
                )}

                {/* Goal Info */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Category</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: getCategoryData(selectedGoal.category).color }}
                      />
                      {getCategoryData(selectedGoal.category).label}
                    </div>
                  </div>

                  {selectedGoal.dueDate && (
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Due Date</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(selectedGoal.dueDate).toLocaleDateString()}
                      </div>
                    </div>
                  )}

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Created</div>
                    <div className="mt-1">{new Date(selectedGoal.createdAt).toLocaleDateString()}</div>
                  </div>

                  <div>
                    <div className="text-sm font-medium text-muted-foreground">Last Updated</div>
                    <div className="mt-1">{new Date(selectedGoal.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={!!editingGoal} onOpenChange={(open) => !open && resetForm()}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Goal title"
              value={goalForm.title}
              onChange={(e) => setGoalForm((prev) => ({ ...prev, title: e.target.value }))}
            />

            <Textarea
              placeholder="Goal description"
              value={goalForm.description}
              onChange={(e) => setGoalForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
            />

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select
                  value={goalForm.category}
                  onValueChange={(value) => setGoalForm((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                          {category.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Due Date (optional)</label>
                <Input
                  type="date"
                  value={goalForm.dueDate}
                  onChange={(e) => setGoalForm((prev) => ({ ...prev, dueDate: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Target Value</label>
                <Input
                  type="number"
                  min="1"
                  value={goalForm.targetValue}
                  onChange={(e) =>
                    setGoalForm((prev) => ({ ...prev, targetValue: Number.parseInt(e.target.value) || 1 }))
                  }
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Unit (optional)</label>
                <Input
                  placeholder="e.g., books, hours, kg"
                  value={goalForm.unit}
                  onChange={(e) => setGoalForm((prev) => ({ ...prev, unit: e.target.value }))}
                />
              </div>
            </div>

            {editingGoal && editingGoal.hasMilestones && (
              <div className="space-y-3">
                <h3 className="font-semibold">Add New Milestones</h3>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add milestone"
                    value={newMilestone}
                    onChange={(e) => setNewMilestone(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addMilestone()
                      }
                    }}
                  />
                  <Button type="button" onClick={addMilestone} disabled={!newMilestone.trim()}>
                    Add
                  </Button>
                </div>

                {goalForm.milestones.length > 0 && (
                  <div className="space-y-2">
                    {goalForm.milestones.map((milestone, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                        <span className="text-sm">{milestone}</span>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeMilestone(index)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={updateGoal} disabled={!goalForm.title.trim()}>
                Update Goal
              </Button>
              <Button variant="outline" onClick={resetForm}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
