import {
    pgTable,
    uuid,
    varchar,
    text,
    timestamp,
    integer,
    boolean,
    json,
    date,
    time,
    pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Enums
export const categoryEnum = pgEnum("category", [
    "DSA",
    "SYSTEM_DESIGN",
    "AI_ML",
    "CS_FUNDAMENTALS",
    "OPEN_SOURCE",
]);

export const difficultyEnum = pgEnum("difficulty", ["EASY", "MEDIUM", "HARD"]);

export const difficultyLevelEnum = pgEnum("difficulty_level", [
    "BEGINNER",
    "INTERMEDIATE",
    "ADVANCED",
]);

export const missionStatusEnum = pgEnum("mission_status", [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
    "FAILED",
]);

export const taskStatusEnum = pgEnum("task_status", [
    "PENDING",
    "IN_PROGRESS",
    "COMPLETED",
    "SKIPPED",
]);

export const taskTypeEnum = pgEnum("task_type", [
    "TRACK_ITEM",
    "BRAIN_TEASER",
    "REFLECTION",
]);

export const xpSourceEnum = pgEnum("xp_source", [
    "TASK_COMPLETION",
    "BRAIN_TEASER",
    "OSS_CONTRIBUTION",
    "STREAK_BONUS",
    "PENALTY",
]);

export const aiProviderEnum = pgEnum("ai_provider", ["OPENAI", "GEMINI"]);

export const nudgeTypeEnum = pgEnum("nudge_type", [
    "REMINDER",
    "ESCALATION_1",
    "ESCALATION_2",
    "FINAL_WARNING",
]);

export const channelEnum = pgEnum("channel", ["WHATSAPP", "SMS", "EMAIL"]);

export const nudgeStatusEnum = pgEnum("nudge_status", [
    "SCHEDULED",
    "SENT",
    "FAILED",
    "CANCELLED",
]);

export const moodEnum = pgEnum("mood", [
    "ENERGIZED",
    "FOCUSED",
    "TIRED",
    "OVERWHELMED",
    "UNMOTIVATED",
]);

export const reflectionTypeEnum = pgEnum("reflection_type", ["DAILY", "WEEKLY"]);

// Tables
export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
    email: varchar("email", { length: 255 }).notNull(),
    username: varchar("username", { length: 255 }),
    timezone: varchar("timezone", { length: 100 }).default("UTC"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

    // Preferences
    dailyMissionTime: time("daily_mission_time").default("06:00:00"),
    notificationChannels: json("notification_channels").$type<{
        whatsapp: boolean;
        sms: boolean;
        email: boolean;
    }>().default({ whatsapp: false, sms: false, email: true }),
    cognitiveLoadMax: integer("cognitive_load_max").default(5),
});

export const tracks = pgTable("tracks", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    name: varchar("name", { length: 255 }).notNull(),
    category: categoryEnum("category").notNull(),
    totalItems: integer("total_items").default(0).notNull(),
    completedItems: integer("completed_items").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    rotationPriority: integer("rotation_priority").default(1).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),

    // Metadata
    difficultyLevel: difficultyLevelEnum("difficulty_level").default("INTERMEDIATE"),
    estimatedDays: integer("estimated_days"),
    sourceUrl: text("source_url"),
});

export const trackItems = pgTable("track_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    trackId: uuid("track_id").references(() => tracks.id, { onDelete: "cascade" }).notNull(),
    title: varchar("title", { length: 500 }).notNull(),
    description: text("description"),
    difficulty: difficultyEnum("difficulty").default("MEDIUM").notNull(),
    estimatedMinutes: integer("estimated_minutes").default(30).notNull(),
    orderIndex: integer("order_index").notNull(),
    tags: json("tags").$type<string[]>().default([]),
    resourceLinks: json("resource_links").$type<Array<{ type: string; url: string }>>().default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyMissions = pgTable("daily_missions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    missionDate: date("mission_date").notNull(),
    status: missionStatusEnum("status").default("PENDING").notNull(),

    // Assignment metadata
    assignedAt: timestamp("assigned_at").defaultNow().notNull(),
    deadline: timestamp("deadline").notNull(),
    completedAt: timestamp("completed_at"),

    // Cognitive load tracking
    totalEstimatedMinutes: integer("total_estimated_minutes").default(0).notNull(),
    actualMinutesSpent: integer("actual_minutes_spent").default(0),
});

