import { useMutation } from '@tanstack/react-query';
import { getGeminiService } from './gemini';
import { useSettings } from './queries';
import { UserProfile } from './db';

export function useEstimateMeal() {
    const { data: settings } = useSettings();

    return useMutation({
        mutationFn: async ({
            description,
            userProfile,
        }: {
            description: string;
            userProfile: UserProfile;
        }) => {
            if (!settings?.geminiApiKey) {
                throw new Error('Please configure your Gemini API key in settings');
            }

            const gemini = getGeminiService(settings.geminiApiKey);
            return await gemini.estimateMeal(description, userProfile);
        },
    });
}

export function useEstimateWorkout() {
    const { data: settings } = useSettings();

    return useMutation({
        mutationFn: async ({
            description,
            userProfile,
        }: {
            description: string;
            userProfile: UserProfile;
        }) => {
            if (!settings?.geminiApiKey) {
                throw new Error('Please configure your Gemini API key in settings');
            }

            const gemini = getGeminiService(settings.geminiApiKey);
            return await gemini.estimateWorkout(description, userProfile);
        },
    });
}

export function useEstimateDailyTargets() {
    const { data: settings } = useSettings();

    return useMutation({
        mutationFn: async (userProfile: UserProfile) => {
            if (!settings?.geminiApiKey) {
                throw new Error('Please configure your Gemini API key in settings');
            }

            const gemini = getGeminiService(settings.geminiApiKey);
            return await gemini.estimateDailyTargets(userProfile);
        },
    });
}