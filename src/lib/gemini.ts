import { GoogleGenerativeAI } from '@google/generative-ai';
import { UserProfile } from './db';

interface RetryConfig {
    maxRetries: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffMultiplier: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxRetries: 2, // Reduced from 3 to 2 for faster failures
    initialDelayMs: 500, // Reduced from 1000ms to 500ms
    maxDelayMs: 3000, // Reduced from 10000ms to 3000ms
    backoffMultiplier: 2,
};

export class GeminiService {
    private genAI: GoogleGenerativeAI;
    private model;
    private retryConfig: RetryConfig;

    constructor(apiKey: string, retryConfig: RetryConfig = DEFAULT_RETRY_CONFIG) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({
            model: 'gemini-2.5-flash-lite', // Fastest lightweight model
            generationConfig: {
                temperature: 0.3, // Lower for more consistent JSON output
                maxOutputTokens: 256, // Limit response size for faster generation
                topP: 0.95,
                topK: 40,
            }
        });
        this.retryConfig = retryConfig;
    }

    private async sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private isRetryableError(error: unknown): boolean {
        // Retry on network errors, rate limits, and service overload
        const errorMessage = error instanceof Error ? error.message : String(error);
        const errorCode = (error as { code?: string }).code;

        // Don't retry on our own timeout errors (already waited long enough)
        if (errorMessage.includes('timed out after')) return false;

        if (errorMessage.includes('503')) return true; // Service overloaded
        if (errorMessage.includes('429')) return true; // Rate limit
        if (errorMessage.includes('500')) return true; // Internal server error
        if (errorMessage.includes('502')) return true; // Bad gateway
        if (errorMessage.includes('504')) return true; // Gateway timeout
        if (errorCode === 'ECONNRESET') return true; // Connection reset
        if (errorCode === 'ETIMEDOUT') return true; // Request timeout
        return false;
    }

    private async withTimeout<T>(
        promise: Promise<T>,
        timeoutMs: number,
        errorMessage: string
    ): Promise<T> {
        const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
        );
        return Promise.race([promise, timeout]);
    }

    private async retryWithBackoff<T>(
        operation: () => Promise<T>,
        context: string,
        timeoutMs: number = 10000 // 10 second timeout per attempt
    ): Promise<T> {
        let lastError: unknown;

        for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
            try {
                return await this.withTimeout(
                    operation(),
                    timeoutMs,
                    `${context} timed out after ${timeoutMs}ms`
                );
            } catch (error) {
                lastError = error;

                // Don't retry on last attempt or non-retryable errors
                if (attempt === this.retryConfig.maxRetries || !this.isRetryableError(error)) {
                    break;
                }

                // Calculate delay with exponential backoff
                const delay = Math.min(
                    this.retryConfig.initialDelayMs * Math.pow(this.retryConfig.backoffMultiplier, attempt),
                    this.retryConfig.maxDelayMs
                );

                const errorMessage = error instanceof Error ? error.message : String(error);
                console.warn(
                    `${context} failed (attempt ${attempt + 1}/${this.retryConfig.maxRetries + 1}). ` +
                    `Retrying in ${delay}ms...`,
                    errorMessage
                );

                await this.sleep(delay);
            }
        }

        // All retries exhausted
        throw lastError;
    }

    async estimateMeal(description: string, userProfile: UserProfile) {
        const prompt = `You are a nutrition expert. Estimate the macronutrients for the following meal.

User Context:
- Weight: ${userProfile.weight}kg
- Height: ${userProfile.height}cm
- Gender: ${userProfile.gender}
- Age: ${userProfile.age}
- Activity Level: ${userProfile.activityLevel}
- Goal: ${userProfile.goal} weight

Meal Description: ${description}

Provide your estimate in the following JSON format ONLY (no additional text):
{
  "protein": <grams>,
  "carbs": <grams>,
  "fats": <grams>,
  "calories": <number>
}`;

        try {
            return await this.retryWithBackoff(async () => {
                const result = await this.model.generateContent(prompt);
                const response = result.response.text();

                // Extract JSON from response
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('Failed to parse AI response');
                }

                const data = JSON.parse(jsonMatch[0]);

                return {
                    protein: Number(data.protein) || 0,
                    carbs: Number(data.carbs) || 0,
                    fats: Number(data.fats) || 0,
                    calories: Number(data.calories) || 0,
                };
            }, 'Meal estimation');
        } catch (error) {
            console.error('Gemini API error:', error);

            // Provide more specific error messages
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('503')) {
                throw new Error('The AI service is currently overloaded. Please try again in a few moments.');
            } else if (errorMessage.includes('429')) {
                throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
            } else if (errorMessage.includes('API key')) {
                throw new Error('Invalid API key. Please check your Gemini API key in settings.');
            }

            throw new Error('Failed to estimate meal. Please try again.');
        }
    }

    async estimateWorkout(description: string, userProfile: UserProfile) {
        const prompt = `You are a fitness expert. Estimate the calories burned and suggest duration for the following workout.

User Context:
- Weight: ${userProfile.weight}kg
- Height: ${userProfile.height}cm
- Gender: ${userProfile.gender}
- Age: ${userProfile.age}
- Activity Level: ${userProfile.activityLevel}

Workout Description: ${description}

Provide your estimate in the following JSON format ONLY (no additional text):
{
  "caloriesBurned": <number>,
  "duration": <minutes>
}`;

        try {
            return await this.retryWithBackoff(async () => {
                const result = await this.model.generateContent(prompt);
                const response = result.response.text();

                // Extract JSON from response
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('Failed to parse AI response');
                }

                const data = JSON.parse(jsonMatch[0]);

                return {
                    caloriesBurned: Number(data.caloriesBurned) || 0,
                    duration: Number(data.duration) || 0,
                };
            }, 'Workout estimation');
        } catch (error) {
            console.error('Gemini API error:', error);

            // Provide more specific error messages
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('503')) {
                throw new Error('The AI service is currently overloaded. Please try again in a few moments.');
            } else if (errorMessage.includes('429')) {
                throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
            } else if (errorMessage.includes('API key')) {
                throw new Error('Invalid API key. Please check your Gemini API key in settings.');
            }

            throw new Error('Failed to estimate workout. Please try again.');
        }
    }

    async estimateDailyTargets(userProfile: UserProfile) {
        const prompt = `You are a health and fitness expert. Based on the user's profile, calculate personalized daily targets for water intake, sleep, calories, and protein.

User Profile:
- Weight: ${userProfile.weight}kg
- Height: ${userProfile.height}cm
- Gender: ${userProfile.gender}
- Age: ${userProfile.age}
- Activity Level: ${userProfile.activityLevel}
- Goal: ${userProfile.goal} weight

Consider:
1. Water: Calculate based on weight, activity level, and general health guidelines
2. Sleep: Recommend optimal sleep hours based on age and activity level
3. Calories: Calculate TDEE (Total Daily Energy Expenditure) based on BMR and activity level, then adjust for their goal (deficit for weight loss, surplus for gain, maintenance otherwise)
4. Protein: Calculate based on weight, activity level, and goal (higher for muscle gain/active individuals)

Provide your recommendations in the following JSON format ONLY (no additional text):
{
  "waterTarget": <milliliters>,
  "sleepTarget": <hours as decimal, e.g., 7.5>,
  "calorieTarget": <calories>,
  "proteinTarget": <grams>
}`;

        try {
            return await this.retryWithBackoff(async () => {
                const result = await this.model.generateContent(prompt);
                const response = result.response.text();

                // Extract JSON from response
                const jsonMatch = response.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                    throw new Error('Failed to parse AI response');
                }

                const data = JSON.parse(jsonMatch[0]);

                return {
                    waterTarget: Number(data.waterTarget) || 3000,
                    sleepTarget: Number(data.sleepTarget) || 8,
                    calorieTarget: Number(data.calorieTarget) || 2000,
                    proteinTarget: Number(data.proteinTarget) || 150,
                };
            }, 'Daily targets estimation');
        } catch (error) {
            console.error('Gemini API error:', error);

            // Provide more specific error messages
            const errorMessage = error instanceof Error ? error.message : String(error);
            if (errorMessage.includes('503')) {
                throw new Error('The AI service is currently overloaded. Please try again in a few moments.');
            } else if (errorMessage.includes('429')) {
                throw new Error('Rate limit exceeded. Please wait a moment before trying again.');
            } else if (errorMessage.includes('API key')) {
                throw new Error('Invalid API key. Please check your Gemini API key in settings.');
            }

            throw new Error('Failed to estimate daily targets. Please try again.');
        }
    }
}

// Helper hook to get Gemini service instance
export function getGeminiService(apiKey: string): GeminiService {
    if (!apiKey) {
        throw new Error('Gemini API key not configured');
    }
    return new GeminiService(apiKey);
}

// List all available models (static list)
export async function listAvailableModels(apiKey: string) {
    if (!apiKey) {
        throw new Error('Gemini API key not configured');
    }

    // Return a static list of commonly available Gemini models
    // Based on actual available models from the API
    return [
        { name: 'gemini-2.5-flash-lite' }, // Fastest - recommended for simple tasks
        { name: 'gemini-2.5-flash' }, // Fast and stable
        { name: 'gemini-2.0-flash-lite' }, // Lightweight alternative
        { name: 'gemini-2.0-flash' }, // Versatile
        { name: 'gemini-2.5-pro' }, // Most capable (slower)
        { name: 'gemini-flash-latest' }, // Always latest flash version
    ];
}