export const missionTasks = pgTable("mission_tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    missionId: uuid("mission_id").references(() => dailyMissions.id, { onDelete: "cascade" }).notNull(),
    trackId: uuid("track_id").references(() => tracks.id, { onDelete: "set null" }),
    trackItemId: uuid("track_item_id").references(() => trackItems.id, { onDelete: "set null" }),

    taskType: taskTypeEnum("task_type").default("TRACK_ITEM").notNull(),
    status: taskStatusEnum("status").default("PENDING").notNull(),

    // Time tracking
    estimatedMinutes: integer("estimated_minutes").default(30).notNull(),
    actualMinutes: integer("actual_minutes").default(0),
    startedAt: timestamp("started_at"),
    completedAt: timestamp("completed_at"),

    // Effort tracking
    difficultyRating: integer("difficulty_rating"), // 1-5
    effortRating: integer("effort_rating"), // 1-5
});

export const streaks = pgTable("streaks", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    trackId: uuid("track_id").references(() => tracks.id, { onDelete: "cascade" }),

    currentStreak: integer("current_streak").default(0).notNull(),
    longestStreak: integer("longest_streak").default(0).notNull(),
    lastActivityDate: date("last_activity_date"),

    // Streak protection
    freezeCount: integer("freeze_count").default(0).notNull(),
    freezeUsed: integer("freeze_used").default(0).notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const xpTransactions = pgTable("xp_transactions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    amount: integer("amount").notNull(),
    source: xpSourceEnum("source").notNull(),
    sourceId: uuid("source_id"),

    description: text("description").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brainTeasers = pgTable("brain_teasers", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    question: text("question").notNull(),
    difficulty: difficultyEnum("difficulty").default("MEDIUM").notNull(),
    category: json("category").$type<string[]>().default([]),

    // AI-generated
    generatedBy: aiProviderEnum("generated_by").notNull(),
    generationPrompt: text("generation_prompt"),

    // User response
    userAnswer: text("user_answer"),
    isCorrect: boolean("is_correct"),
    attemptedAt: timestamp("attempted_at"),
    timeSpentSeconds: integer("time_spent_seconds"),

    // XP
    baseXp: integer("base_xp").notNull(),
    bonusXp: integer("bonus_xp").default(0),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const githubActivities = pgTable("github_activities", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    githubUsername: varchar("github_username", { length: 255 }).notNull(),

    activityDate: date("activity_date").notNull(),
    commitCount: integer("commit_count").default(0).notNull(),
    prCount: integer("pr_count").default(0).notNull(),
    issueCount: integer("issue_count").default(0).notNull(),
    reviewCount: integer("review_count").default(0).notNull(),

    // XP calculation
    totalXpEarned: integer("total_xp_earned").default(0).notNull(),
    grantedStreakFreeze: boolean("granted_streak_freeze").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reflections = pgTable("reflections", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    reflectionDate: date("reflection_date").notNull(),
    reflectionType: reflectionTypeEnum("reflection_type").notNull(),

    // Daily reflection
    mood: moodEnum("mood"),
    effortLevel: integer("effort_level"), // 1-5
    notes: text("notes"),

    // Weekly AI-generated insights
    aiSummary: text("ai_summary"),
    aiSuggestions: json("ai_suggestions").$type<Array<{
        trackId: string;
        suggestion: string;
        priority: number;
    }>>(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nudges = pgTable("nudges", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    missionId: uuid("mission_id").references(() => dailyMissions.id, { onDelete: "cascade" }).notNull(),

    nudgeType: nudgeTypeEnum("nudge_type").notNull(),
    channel: channelEnum("channel").notNull(),

    scheduledAt: timestamp("scheduled_at").notNull(),
    sentAt: timestamp("sent_at"),
    status: nudgeStatusEnum("status").default("SCHEDULED").notNull(),

    messageContent: text("message_content").notNull(),
    responseReceived: boolean("response_received").default(false).notNull(),
});

export const userSettings = pgTable("user_settings", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull().unique(),

    // Notification preferences
    enableNudges: boolean("enable_nudges").default(true).notNull(),
    nudgeEscalationEnabled: boolean("nudge_escalation_enabled").default(true).notNull(),
    quietHoursStart: time("quiet_hours_start").default("22:00:00"),
    quietHoursEnd: time("quiet_hours_end").default("08:00:00"),

    // Mission preferences
    autoAssignMissions: boolean("auto_assign_missions").default(true).notNull(),
    maxDailyTasks: integer("max_daily_tasks").default(5).notNull(),
    preferredDifficultyMix: json("preferred_difficulty_mix").$type<{
        easy: number;
        medium: number;
        hard: number;
    }>().default({ easy: 30, medium: 50, hard: 20 }),

    // Gamification
    showXp: boolean("show_xp").default(true).notNull(),
    showStreaks: boolean("show_streaks").default(true).notNull(),
    showLeaderboard: boolean("show_leaderboard").default(false).notNull(),

    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many, one }) => ({
    tracks: many(tracks),
    dailyMissions: many(dailyMissions),
    streaks: many(streaks),
    xpTransactions: many(xpTransactions),
    brainTeasers: many(brainTeasers),
    githubActivities: many(githubActivities),
    reflections: many(reflections),
    nudges: many(nudges),
    settings: one(userSettings),
}));

export const tracksRelations = relations(tracks, ({ one, many }) => ({
    user: one(users, {
        fields: [tracks.userId],
        references: [users.id],
    }),
    items: many(trackItems),
    missionTasks: many(missionTasks),
    streaks: many(streaks),
}));

export const trackItemsRelations = relations(trackItems, ({ one, many }) => ({
    track: one(tracks, {
        fields: [trackItems.trackId],
        references: [tracks.id],
    }),
    missionTasks: many(missionTasks),
}));

export const dailyMissionsRelations = relations(dailyMissions, ({ one, many }) => ({
    user: one(users, {
        fields: [dailyMissions.userId],
        references: [users.id],
    }),
    tasks: many(missionTasks),
    nudges: many(nudges),
}));

export const missionTasksRelations = relations(missionTasks, ({ one }) => ({
    mission: one(dailyMissions, {
        fields: [missionTasks.missionId],
        references: [dailyMissions.id],
    }),
    track: one(tracks, {
        fields: [missionTasks.trackId],
        references: [tracks.id],
    }),
    trackItem: one(trackItems, {
        fields: [missionTasks.trackItemId],
        references: [trackItems.id],
    }),
}));

export const streaksRelations = relations(streaks, ({ one }) => ({
    user: one(users, {
        fields: [streaks.userId],
        references: [users.id],
    }),
    track: one(tracks, {
        fields: [streaks.trackId],
        references: [tracks.id],
    }),
}));

export const xpTransactionsRelations = relations(xpTransactions, ({ one }) => ({
    user: one(users, {
        fields: [xpTransactions.userId],
        references: [users.id],
    }),
}));

export const brainTeasersRelations = relations(brainTeasers, ({ one }) => ({
    user: one(users, {
        fields: [brainTeasers.userId],
        references: [users.id],
    }),
}));

export const githubActivitiesRelations = relations(githubActivities, ({ one }) => ({
    user: one(users, {
        fields: [githubActivities.userId],
        references: [users.id],
    }),
}));

export const reflectionsRelations = relations(reflections, ({ one }) => ({
    user: one(users, {
        fields: [reflections.userId],
        references: [users.id],
    }),
}));

export const nudgesRelations = relations(nudges, ({ one }) => ({
    user: one(users, {
        fields: [nudges.userId],
        references: [users.id],
    }),
    mission: one(dailyMissions, {
        fields: [nudges.missionId],
        references: [dailyMissions.id],
    }),
}));

export const userSettingsRelations = relations(userSettings, ({ one }) => ({
    user: one(users, {
        fields: [userSettings.userId],
        references: [users.id],
    }),
}));
