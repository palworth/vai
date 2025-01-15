'use client'

import { useState, useEffect, useCallback } from 'react'
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { format } from 'date-fns'
import { TrainingPlanForm } from '@/app/components/TrainingPlanForm'

interface TrainingStep {
  description: string
  recommendedDuration: number
}

interface TrainingPlan {
  id: string
  dogId: string
  trainingType: string
  startDate: Date
  steps: TrainingStep[]
  progressStatus: number
}

interface TrainingPlansSectionProps {
  dogId: string
  showToast: (title: string, description: string, isError: boolean) => void
}

export function TrainingPlansSection({ dogId, showToast }: TrainingPlansSectionProps) {
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([])
  const [showTrainingPlanForm, setShowTrainingPlanForm] = useState(false)
  const [editingTrainingPlan, setEditingTrainingPlan] = useState<TrainingPlan | null>(null)

  const fetchTrainingPlans = useCallback(async () => {
    const dogRef = doc(db, 'dogs', dogId)
    const trainingPlansQuery = query(collection(db, 'trainingPlans'), where('dogId', '==', dogRef))
    const querySnapshot = await getDocs(trainingPlansQuery)
    const plansData = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      dogId: dogId,
      startDate: doc.data().startDate.toDate()
    } as TrainingPlan))
    setTrainingPlans(plansData)
  }, [dogId])

  useEffect(() => {
    fetchTrainingPlans()
  }, [fetchTrainingPlans])

  const handleEditTrainingPlan = (plan: TrainingPlan) => {
    setEditingTrainingPlan(plan)
    setShowTrainingPlanForm(true)
  }

  const handleDeleteTrainingPlan = async (planId: string) => {
    try {
      await deleteDoc(doc(db, 'trainingPlans', planId))
      fetchTrainingPlans()
      showToast('Training Plan Deleted', 'The training plan has been successfully deleted.', false)
    } catch (error) {
      console.error('Error deleting training plan:', error)
      showToast('Error', 'There was a problem deleting the training plan.', true)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Training Plans</CardTitle>
        <CardDescription>Manage your dog&apos;s training plans</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => {
          setEditingTrainingPlan(null)
          setShowTrainingPlanForm(!showTrainingPlanForm)
        }}>
          {showTrainingPlanForm && !editingTrainingPlan ? 'Cancel' : 'Add Training Plan'}
        </Button>

        {showTrainingPlanForm && (
          <TrainingPlanForm
            dogId={dogId}
            plan={editingTrainingPlan || undefined}
            onSuccess={() => {
              setShowTrainingPlanForm(false)
              setEditingTrainingPlan(null)
              fetchTrainingPlans()
              showToast(
                editingTrainingPlan ? 'Training Plan Updated' : 'Training Plan Added',
                `The training plan has been successfully ${editingTrainingPlan ? 'updated' : 'added'}.`,
                false
              )
            }}
            onCancel={() => {
              setShowTrainingPlanForm(false)
              setEditingTrainingPlan(null)
            }}
          />
        )}

        <div className="mt-6 space-y-4">
          {trainingPlans.map((plan) => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.trainingType}</CardTitle>
                <CardDescription>Started on {format(plan.startDate, 'MMMM d, yyyy')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Progress value={plan.progressStatus} className="mb-2" />
                <p className="text-sm text-gray-500 mb-2">Progress: {plan.progressStatus}%</p>
                <div className="space-y-2">
                  <h4 className="font-semibold">Training Steps:</h4>
                  {plan.steps.map((step, index) => (
                    <div key={index} className="pl-4 border-l-2 border-gray-200">
                      <p>{step.description}</p>
                      <p className="text-sm text-gray-500">Duration: {step.recommendedDuration} minutes</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => handleEditTrainingPlan(plan)}>Edit</Button>
                <Button variant="destructive" onClick={() => handleDeleteTrainingPlan(plan.id)}>Delete</Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

