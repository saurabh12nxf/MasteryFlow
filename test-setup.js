// Test Script to Create Track and Mission
// Run this in your browser console (F12 → Console tab)

async function setupTestData() {
    console.log("🚀 Creating test track...");

    // 1. Create a track
    const trackResponse = await fetch('/api/tracks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            name: "NeetCode 150",
            category: "DSA",
            difficultyLevel: "INTERMEDIATE"
        })
    });

    const { track } = await trackResponse.json();
    console.log("✅ Track created:", track);

    // 2. Add items to track
    console.log("📝 Adding tasks to track...");
    const itemsResponse = await fetch(`/api/tracks/${track.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            items: [
                {
                    title: "Two Sum",
                    description: "Find two numbers that add up to target",
                    difficulty: "EASY",
                    estimatedMinutes: 30
                },
                {
                    title: "Valid Parentheses",
                    description: "Check if brackets are balanced",
                    difficulty: "EASY",
                    estimatedMinutes: 20
                },
                {
                    title: "Longest Substring Without Repeating",
                    description: "Sliding window problem",
                    difficulty: "MEDIUM",
                    estimatedMinutes: 45
                },
                {
                    title: "Merge Two Sorted Lists",
                    description: "Merge linked lists",
                    difficulty: "EASY",
                    estimatedMinutes: 25
                }
            ]
        })
    });

    const { items } = await itemsResponse.json();
    console.log("✅ Added", items.length, "tasks");

    // 3. Generate daily mission
    console.log("🎯 Generating daily mission...");
    const missionResponse = await fetch('/api/missions/generate', {
        method: 'POST'
    });

    const { mission } = await missionResponse.json();
    console.log("✅ Mission created with", mission.tasks.length, "tasks");

    console.log("\n🎉 All done! Refresh the page to see your mission!");
    return { track, items, mission };
}

// Run the setup
setupTestData();
