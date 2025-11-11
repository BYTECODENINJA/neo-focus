'use client'

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Target, Calendar, Trash2, CheckCircle, Trophy, TrendingUp, Edit, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import confetti from "canvas-confetti"
import { useAchievements } from "@/contexts/achievement-context"

import { Goal, Milestone } from "@/types"

// ... (interface definitions remain the same)
interface GoalsProps {
    goals: Goal[]
    setGoals: (goals: Goal[]) => void
    achievements: any[]
    setAchievements: (achievements: any[]) => void
  }

export function Goals({ goals, setGoals, achievements, setAchievements }: GoalsProps) {
  const [showAddGoal, setShowAddGoal] = useState(false)
  const [showEditGoal, setShowEditGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [filter, setFilter] = useState<"all" | "daily" | "weekly" | "monthly" | "yearly">("all")
  const [newGoal, setNewGoal] = useState<Partial<Goal>>({
    title: "",
    description: "",
    type: "daily",
    trackingMethod: "units",
    targetValue: 1,
    unit: "",
    category: "personal",
    deadline: "",
    milestones: [],
  })
  const [newMilestone, setNewMilestone] = useState("")

  const { addAchievement } = useAchievements()

  // ... (useEffect for resetting goals remains the same)

  const filteredGoals = goals.filter((goal) => {
    if (filter === "all") return true
    return goal.type === filter
  })

  const addMilestone = () => {
    if (newMilestone.trim() === "") return
    const milestone: Milestone = { id: Date.now().toString(), name: newMilestone, completed: false };
    
    if (editingGoal) {
        setEditingGoal({
            ...editingGoal,
            milestones: [...(editingGoal.milestones || []), milestone]
        });
    } else {
        setNewGoal({ ...newGoal, milestones: [...(newGoal.milestones || []), milestone] });
    }
    setNewMilestone("");
  };

  const removeMilestone = (milestoneId: string) => {
    if (editingGoal) {
        setEditingGoal({
            ...editingGoal,
            milestones: editingGoal.milestones?.filter(m => m.id !== milestoneId)
        });
    } else {
        setNewGoal({ ...newGoal, milestones: newGoal.milestones?.filter(m => m.id !== milestoneId) });
    }
  };

  const addGoal = () => {
    if (!newGoal.title) return

    const goalToAdd: Goal = {
      id: Date.now().toString(),
      title: newGoal.title,
      description: newGoal.description || "",
      type: newGoal.type || "daily",
      trackingMethod: newGoal.trackingMethod || "simple",
      targetValue: newGoal.trackingMethod === 'units' ? newGoal.targetValue : newGoal.trackingMethod === 'milestones' ? newGoal.milestones?.length : 1,
      currentValue: 0,
      unit: newGoal.trackingMethod === 'units' ? newGoal.unit : "",
      milestones: newGoal.trackingMethod === 'milestones' ? newGoal.milestones : [],
      category: newGoal.category || "personal",
      deadline: newGoal.deadline || "",
      completed: false,
      createdAt: new Date().toISOString(),
      lastReset: new Date().toISOString(),
    }
    setGoals([goalToAdd, ...goals])
    setNewGoal({ title: "", description: "", type: "daily", trackingMethod: "units", targetValue: 1, unit: "", category: "personal", deadline: "", milestones: [] });
    setShowAddGoal(false)
  }

  const updateGoal = () => {
    if (!editingGoal) return;

    const updatedGoal = {
        ...editingGoal,
        targetValue: editingGoal.trackingMethod === 'milestones' ? editingGoal.milestones?.length : editingGoal.targetValue
    }

    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
    setShowEditGoal(false);
    setEditingGoal(null);
  };

  const toggleMilestone = (goalId: string, milestoneId: string) => {
    setGoals(goals.map(goal => {
        if (goal.id === goalId) {
            const updatedMilestones = goal.milestones?.map(m => m.id === milestoneId ? { ...m, completed: !m.completed } : m);
            const completedMilestones = updatedMilestones?.filter(m => m.completed).length || 0;
            const isCompleted = completedMilestones === goal.targetValue;

            if (isCompleted && !goal.completed) {
                triggerCelebration();
                addAchievement({ createdAt: new Date().toISOString(), type: "goal_completed", title: "Goal Achieved!", description: `Completed "${goal.title}"`, icon: "🎯" });
            }

            return { ...goal, milestones: updatedMilestones, currentValue: completedMilestones, completed: isCompleted };
        }
        return goal;
    }));
  };

  const markSimpleGoalComplete = (goalId: string) => {
      setGoals(goals.map(goal => {
          if(goal.id === goalId) {
              if(!goal.completed) {
                triggerCelebration();
                addAchievement({ createdAt: new Date().toISOString(), type: "goal_completed", title: "Goal Achieved!", description: `Completed "${goal.title}"`, icon: "🎯" });
              }
              return {...goal, completed: !goal.completed, currentValue: !goal.completed ? 1 : 0}
          }
          return goal;
      }))
  }

  const triggerCelebration = () => {
    confetti({
      particleCount: 200,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"],
    });
  }
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "health": return "text-green-400 bg-green-400/10";
      case "career": return "text-blue-400 bg-blue-400/10";
      case "personal": return "text-purple-400 bg-purple-400/10";
      case "finance": return "text-yellow-400 bg-yellow-400/10";
      case "learning": return "text-orange-400 bg-orange-400/10";
      default: return "text-gray-400 bg-gray-400/10";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "health": return "💪";
      case "career": return "💼";
      case "personal": return "🎯";
      case "finance": return "💰";
      case "learning": return "📚";
      default: return "📋";
    }
  };


  // ... (other functions like updateGoalProgress, deleteGoal, getProgressPercentage, etc. remain mostly the same but might need slight adjustments)
  const updateGoalProgress = (goalId: string, newValue: number) => {
    setGoals(
      goals.map((goal) => {
        if (goal.id === goalId) {
          const completed = newValue >= goal.targetValue!;
          const wasCompleted = goal.completed;

          if (completed && !wasCompleted) {
            triggerCelebration()

            addAchievement({
              createdAt: new Date().toISOString(),
              type: "goal_completed",
              title: "Goal Achieved!",
              description: `Completed "${goal.title}"`,
              icon: "🎯",
            })
          }

          return { ...goal, currentValue: Math.min(newValue, goal.targetValue!), completed };
        }
        return goal;
      }),
    );
  };
  const deleteGoal = (goalId: string) => {
    setGoals(goals.filter((goal) => goal.id !== goalId));
  };
  const getProgressPercentage = (goal: Goal) => {
    if (goal.trackingMethod === 'simple') {
        return goal.completed ? 100 : 0;
    }
    return Math.min(((goal.currentValue || 0) / (goal.targetValue || 1)) * 100, 100);
  };

  const renderGoalForm = () => {
    const isEditing = !!editingGoal;
    const goalData = isEditing ? editingGoal : newGoal;
    const setGoalData = isEditing ? setEditingGoal as any : setNewGoal;

    return (
        <div className="space-y-4">
            <input type="text" placeholder="Goal title" value={goalData.title} onChange={(e) => setGoalData({ ...goalData, title: e.target.value })} className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50" />
            <textarea placeholder="Goal description (optional)" value={goalData.description} onChange={(e) => setGoalData({ ...goalData, description: e.target.value })} className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50 h-20 resize-none" />
            
            <div className="grid grid-cols-2 gap-2">
                 <select value={goalData.type} onChange={(e) => setGoalData({ ...goalData, type: e.target.value as any })} className="p-3 rounded-xl bg-black/20 border border-white/10 text-white">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                </select>
                 <select value={goalData.category} onChange={(e) => setGoalData({ ...goalData, category: e.target.value as any })} className="p-3 rounded-xl bg-black/20 border border-white/10 text-white">
                    <option value="health">💪 Health</option>
                    <option value="career">💼 Career</option>
                    <option value="personal">🎯 Personal</option>
                    <option value="finance">💰 Finance</option>
                    <option value="learning">📚 Learning</option>
                    <option value="other">📋 Other</option>
                </select>
            </div>

            <select value={goalData.trackingMethod} onChange={(e) => setGoalData({ ...goalData, trackingMethod: e.target.value as any })} className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white">
                <option value="units">Track with Units</option>
                <option value="milestones">Track with Milestones</option>
                <option value="simple">Simple Goal</option>
            </select>

            {goalData.trackingMethod === 'units' && (
                <div className="grid grid-cols-2 gap-2">
                    <input type="number" min="1" placeholder="Target value" value={goalData.targetValue} onChange={(e) => setGoalData({ ...goalData, targetValue: Number(e.target.value) })} className="p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50" />
                    <input type="text" placeholder="Unit (e.g., hours, books)" value={goalData.unit} onChange={(e) => setGoalData({ ...goalData, unit: e.target.value })} className="p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50" />
                </div>
            )}

            {goalData.trackingMethod === 'milestones' && (
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <input type="text" placeholder="New milestone" value={newMilestone} onChange={(e) => setNewMilestone(e.target.value)} className="flex-1 p-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder-white/50" />
                        <Button onClick={addMilestone}>Add</Button>
                    </div>
                    <div className="space-y-1">
                        {goalData.milestones?.map(m => (
                            <div key={m.id} className="flex items-center justify-between bg-black/10 p-2 rounded">
                                <span>{m.name}</span>
                                <Button size="icon" variant="ghost" onClick={() => removeMilestone(m.id)}><Trash2 size={14} /></Button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <input type="date" value={goalData.deadline} onChange={(e) => setGoalData({ ...goalData, deadline: e.target.value })} className="w-full p-3 rounded-xl bg-black/20 border border-white/10 text-white" />
        </div>
    );
  };

  const renderGoalProgress = (goal: Goal) => {
    switch (goal.trackingMethod) {
      case 'units':
        return (
          <>
            <div className="mb-3">
                <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60 flex items-center gap-1"><TrendingUp size={14} />Progress</span>
                    <span className="text-white/80">{goal.currentValue} / {goal.targetValue} {goal.unit}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-3">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${getProgressPercentage(goal)}%` }} className={`h-3 rounded-full ${goal.completed ? "bg-green-500" : "bg-gradient-to-r from-purple-500 to-blue-500"}`} />
                </div>
                <div className="text-xs text-white/50 mt-1">{Math.round(getProgressPercentage(goal))}% complete</div>
            </div>
            {!goal.completed && (
                <div className="flex items-center gap-2">
                    <input type="number" min="0" max={goal.targetValue} value={goal.currentValue} onChange={(e) => updateGoalProgress(goal.id, Number(e.target.value))} className="w-20 p-2 rounded-lg bg-black/20 border border-white/10 text-white text-sm" />
                    <Button onClick={() => updateGoalProgress(goal.id, (goal.currentValue || 0) + 1)} size="sm" variant="outline" disabled={(goal.currentValue || 0) >= (goal.targetValue || 0)} >+1</Button>
                </div>
            )}
          </>
        );
      case 'milestones':
        return (
            <Collapsible>
                <CollapsibleTrigger className="w-full flex justify-between items-center text-sm text-white/60 mb-2">
                    <span><TrendingUp size={14} className="inline mr-1"/>Milestones</span>
                    <ChevronDown size={16} />
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2">
                    {goal.milestones?.map(m => (
                        <div key={m.id} className="flex items-center gap-2">
                            <Checkbox id={`milestone-${m.id}`} checked={m.completed} onCheckedChange={() => toggleMilestone(goal.id, m.id)} />
                            <label htmlFor={`milestone-${m.id}`} className={`${m.completed ? 'line-through text-white/50' : ''}`}>{m.name}</label>
                        </div>
                    ))}
                </CollapsibleContent>
            </Collapsible>
        );
      case 'simple':
        return (
            <Button onClick={() => markSimpleGoalComplete(goal.id)} className={`w-full ${goal.completed ? 'bg-green-600' : 'bg-blue-600'}`}><CheckCircle size={14} className="mr-2"/>{goal.completed ? 'Completed' : 'Mark as Complete'}</Button>
        );
      default:
        return null;
    }
  }

  // ... (main return with JSX, updated to use renderGoalProgress)
  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
         <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
        <h1 className="text-4xl font-bold">Goals</h1>
        <Button onClick={() => setShowAddGoal(true)} className="bg-gradient-to-r from-purple-500 to-blue-500">
          <Plus size={20} className="mr-2" />
          Add Goal
        </Button>
      </motion.div>
      {/* ... other components */}
      <div className="flex-1 bg-black/20 backdrop-blur-lg rounded-2xl border border-white/10 p-6 overflow-hidden">
        <div className="h-full overflow-y-auto space-y-4 pr-2">
      <AnimatePresence>
        {filteredGoals.map((goal, index) => (
          <motion.div key={goal.id} /* ... motion props */ className={`p-4 rounded-xl border transition-all duration-200 ${
            goal.completed ? "bg-green-500/10 border-green-500/20" : "bg-white/5 border-white/10 hover:bg-white/10" 
          }`}>
            {/* Goal header */}
            <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">{getCategoryIcon(goal.category)}</span>
                      <h3 className={`font-bold ${goal.completed ? "line-through text-white/60" : ""}`}>{goal.title}</h3>
                      <span className={`px-2 py-1 rounded text-xs ${getCategoryColor(goal.category)}`}>{goal.category}</span>
                      <span className="px-2 py-1 rounded text-xs bg-white/10 text-white/60">{goal.type}</span>
                      {goal.completed && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-1 bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs"><Trophy size={12} />Completed</motion.div>}
                    </div>
                    {goal.description && <p className={`text-sm mb-2 ${goal.completed ? "text-white/40" : "text-white/60"}`}>{goal.description}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => { setEditingGoal(goal); setShowEditGoal(true); }} className="text-white/40 hover:text-blue-400 transition-colors duration-200"><Edit size={16} /></button>
                    <button onClick={() => deleteGoal(goal.id)} className="text-white/40 hover:text-red-400 transition-colors duration-200"><Trash2 size={16} /></button>
                  </div>
                </div>
            
            {renderGoalProgress(goal)}

            {goal.deadline && <div className="flex items-center gap-1 text-xs text-white/50 mt-2"><Calendar size={12} /><span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span></div>}
          </motion.div>
        ))}
      </AnimatePresence>
      </div>
      </div>

      <AnimatePresence>
        {(showAddGoal || showEditGoal) && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 rounded-2xl border border-white/20 w-96 max-h-[90vh] overflow-y--auto">
              <h3 className="text-xl font-bold mb-4">{showEditGoal ? "Edit Goal" : "Add New Goal"}</h3>
              {renderGoalForm()}
              <div className="flex gap-2 mt-4">
                <Button onClick={showEditGoal ? updateGoal : addGoal} className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500">{showEditGoal ? "Save Changes" : "Add Goal"}</Button>
                <Button onClick={() => { setShowAddGoal(false); setShowEditGoal(false); setEditingGoal(null); }} variant="outline" className="flex-1">Cancel</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
