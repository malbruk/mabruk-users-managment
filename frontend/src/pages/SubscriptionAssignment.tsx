import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { assignSubscription, fetchDashboardSummary, fetchSubscriptionPlans } from '../api/client';
import { AssignmentPayload } from '../api/types';
import { useDashboardStore } from '../state/store';

export const SubscriptionAssignment = () => {
  const queryClient = useQueryClient();
  const { selectedUserId } = useDashboardStore();
  const [form, setForm] = useState<AssignmentPayload>({ userId: selectedUserId ?? '', planId: '', seats: 1 });
  const [confirmation, setConfirmation] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: fetchDashboardSummary
  });

  const plansQuery = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: fetchSubscriptionPlans
  });

  const mutation = useMutation({
    mutationFn: assignSubscription,
    onSuccess: (_, variables) => {
      setConfirmation(`Assigned ${variables.seats} seat(s) to ${variables.userId}`);
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    }
  });

  useEffect(() => {
    if (selectedUserId) {
      setForm((prev) => ({ ...prev, userId: selectedUserId }));
    }
  }, [selectedUserId]);

  const isLoading = usersQuery.isLoading || plansQuery.isLoading;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setConfirmation(null);
    mutation.mutate(form);
  };

  const handleChange = (event: ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: name === 'seats' ? Number(value) : value }));
  };

  const usersOptions = useMemo(
    () =>
      usersQuery.data?.map((user) => (
        <option key={user.id} value={user.id}>
          {user.name} ({user.email})
        </option>
      )),
    [usersQuery.data]
  );

  const planOptions = useMemo(
    () =>
      plansQuery.data?.map((plan) => (
        <option key={plan.id} value={plan.id}>
          {`${plan.name} – ${plan.currency}${plan.price}/${plan.billingCycle}`}
        </option>
      )),
    [plansQuery.data]
  );

  return (
    <div className="section">
      <h2>Assign Subscriptions</h2>
      <p>Allocate product access and adjust seat counts for each account.</p>
      {isLoading ? (
        <p>Loading options…</p>
      ) : (
        <form className="input-group" onSubmit={handleSubmit}>
          <select
            required
            name="userId"
            value={form.userId}
            onChange={handleChange}
            aria-label="Select user"
          >
            <option value="" disabled>
              Select user
            </option>
            {usersOptions}
          </select>

          <select
            required
            name="planId"
            value={form.planId}
            onChange={handleChange}
            aria-label="Select plan"
          >
            <option value="" disabled>
              Select plan
            </option>
            {planOptions}
          </select>

          <input
            required
            type="number"
            min={1}
            name="seats"
            value={form.seats}
            onChange={handleChange}
            aria-label="Number of seats"
          />

          <button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Assigning…' : 'Assign'}
          </button>
        </form>
      )}

      {mutation.isError ? <p className="error-message">Could not assign subscription.</p> : null}
      {confirmation ? <p className="success-message">{confirmation}</p> : null}
    </div>
  );
};
