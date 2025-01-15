'use client'

import { useState, useEffect } from 'react'
import { addDoc, collection, doc, updateDoc, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { format } from 'date-fns'

interface TrainingStep {
  description: string
  recommendedDuration: number
}

interface TrainingPlan {
  id?: string
  dogId: string
  trainingType: string
  startDate: Date
  steps: TrainingStep[]
  progressStatus: number
}

interface TrainingPlanFormProps {
  dogId: string
  plan?: TrainingPlan
  onSuccess: () => void
  onCancel: () => void
}

export function TrainingPlanForm({ dogId, plan, onSuccess, onCancel }: TrainingPlanFormProps) {
  const [trainingPlan, setTrainingPlan] = useState<Omit<TrainingPlan, 'id' | 'dogId'>>({
    trainingType: plan?.trainingType || 'Basic Obedience',
    startDate: plan?.startDate || new Date(),
    steps: plan?.steps || [{ description: '', recommendedDuration: 0 }],
    progressStatus: plan?.progressStatus || 0
  })

  useEffect(() => {
    if (plan) {
      setTrainingPlan({
        trainingType: plan.trainingType,
        startDate: new Date(plan.startDate),
        steps: plan.steps,
        progressStatus: plan.progressStatus
      })
    }
  }, [plan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const planData = {
        ...trainingPlan,
        startDate: Timestamp.fromDate(trainingPlan.startDate)
      }

      if (plan?.id) {
        await updateDoc(doc(db, 'trainingPlans', plan.id), planData)
      } else {
        await addDoc(collection(db, 'trainingPlans'), {
          ...planData,
          dogId: doc(db, 'dogs', dogId)
        })
      }
      onSuccess()
    } catch (error) {
      console.error('Error saving training plan:', error)
    }
  }

  const addStep = () => {
    setTrainingPlan({
      ...trainingPlan,
      steps: [...trainingPlan.steps, { description: '', recommendedDuration: 0 }]
    })
  }

  const updateStep = (index: number, field: keyof TrainingStep, value: string | number) => {
    const updatedSteps = trainingPlan.steps.map((step, i) => 
      i === index ? { ...step, [field]: value } : step
    )
    setTrainingPlan({ ...trainingPlan, steps: updatedSteps })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="trainingType">Training Type</Label>
        <Select 
          value={trainingPlan.trainingType} 
          onValueChange={(value: string) => setTrainingPlan({ ...trainingPlan, trainingType: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select training type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Basic Obedience">Basic Obedience</SelectItem>
            <SelectItem value="Leash Training">Leash Training</SelectItem>
            <SelectItem value="Agility">Agility</SelectItem>
            <SelectItem value="Trick Training">Trick Training</SelectItem>
            <SelectItem value="Behavioral Modification">Behavioral Modification</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="startDate">Start Date</Label>
        <Input
          id="startDate"
          type="date"
          value={format(trainingPlan.startDate, "yyyy-MM-dd")}
          onChange={(e) => setTrainingPlan({ ...trainingPlan, startDate: new Date(e.target.value) })}
          required
        />
      </div>
      <div className="space-y-2">
        <Label>Training Steps</Label>
        {trainingPlan.steps.map((step, index) => (
          <div key={index} className="space-y-2 p-2 border rounded">
            <Textarea
              placeholder="Step description"
              value={step.description}
              onChange={(e) => updateStep(index, 'description', e.target.value)}
              required
            />
            <Input
              type="number"
              placeholder="Recommended duration (minutes)"
              value={step.recommendedDuration}
              onChange={(e) => updateStep(index, 'recommendedDuration', parseInt(e.target.value))}
              required
            />
          </div>
        ))}
        <Button type="button" onClick={addStep}>Add Step</Button>
      </div>
      <div className="space-y-2">
        <Label htmlFor="progressStatus">Progress Status (%)</Label>
        <Input
          id="progressStatus"
          type="number"
          min="0"
          max="100"
          value={trainingPlan.progressStatus}
          onChange={(e) => setTrainingPlan({ ...trainingPlan, progressStatus: parseInt(e.target.value) })}
          required
        />
      </div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{plan?.id ? 'Update' : 'Add'} Training Plan</Button>
      </div>
    </form>
  )
}

