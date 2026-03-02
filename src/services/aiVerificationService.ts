import { userService, UserProfile } from './userService';
import { listingService } from './listingService';

interface VerificationScore {
    score: number;
    reasons: string[];
    recommendation: 'auto_verify' | 'manual_review' | 'reject';
}

export const aiVerificationService = {
    // AI-powered user verification
    analyzeUserForVerification: async (userId: string): Promise<VerificationScore> => {
        console.log(`🤖 AI analyzing user: ${userId}`);
        
        try {
            const user = await userService.getProfile(userId);
            if (!user) {
                return {
                    score: 0,
                    reasons: ['User profile not found'],
                    recommendation: 'reject'
                };
            }

            let score = 0;
            const reasons: string[] = [];

            // 1. Profile Completeness (30 points)
            if (user.displayName && user.displayName.length > 2) {
                score += 10;
                reasons.push('✅ Valid display name');
            }
            
            if (user.email && user.email.includes('@')) {
                score += 10;
                reasons.push('✅ Valid email address');
            }
            
            if (user.phone && user.phone.length >= 10) {
                score += 10;
                reasons.push('✅ Phone number provided');
            }

            // 2. Account Age (20 points)
            const accountAge = aiVerificationService.getAccountAgeInDays(user.createdAt);
            if (accountAge >= 7) {
                score += 20;
                reasons.push(`✅ Account age: ${accountAge} days`);
            } else if (accountAge >= 1) {
                score += 10;
                reasons.push(`⚠️ New account: ${accountAge} days`);
            }

            // 3. Activity Score (30 points)
            const activityScore = await aiVerificationService.calculateActivityScore(userId);
            score += activityScore;
            if (activityScore > 0) {
                reasons.push(`✅ Activity score: ${activityScore}/30`);
            }

            // 4. Trust Indicators (20 points)
            if (user.trustScore && user.trustScore > 70) {
                score += 20;
                reasons.push(`✅ High trust score: ${user.trustScore}`);
            } else if (user.trustScore && user.trustScore > 50) {
                score += 10;
                reasons.push(`⚠️ Medium trust score: ${user.trustScore}`);
            }

            // 5. Red Flags Detection (-50 points each)
            const redFlags = aiVerificationService.detectRedFlags(user);
            score -= redFlags.length * 50;
            redFlags.forEach(flag => reasons.push(`❌ ${flag}`));

            // Determine recommendation
            let recommendation: 'auto_verify' | 'manual_review' | 'reject';
            if (score >= 80) {
                recommendation = 'auto_verify';
            } else if (score >= 40) {
                recommendation = 'manual_review';
            } else {
                recommendation = 'reject';
            }

            console.log(`🤖 AI Analysis Complete: Score ${score}/100, Recommendation: ${recommendation}`);
            
            return {
                score: Math.max(0, Math.min(100, score)),
                reasons,
                recommendation
            };

        } catch (error) {
            console.error('AI Verification Error:', error);
            return {
                score: 0,
                reasons: ['Analysis failed'],
                recommendation: 'manual_review'
            };
        }
    },

    // Calculate activity score based on user actions
    calculateActivityScore: async (userId: string): Promise<number> => {
        try {
            // Check user's listings
            const userListings = await listingService.getListingsByUser(userId);
            let activityScore = 0;

            // Points for creating listings
            if (userListings.length > 0) {
                activityScore += Math.min(15, userListings.length * 5);
            }

            // Points for profile updates
            const user = await userService.getProfile(userId);
            if (user?.bio && user.bio.length > 20) {
                activityScore += 5;
            }
            if (user?.location) {
                activityScore += 5;
            }
            if (user?.photoURL) {
                activityScore += 5;
            }

            return Math.min(30, activityScore);
        } catch (error) {
            return 0;
        }
    },

    // Detect suspicious patterns
    detectRedFlags: (user: UserProfile): string[] => {
        const flags: string[] = [];

        // Suspicious name patterns
        if (user.displayName) {
            const name = user.displayName.toLowerCase();
            const suspiciousPatterns = [
                /test\d+/,
                /fake/,
                /spam/,
                /bot\d*/,
                /admin\d*/,
                /^user\d+$/,
                /^[a-z]{1,3}\d+$/
            ];

            if (suspiciousPatterns.some(pattern => pattern.test(name))) {
                flags.push('Suspicious username pattern');
            }

            // Too short or too long names
            if (name.length < 2) {
                flags.push('Name too short');
            }
            if (name.length > 50) {
                flags.push('Name too long');
            }
        }

        // Suspicious email patterns
        if (user.email) {
            const email = user.email.toLowerCase();
            const suspiciousEmailPatterns = [
                /\+.*\+/,  // Multiple + signs
                /\.{2,}/,  // Multiple dots
                /temp/,
                /fake/,
                /test/
            ];

            if (suspiciousEmailPatterns.some(pattern => pattern.test(email))) {
                flags.push('Suspicious email pattern');
            }
        }

        // Check for reports
        if (user.stats?.reportsReceived && user.stats.reportsReceived > 2) {
            flags.push(`Multiple reports: ${user.stats.reportsReceived}`);
        }

        return flags;
    },

    // Get account age in days
    getAccountAgeInDays: (createdAt: any): number => {
        try {
            let date: Date;
            
            if (createdAt?.toDate) {
                // Firestore Timestamp
                date = createdAt.toDate();
            } else if (createdAt instanceof Date) {
                date = createdAt;
            } else if (typeof createdAt === 'string') {
                date = new Date(createdAt);
            } else {
                return 0;
            }

            const now = new Date();
            const diffTime = Math.abs(now.getTime() - date.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays;
        } catch (error) {
            return 0;
        }
    },

    // Auto-process verification queue
    processVerificationQueue: async (): Promise<{
        processed: number;
        autoVerified: number;
        rejected: number;
        manualReview: number;
    }> => {
        console.log('🤖 Starting AI verification queue processing...');
        
        try {
            // Get all pending users
            const pendingUsers = await userService.getPendingUsers();
            
            let processed = 0;
            let autoVerified = 0;
            let rejected = 0;
            let manualReview = 0;

            for (const user of pendingUsers) {
                const analysis = await aiVerificationService.analyzeUserForVerification(user.uid);
                
                switch (analysis.recommendation) {
                    case 'auto_verify':
                        await userService.updateKycStatus(user.uid, 'verified');
                        await aiVerificationService.logVerificationDecision(user.uid, 'auto_verified', analysis);
                        autoVerified++;
                        break;
                        
                    case 'reject':
                        await userService.updateKycStatus(user.uid, 'unverified');
                        await aiVerificationService.logVerificationDecision(user.uid, 'rejected', analysis);
                        rejected++;
                        break;
                        
                    case 'manual_review':
                        // Keep as pending for manual review
                        await aiVerificationService.logVerificationDecision(user.uid, 'manual_review', analysis);
                        manualReview++;
                        break;
                }
                
                processed++;
            }

            console.log(`🤖 AI Processing Complete: ${processed} users processed`);
            console.log(`✅ Auto-verified: ${autoVerified}`);
            console.log(`❌ Rejected: ${rejected}`);
            console.log(`👤 Manual review: ${manualReview}`);

            return { processed, autoVerified, rejected, manualReview };
            
        } catch (error) {
            console.error('AI Queue Processing Error:', error);
            return { processed: 0, autoVerified: 0, rejected: 0, manualReview: 0 };
        }
    },

    // Log verification decisions for audit
    logVerificationDecision: async (userId: string, decision: string, analysis: VerificationScore) => {
        try {
            const logEntry = {
                userId,
                decision,
                score: analysis.score,
                reasons: analysis.reasons,
                timestamp: new Date(),
                aiVersion: '1.0'
            };
            
            // Store in verification_logs collection
            console.log('📝 Logging verification decision:', logEntry);
            // You can implement actual logging to Firestore here
            
        } catch (error) {
            console.error('Logging error:', error);
        }
    }
};