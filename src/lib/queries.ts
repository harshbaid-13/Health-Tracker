import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { db, UserProfile, MealLog, WorkoutLog, WaterLog, SleepLog, AppSettings, DailyTargets } from './db';

// User Profile
export function useUserProfile() {
    return useQuery({
        queryKey: ['userProfile'],
        queryFn: async () => {
            const profile = await db.userProfile.toCollection().first();
            return profile || null;
        },
    });
}

export function useCreateUserProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
            const now = new Date();
            const id = await db.userProfile.add({
                ...data,
                createdAt: now,
                updatedAt: now,
            });
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
    });
}

export function useUpdateUserProfile() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: Partial<UserProfile> }) => {
            await db.userProfile.update(id, {
                ...data,
                updatedAt: new Date(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
        },
    });
}

// Meals
export function useMeals(date?: Date) {
    return useQuery({
        queryKey: ['meals', date?.toDateString()],
        queryFn: async () => {
            if (!date) {
                return db.meals.orderBy('timestamp').reverse().limit(20).toArray();
            }

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            return db.meals
                .where('timestamp')
                .between(startOfDay, endOfDay)
                .reverse()
                .toArray();
        },
    });
}

export function useAddMeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<MealLog, 'id' | 'createdAt' | 'updatedAt'>) => {
            const now = new Date();
            const id = await db.meals.add({
                ...data,
                createdAt: now,
                updatedAt: now,
            });
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meals'] });
        },
    });
}

export function useDeleteMeal() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await db.meals.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['meals'] });
        },
    });
}

// Workouts
export function useWorkouts(date?: Date) {
    return useQuery({
        queryKey: ['workouts', date?.toDateString()],
        queryFn: async () => {
            if (!date) {
                return db.workouts.orderBy('timestamp').reverse().limit(20).toArray();
            }

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            return db.workouts
                .where('timestamp')
                .between(startOfDay, endOfDay)
                .reverse()
                .toArray();
        },
    });
}

export function useAddWorkout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<WorkoutLog, 'id' | 'createdAt' | 'updatedAt'>) => {
            const now = new Date();
            const id = await db.workouts.add({
                ...data,
                createdAt: now,
                updatedAt: now,
            });
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
        },
    });
}

export function useDeleteWorkout() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await db.workouts.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['workouts'] });
        },
    });
}

// Water
export function useWaterLogs(date?: Date) {
    return useQuery({
        queryKey: ['water', date?.toDateString()],
        queryFn: async () => {
            if (!date) {
                return db.water.orderBy('timestamp').reverse().limit(20).toArray();
            }

            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            return db.water
                .where('timestamp')
                .between(startOfDay, endOfDay)
                .reverse()
                .toArray();
        },
    });
}

export function useAddWater() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (amount: number) => {
            const id = await db.water.add({
                amount,
                timestamp: new Date(),
                createdAt: new Date(),
            });
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['water'] });
        },
    });
}

export function useDeleteWater() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await db.water.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['water'] });
        },
    });
}

// Sleep
export function useSleepLogs(startDate?: Date, endDate?: Date) {
    return useQuery({
        queryKey: ['sleep', startDate?.toDateString(), endDate?.toDateString()],
        queryFn: async () => {
            if (!startDate || !endDate) {
                return db.sleep.orderBy('date').reverse().limit(30).toArray();
            }

            const start = startDate.toISOString().split('T')[0];
            const end = endDate.toISOString().split('T')[0];

            return db.sleep
                .where('date')
                .between(start, end, true, true)
                .reverse()
                .toArray();
        },
    });
}

export function useAddSleep() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Omit<SleepLog, 'id' | 'createdAt' | 'updatedAt'>) => {
            const now = new Date();
            const id = await db.sleep.add({
                ...data,
                createdAt: now,
                updatedAt: now,
            });
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sleep'] });
        },
    });
}

export function useDeleteSleep() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (id: number) => {
            await db.sleep.delete(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['sleep'] });
        },
    });
}

// Settings
export function useSettings() {
    return useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const settings = await db.settings.toCollection().first();
            return settings || null;
        },
    });
}

export function useUpdateSettings() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<AppSettings>) => {
            const existing = await db.settings.toCollection().first();

            if (existing?.id) {
                await db.settings.update(existing.id, {
                    ...data,
                    updatedAt: new Date(),
                });
            } else {
                await db.settings.add({
                    geminiApiKey: '',
                    googleFitConnected: false,
                    theme: 'system',
                    ...data,
                    updatedAt: new Date(),
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['settings'] });
        },
    });
}

// Daily Targets
export function useTargets() {
    return useQuery({
        queryKey: ['targets'],
        queryFn: async () => {
            const targets = await db.targets.toCollection().first();
            return targets || null;
        },
    });
}

export function useUpdateTargets() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (data: Partial<DailyTargets>) => {
            const existing = await db.targets.toCollection().first();

            if (existing?.id) {
                await db.targets.update(existing.id, {
                    ...data,
                    updatedAt: new Date(),
                });
            } else {
                await db.targets.add({
                    waterTarget: 3000,
                    sleepTarget: 8,
                    calorieTarget: 2000,
                    proteinTarget: 150,
                    ...data,
                    updatedAt: new Date(),
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['targets'] });
        },
    });
}