import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { ArrowRight } from 'lucide-react'
import { fetchRoutingRules, fetchDepartments, createRoutingRule, deleteRoutingRule, updateRoutingRule } from '@/services/tickets'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Department } from '@/types'

export default function Routing() {
  const queryClient = useQueryClient()
  const { data: rules, isError: rulesError, error: rulesFetchError, isLoading: rulesLoading } = useQuery({ queryKey: ['routing_rules'], queryFn: fetchRoutingRules })
  const { data: departments, isError: departmentsError, error: departmentsFetchError, isLoading: departmentsLoading } = useQuery({ queryKey: ['departments'], queryFn: fetchDepartments })
  const [category, setCategory] = useState('')
  const [departmentId, setDepartmentId] = useState('')

  const createRule = useMutation({
    mutationFn: ({ category, department_id }: { category: string; department_id: string }) => createRoutingRule(category, department_id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['routing_rules'] })
      toast.success('Routing rule created')
      setCategory('')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to create rule')
  })

  const deleteRule = useMutation({
    mutationFn: (id: string) => deleteRoutingRule(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['routing_rules'] })
      toast.success('Rule deleted')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to delete rule')
  })

  const updateRule = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<{ category: string; department_id: string; is_active: boolean }> }) => updateRoutingRule(id, updates),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['routing_rules'] })
      toast.success('Rule updated')
    },
    onError: (err: any) => toast.error(err.message || 'Failed to update rule')
  })

  if (rulesLoading || departmentsLoading) return <div>Loading routing rules…</div>
  if (rulesError || departmentsError)
    return (
      <div className="text-destructive">
        Failed to load routing data: {(rulesFetchError || departmentsFetchError as Error)?.message || 'Unknown error'}
      </div>
    )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Routing rules</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium">Category</label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Billing" />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Department</label>
              <Select onValueChange={setDepartmentId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose department" />
                </SelectTrigger>
                <SelectContent>
                  {departments?.map((dept: Department) => (
                    <SelectItem key={dept.id} value={dept.id}>{dept.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="mt-4" onClick={() => createRule.mutate({ category, department_id: departmentId })} isLoading={createRule.isPending}>Add rule</Button>
        </CardContent>
      </Card>
      <div className="grid gap-4">
        {rules?.map((rule) => (
          <Card key={rule.id}>
            <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between py-4">
              <div className="flex items-center gap-3">
                <p className="font-medium text-lg">{rule.category}</p>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
                <Badge variant="secondary" className="text-sm px-3 py-1">{rule.departments?.name || 'Unassigned'}</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => updateRule.mutate({ id: rule.id, updates: { is_active: !rule.is_active } })} isLoading={updateRule.isPending && updateRule.variables?.id === rule.id}>
                  {rule.is_active ? 'Disable' : 'Enable'}
                </Button>
                <Button variant="destructive" size="sm" onClick={() => deleteRule.mutate(rule.id)} isLoading={deleteRule.isPending && deleteRule.variables === rule.id}>Delete</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
