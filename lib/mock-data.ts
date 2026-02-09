// Static mock data shown to unauthenticated (guest) users as a preview

export const mockContacts = [
  {
    id: "mock-c1",
    first_name: "Sarah",
    last_name: "Chen",
    email: "sarah.chen@techcorp.io",
    phone: "+1 (415) 555-0102",
    company: "TechCorp",
    role: "VP of Engineering",
    status: "active",
    notes: "Met at React Summit 2025. Interested in our enterprise plan.",
    created_at: "2025-12-15T10:30:00Z",
  },
  {
    id: "mock-c2",
    first_name: "Marcus",
    last_name: "Rivera",
    email: "marcus@designlabs.co",
    phone: "+1 (212) 555-0198",
    company: "DesignLabs",
    role: "Founder & CEO",
    status: "lead",
    notes: "Reached out via LinkedIn. Scheduling a demo next week.",
    created_at: "2026-01-08T14:20:00Z",
  },
  {
    id: "mock-c3",
    first_name: "Emily",
    last_name: "Tanaka",
    email: "emily.tanaka@startup.ai",
    phone: "+1 (650) 555-0147",
    company: "Startup AI",
    role: "Head of Product",
    status: "active",
    notes: "Signed up for the pilot program. Actively using the product.",
    created_at: "2026-01-20T09:15:00Z",
  },
  {
    id: "mock-c4",
    first_name: "David",
    last_name: "Okafor",
    email: "d.okafor@finserve.com",
    phone: "+1 (312) 555-0163",
    company: "FinServe",
    role: "CTO",
    status: "active",
    notes: "Enterprise customer. Renewed annual contract in January.",
    created_at: "2025-11-03T16:45:00Z",
  },
  {
    id: "mock-c5",
    first_name: "Ava",
    last_name: "Morrison",
    email: "ava.m@cloudbase.dev",
    phone: null,
    company: "CloudBase",
    role: "Senior Developer",
    status: "inactive",
    notes: "Previously evaluated our API. May revisit in Q2.",
    created_at: "2025-09-22T11:00:00Z",
  },
  {
    id: "mock-c6",
    first_name: "James",
    last_name: "Park",
    email: "jpark@novacorp.io",
    phone: "+1 (206) 555-0134",
    company: "NovaCorp",
    role: "Engineering Manager",
    status: "lead",
    notes: "Inbound from the website. Requested pricing details.",
    created_at: "2026-02-01T08:30:00Z",
  },
]

export const mockTasks = [
  {
    id: "mock-t1",
    title: "Prepare Q1 product roadmap presentation",
    description: "Create slides covering feature releases, metrics, and upcoming milestones for the Q1 review.",
    status: "in_progress",
    priority: "high",
    due_date: "2026-02-14",
    contact_id: "mock-c1",
    contacts: { first_name: "Sarah", last_name: "Chen" },
    created_at: "2026-02-07T10:00:00Z",
  },
  {
    id: "mock-t2",
    title: "Follow up with DesignLabs demo",
    description: "Send recap email and proposal after the product demo with Marcus.",
    status: "done",
    priority: "high",
    due_date: "2026-02-10",
    contact_id: "mock-c2",
    contacts: { first_name: "Marcus", last_name: "Rivera" },
    created_at: "2026-02-07T14:00:00Z",
  },
  {
    id: "mock-t3",
    title: "Review pilot feedback from Startup AI",
    description: "Analyze usage data and feedback from Emily's team during the pilot period.",
    status: "done",
    priority: "medium",
    due_date: "2026-01-28",
    contact_id: "mock-c3",
    contacts: { first_name: "Emily", last_name: "Tanaka" },
    created_at: "2026-02-06T09:00:00Z",
  },
  {
    id: "mock-t4",
    title: "Update API documentation for v2 endpoints",
    description: "Document the new authentication flow and rate limiting changes.",
    status: "in_progress",
    priority: "medium",
    due_date: "2026-02-20",
    contact_id: null,
    contacts: null,
    created_at: "2026-02-06T11:30:00Z",
  },
  {
    id: "mock-t5",
    title: "Schedule contract renewal meeting with FinServe",
    description: "Set up a call with David to discuss the Q2 expansion plan.",
    status: "done",
    priority: "medium",
    due_date: "2026-02-12",
    contact_id: "mock-c4",
    contacts: { first_name: "David", last_name: "Okafor" },
    created_at: "2026-02-05T08:45:00Z",
  },
  {
    id: "mock-t6",
    title: "Fix authentication bug on mobile",
    description: "Users on iOS Safari are intermittently logged out. Investigate session handling.",
    status: "todo",
    priority: "high",
    due_date: "2026-02-08",
    contact_id: null,
    contacts: null,
    created_at: "2026-02-04T16:20:00Z",
  },
  {
    id: "mock-t7",
    title: "Send NovaCorp pricing proposal",
    description: "Prepare custom pricing based on their team size and usage estimate.",
    status: "todo",
    priority: "low",
    due_date: "2026-02-18",
    contact_id: "mock-c6",
    contacts: { first_name: "James", last_name: "Park" },
    created_at: "2026-02-04T10:00:00Z",
  },
  {
    id: "mock-t8",
    title: "Write blog post about new features",
    description: "Cover the universal saver, AI search, and analytics dashboard in a launch post.",
    status: "done",
    priority: "low",
    due_date: "2026-01-20",
    contact_id: null,
    contacts: null,
    created_at: "2026-02-03T13:00:00Z",
  },
]

export const mockSavedItems = [
  {
    id: "mock-s1",
    title: "Sarah Chen - VP of Engineering at TechCorp",
    summary: "LinkedIn profile of a senior engineering leader with 12 years of experience in distributed systems and team building.",
    category: "person",
    tags: ["engineering", "leadership", "enterprise"],
    metadata: { content_type: "profile", sentiment: "neutral", entities: ["Sarah Chen", "TechCorp"] },
    created_at: "2026-01-18T10:00:00Z",
  },
  {
    id: "mock-s2",
    title: "Q1 Planning Meeting Notes",
    summary: "Discussed product roadmap priorities, hiring plan for 3 new engineers, and timeline for v2 API launch.",
    category: "meeting",
    tags: ["planning", "roadmap", "hiring"],
    metadata: { content_type: "meeting_notes", urgency: "high", entities: ["Q1", "v2 API"] },
    created_at: "2026-01-22T15:30:00Z",
  },
  {
    id: "mock-s3",
    title: "AI-Powered Search Implementation Ideas",
    summary: "Brainstorm on using vector embeddings for semantic search across saved items, contacts, and tasks.",
    category: "idea",
    tags: ["AI", "search", "embeddings", "product"],
    metadata: { content_type: "brainstorm", sentiment: "positive" },
    created_at: "2026-01-28T09:45:00Z",
  },
  {
    id: "mock-s4",
    title: "Research: Best Practices for SaaS Onboarding",
    summary: "Article summary covering onboarding flow patterns, activation metrics, and user retention strategies.",
    category: "reference",
    tags: ["SaaS", "onboarding", "retention"],
    metadata: { content_type: "article", sentiment: "informative" },
    created_at: "2026-02-01T14:00:00Z",
  },
  {
    id: "mock-s5",
    title: "Integrate Slack Notifications for Task Updates",
    summary: "Feature request to send Slack messages when tasks are created, completed, or overdue.",
    category: "task",
    tags: ["integration", "Slack", "notifications"],
    metadata: { content_type: "feature_request", urgency: "medium", entities: ["Slack"] },
    created_at: "2026-02-03T11:20:00Z",
  },
]

// Mock saved items with raw_text for the saved items browse page
export const mockSavedItemsFull = mockSavedItems.map((item) => ({
  ...item,
  raw_text: `This is sample content for "${item.title}". In the full app, this would contain the original text you pasted into the Universal Saver.`,
}))

export const mockSavedItemsCategoryCounts: Record<string, number> = {
  person: 1,
  meeting: 1,
  idea: 1,
  reference: 1,
  task: 1,
}

// Mock contact options used in the tasks creation form
export const mockContactOptions = mockContacts.map((c) => ({
  id: c.id,
  name: c.last_name ? `${c.first_name} ${c.last_name}` : c.first_name,
}))

// Mock workouts for Fitness Tracker
export const mockWorkouts = [
  {
    id: "mock-w1",
    exercise_name: "Bench Press",
    category: "strength",
    sets: 4,
    reps: 8,
    weight_lbs: 185,
    duration_minutes: null,
    notes: "Felt strong today. Almost hit 195 on the last set.",
    workout_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-w2",
    exercise_name: "Running",
    category: "cardio",
    sets: null,
    reps: null,
    weight_lbs: null,
    duration_minutes: 35,
    notes: "5K in 28 min. Good pace.",
    workout_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-w3",
    exercise_name: "Squats",
    category: "strength",
    sets: 5,
    reps: 5,
    weight_lbs: 225,
    duration_minutes: null,
    notes: "New PR on working sets!",
    workout_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-w4",
    exercise_name: "Yoga Flow",
    category: "flexibility",
    sets: null,
    reps: null,
    weight_lbs: null,
    duration_minutes: 45,
    notes: "Morning flow session. Hips feeling much better.",
    workout_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-w5",
    exercise_name: "Deadlift",
    category: "strength",
    sets: 3,
    reps: 5,
    weight_lbs: 275,
    duration_minutes: null,
    notes: "Focused on form. Grip held up well.",
    workout_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-w6",
    exercise_name: "Cycling",
    category: "cardio",
    sets: null,
    reps: null,
    weight_lbs: null,
    duration_minutes: 50,
    notes: "Easy endurance ride. 15 miles.",
    workout_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-w7",
    exercise_name: "Overhead Press",
    category: "strength",
    sets: 4,
    reps: 6,
    weight_lbs: 115,
    duration_minutes: null,
    notes: null,
    workout_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-w8",
    exercise_name: "Pull-ups",
    category: "strength",
    sets: 4,
    reps: 10,
    weight_lbs: 0,
    duration_minutes: null,
    notes: "Bodyweight. Superset with dips.",
    workout_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-w9",
    exercise_name: "Stretching",
    category: "flexibility",
    sets: null,
    reps: null,
    weight_lbs: null,
    duration_minutes: 20,
    notes: "Post-workout stretch. Focused on hamstrings.",
    workout_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-w10",
    exercise_name: "Barbell Row",
    category: "strength",
    sets: 4,
    reps: 8,
    weight_lbs: 155,
    duration_minutes: null,
    notes: "Back day. Superset with face pulls.",
    workout_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock meals for Meal Tracker
export const mockMeals = [
  {
    id: "mock-m1",
    meal_name: "Scrambled eggs with avocado toast",
    meal_type: "breakfast",
    calories: 480,
    protein_g: 24,
    carbs_g: 38,
    fat_g: 26,
    notes: "Two eggs, whole wheat bread, half an avocado.",
    meal_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-m2",
    meal_name: "Grilled chicken salad",
    meal_type: "lunch",
    calories: 520,
    protein_g: 42,
    carbs_g: 18,
    fat_g: 28,
    notes: "Mixed greens, cherry tomatoes, olive oil dressing.",
    meal_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-m3",
    meal_name: "Protein shake",
    meal_type: "snack",
    calories: 210,
    protein_g: 30,
    carbs_g: 12,
    fat_g: 5,
    notes: "Whey protein, almond milk, banana.",
    meal_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-m4",
    meal_name: "Salmon with rice and broccoli",
    meal_type: "dinner",
    calories: 680,
    protein_g: 45,
    carbs_g: 52,
    fat_g: 24,
    notes: "Pan-seared salmon fillet. Brown rice.",
    meal_date: new Date().toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-m5",
    meal_name: "Oatmeal with blueberries",
    meal_type: "breakfast",
    calories: 350,
    protein_g: 12,
    carbs_g: 58,
    fat_g: 8,
    notes: "Steel-cut oats with honey and fresh blueberries.",
    meal_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-m6",
    meal_name: "Turkey wrap",
    meal_type: "lunch",
    calories: 440,
    protein_g: 32,
    carbs_g: 35,
    fat_g: 16,
    notes: "Whole wheat tortilla, turkey, lettuce, mustard.",
    meal_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-m7",
    meal_name: "Pasta with meat sauce",
    meal_type: "dinner",
    calories: 720,
    protein_g: 38,
    carbs_g: 72,
    fat_g: 22,
    notes: "Whole wheat penne, lean ground beef, marinara.",
    meal_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-m8",
    meal_name: "Greek yogurt with granola",
    meal_type: "snack",
    calories: 280,
    protein_g: 18,
    carbs_g: 32,
    fat_g: 10,
    notes: null,
    meal_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-m9",
    meal_name: "Steak and sweet potato",
    meal_type: "dinner",
    calories: 750,
    protein_g: 52,
    carbs_g: 48,
    fat_g: 30,
    notes: "6oz sirloin, medium sweet potato with butter.",
    meal_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-m10",
    meal_name: "Smoothie bowl",
    meal_type: "breakfast",
    calories: 390,
    protein_g: 14,
    carbs_g: 62,
    fat_g: 12,
    notes: "Acai, banana, strawberries, topped with granola and coconut.",
    meal_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-m11",
    meal_name: "Chicken stir fry",
    meal_type: "dinner",
    calories: 560,
    protein_g: 40,
    carbs_g: 45,
    fat_g: 18,
    notes: "Bell peppers, snap peas, soy sauce, jasmine rice.",
    meal_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-m12",
    meal_name: "Trail mix",
    meal_type: "snack",
    calories: 260,
    protein_g: 8,
    carbs_g: 24,
    fat_g: 16,
    notes: "Almonds, cashews, dark chocolate chips, dried cranberries.",
    meal_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

// Mock transactions for Finance Tracker
export const mockTransactions = [
  {
    id: "mock-tx1",
    description: "Whole Foods groceries",
    amount: 127.43,
    type: "expense",
    category: "food",
    transaction_date: new Date().toISOString().split("T")[0],
    notes: "Weekly grocery run",
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-tx2",
    description: "Monthly salary",
    amount: 5200,
    type: "income",
    category: "income",
    transaction_date: new Date().toISOString().split("T")[0],
    notes: "February paycheck",
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-tx3",
    description: "Uber ride to airport",
    amount: 42.5,
    type: "expense",
    category: "transport",
    transaction_date: new Date().toISOString().split("T")[0],
    notes: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-tx4",
    description: "Netflix subscription",
    amount: 15.99,
    type: "expense",
    category: "subscriptions",
    transaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Monthly streaming",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-tx5",
    description: "Rent payment",
    amount: 1800,
    type: "expense",
    category: "housing",
    transaction_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "February rent",
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-tx6",
    description: "Movie tickets",
    amount: 28,
    type: "expense",
    category: "entertainment",
    transaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Two tickets for new sci-fi film",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-tx7",
    description: "Electric bill",
    amount: 89.2,
    type: "expense",
    category: "utilities",
    transaction_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "January billing cycle",
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-tx8",
    description: "Freelance design work",
    amount: 750,
    type: "income",
    category: "income",
    transaction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Logo project for CloudBase",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-tx9",
    description: "New running shoes",
    amount: 134.99,
    type: "expense",
    category: "shopping",
    transaction_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Nike Pegasus 42",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-tx10",
    description: "Doctor visit copay",
    amount: 30,
    type: "expense",
    category: "health",
    transaction_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Annual checkup",
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-tx11",
    description: "Coffee and pastry",
    amount: 8.75,
    type: "expense",
    category: "food",
    transaction_date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: null,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-tx12",
    description: "Spotify Premium",
    amount: 10.99,
    type: "expense",
    category: "subscriptions",
    transaction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Monthly music streaming",
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-tx13",
    description: "Gas station fill-up",
    amount: 52.3,
    type: "expense",
    category: "transport",
    transaction_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: null,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-tx14",
    description: "Dinner with friends",
    amount: 67.5,
    type: "expense",
    category: "food",
    transaction_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Split the bill at Italian place",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "mock-tx15",
    description: "Internet bill",
    amount: 65,
    type: "expense",
    category: "utilities",
    transaction_date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    notes: "Fiber plan",
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export const mockBudgets = [
  {
    id: "mock-b1",
    category: null,
    monthly_limit: 3500,
    budget_month: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-b2",
    category: "food",
    monthly_limit: 500,
    budget_month: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-b3",
    category: "housing",
    monthly_limit: 1800,
    budget_month: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-b4",
    category: "entertainment",
    monthly_limit: 200,
    budget_month: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-b5",
    category: "transport",
    monthly_limit: 300,
    budget_month: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
  {
    id: "mock-b6",
    category: "subscriptions",
    monthly_limit: 50,
    budget_month: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split("T")[0],
    created_at: new Date().toISOString(),
  },
]

// Analytics-friendly tasks (without the contacts join, just contact_id)
export const mockAnalyticsTasks = mockTasks.map((t) => ({
  id: t.id,
  title: t.title,
  status: t.status,
  priority: t.priority,
  due_date: t.due_date,
  contact_id: t.contact_id,
  created_at: t.created_at,
}))

// Mock habits for Habit Tracker
export const mockHabits = [
  {
    id: "mock-h1",
    name: "Morning Meditation",
    description: "10 minutes of mindfulness meditation after waking up.",
    category: "mindfulness",
    type: "boolean",
    target_count: null,
    color: "#6366f1",
    is_active: true,
    created_at: "2026-01-01T08:00:00Z",
  },
  {
    id: "mock-h2",
    name: "Drink Water",
    description: "Stay hydrated throughout the day.",
    category: "health",
    type: "counted",
    target_count: 8,
    color: "#06b6d4",
    is_active: true,
    created_at: "2026-01-01T08:00:00Z",
  },
  {
    id: "mock-h3",
    name: "Read",
    description: "Read at least 20 pages of a book.",
    category: "learning",
    type: "boolean",
    target_count: null,
    color: "#f59e0b",
    is_active: true,
    created_at: "2026-01-05T10:00:00Z",
  },
  {
    id: "mock-h4",
    name: "Exercise",
    description: "Any form of physical activity for 30+ minutes.",
    category: "health",
    type: "boolean",
    target_count: null,
    color: "#22c55e",
    is_active: true,
    created_at: "2026-01-05T10:00:00Z",
  },
  {
    id: "mock-h5",
    name: "Write Journal",
    description: "Reflect on the day and write a journal entry.",
    category: "mindfulness",
    type: "boolean",
    target_count: null,
    color: "#ec4899",
    is_active: true,
    created_at: "2026-01-10T12:00:00Z",
  },
  {
    id: "mock-h6",
    name: "No Social Media",
    description: "Avoid scrolling social media for the day.",
    category: "productivity",
    type: "boolean",
    target_count: null,
    color: "#ef4444",
    is_active: true,
    created_at: "2026-01-12T09:00:00Z",
  },
  {
    id: "mock-h7",
    name: "Practice Guitar",
    description: "30 minutes of guitar practice.",
    category: "learning",
    type: "boolean",
    target_count: null,
    color: "#8b5cf6",
    is_active: false,
    created_at: "2026-01-15T14:00:00Z",
  },
  {
    id: "mock-h8",
    name: "Steps",
    description: "Walk at least 10,000 steps.",
    category: "health",
    type: "counted",
    target_count: 10000,
    color: "#14b8a6",
    is_active: true,
    created_at: "2026-01-18T08:00:00Z",
  },
]

// Generate mock completions for the past 30 days
function generateMockCompletions() {
  const completions: Array<{
    id: string
    habit_id: string
    completion_date: string
    value: number
    created_at: string
  }> = []
  let counter = 1

  for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
    const date = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split("T")[0]

    // Morning Meditation - completed ~80% of days
    if (dayOffset % 5 !== 3) {
      completions.push({
        id: `mock-hc${counter++}`,
        habit_id: "mock-h1",
        completion_date: dateStr,
        value: 1,
        created_at: date.toISOString(),
      })
    }

    // Drink Water (counted) - varies between 4-8 glasses
    completions.push({
      id: `mock-hc${counter++}`,
      habit_id: "mock-h2",
      completion_date: dateStr,
      value: 4 + Math.floor(Math.abs(Math.sin(dayOffset * 1.5)) * 5),
      created_at: date.toISOString(),
    })

    // Read - ~60% of days
    if (dayOffset % 5 !== 1 && dayOffset % 5 !== 4) {
      completions.push({
        id: `mock-hc${counter++}`,
        habit_id: "mock-h3",
        completion_date: dateStr,
        value: 1,
        created_at: date.toISOString(),
      })
    }

    // Exercise - ~70% of days
    if (dayOffset % 10 !== 2 && dayOffset % 10 !== 5 && dayOffset % 10 !== 8) {
      completions.push({
        id: `mock-hc${counter++}`,
        habit_id: "mock-h4",
        completion_date: dateStr,
        value: 1,
        created_at: date.toISOString(),
      })
    }

    // Journal - ~50% of days
    if (dayOffset % 2 === 0) {
      completions.push({
        id: `mock-hc${counter++}`,
        habit_id: "mock-h5",
        completion_date: dateStr,
        value: 1,
        created_at: date.toISOString(),
      })
    }

    // No Social Media - ~40% of days
    if (dayOffset % 5 === 0 || dayOffset % 5 === 2) {
      completions.push({
        id: `mock-hc${counter++}`,
        habit_id: "mock-h6",
        completion_date: dateStr,
        value: 1,
        created_at: date.toISOString(),
      })
    }

    // Steps (counted) - varies 5000-12000
    completions.push({
      id: `mock-hc${counter++}`,
      habit_id: "mock-h8",
      completion_date: dateStr,
      value: 5000 + Math.floor(Math.abs(Math.sin(dayOffset * 2.3)) * 7000),
      created_at: date.toISOString(),
    })
  }

  return completions
}

export const mockHabitCompletions = generateMockCompletions()

// Mock mood entries for Wellness Journal
const moodNotes = [
  "Had a really productive morning. Felt focused and energized.",
  "Woke up feeling a bit groggy but things improved after lunch.",
  "Stressful day at work, lots of deadlines piling up.",
  "Great workout in the morning set the tone for the whole day.",
  "Feeling grateful today. Spent quality time with family.",
  "Couldn't sleep well last night, dragged through the day.",
  "Meditation session helped clear my mind. Feeling centered.",
  "Amazing dinner with friends. Laughter is the best medicine.",
  "Felt overwhelmed with tasks. Need to prioritize better.",
  "Took a long walk in nature. Felt peaceful and recharged.",
  "Rainy day, stayed in and read. Cozy and content.",
  "Had an argument that left me feeling drained.",
  "Finally finished that big project. Relief and pride.",
  "Tried a new recipe and it turned out great!",
  "Feeling a bit lonely today. Reached out to an old friend.",
  "Yoga class was exactly what I needed.",
  "Exciting news at work - got recognized for my efforts.",
  "Feeling under the weather. Resting and hydrating.",
  "Journaled for 20 minutes. Helped process some emotions.",
  "Spontaneous road trip. Adventure feeds the soul.",
]

const moodTags = [
  ["work", "productive"],
  ["exercise", "energy"],
  ["social", "friends"],
  ["family", "gratitude"],
  ["stress", "work"],
  ["sleep", "tired"],
  ["mindfulness", "meditation"],
  ["social", "food"],
  ["work", "stress"],
  ["nature", "exercise"],
  ["relax", "reading"],
  ["stress", "conflict"],
  ["work", "achievement"],
  ["food", "creative"],
  ["social", "lonely"],
  ["exercise", "yoga"],
  ["work", "achievement"],
  ["health", "rest"],
  ["mindfulness", "journaling"],
  ["travel", "adventure"],
]

function generateMockMoodEntries() {
  const entries: Array<{
    id: string
    mood: number
    energy_level: number
    sleep_quality: number
    notes: string
    tags: string[]
    entry_date: string
    created_at: string
  }> = []

  for (let dayOffset = 0; dayOffset < 60; dayOffset++) {
    const date = new Date(Date.now() - dayOffset * 24 * 60 * 60 * 1000)
    const dateStr = date.toISOString().split("T")[0]
    const idx = dayOffset % 20

    // Generate mood that has a general upward trend with natural variation
    const baseMood = 3 + Math.sin(dayOffset * 0.4) * 1.5
    const mood = Math.max(1, Math.min(5, Math.round(baseMood + (Math.sin(dayOffset * 1.7) * 0.8))))

    // Energy correlates loosely with mood
    const energy = Math.max(1, Math.min(5, mood + Math.round(Math.sin(dayOffset * 0.9) * 1.2)))

    // Sleep quality varies independently
    const sleep = Math.max(1, Math.min(5, 3 + Math.round(Math.sin(dayOffset * 0.6 + 1) * 1.5)))

    entries.push({
      id: `mock-me${dayOffset + 1}`,
      mood,
      energy_level: energy,
      sleep_quality: sleep,
      notes: moodNotes[idx],
      tags: moodTags[idx],
      entry_date: dateStr,
      created_at: date.toISOString(),
    })
  }

  return entries
}

export const mockMoodEntries = generateMockMoodEntries()

// Mock trips for Travel Planner
export const mockTrips = [
  {
    id: "mock-t1",
    destination: "Tokyo, Japan",
    description: "Explore temples, food markets, and the vibrant Shibuya district.",
    status: "completed",
    start_date: "2025-11-10",
    end_date: "2025-11-20",
    budget: 3500,
    currency: "USD",
    cover_color: "#ef4444",
    tags: ["culture", "food", "adventure"],
    created_at: "2025-10-01T08:00:00Z",
  },
  {
    id: "mock-t2",
    destination: "Paris, France",
    description: "A romantic week visiting the Eiffel Tower, Louvre, and Montmartre.",
    status: "booked",
    start_date: "2026-04-15",
    end_date: "2026-04-22",
    budget: 4200,
    currency: "USD",
    cover_color: "#3b82f6",
    tags: ["romantic", "culture", "food"],
    created_at: "2026-01-15T10:00:00Z",
  },
  {
    id: "mock-t3",
    destination: "Bali, Indonesia",
    description: "Surf, yoga retreats, and rice terrace hikes.",
    status: "planning",
    start_date: "2026-07-01",
    end_date: "2026-07-14",
    budget: 2800,
    currency: "USD",
    cover_color: "#22c55e",
    tags: ["beach", "wellness", "nature"],
    created_at: "2026-01-20T14:00:00Z",
  },
  {
    id: "mock-t4",
    destination: "New York City, USA",
    description: "Broadway shows, Central Park, and world-class dining.",
    status: "completed",
    start_date: "2025-12-20",
    end_date: "2025-12-27",
    budget: 3000,
    currency: "USD",
    cover_color: "#f59e0b",
    tags: ["city", "food", "entertainment"],
    created_at: "2025-11-05T09:00:00Z",
  },
  {
    id: "mock-t5",
    destination: "Iceland",
    description: "Northern lights, geysers, and the Golden Circle road trip.",
    status: "planning",
    start_date: "2026-09-10",
    end_date: "2026-09-18",
    budget: 5000,
    currency: "USD",
    cover_color: "#6366f1",
    tags: ["adventure", "nature", "road-trip"],
    created_at: "2026-02-01T12:00:00Z",
  },
  {
    id: "mock-t6",
    destination: "Barcelona, Spain",
    description: "Gaudi architecture, tapas crawl, and beach days.",
    status: "booked",
    start_date: "2026-05-20",
    end_date: "2026-05-28",
    budget: 2500,
    currency: "USD",
    cover_color: "#ec4899",
    tags: ["beach", "culture", "food"],
    created_at: "2026-02-05T11:00:00Z",
  },
]

// Mock trip activities
export const mockTripActivities = [
  // Tokyo activities
  { id: "mock-ta1", trip_id: "mock-t1", title: "Visit Senso-ji Temple", description: "Tokyo's oldest temple in Asakusa.", activity_date: "2025-11-11", start_time: "09:00", end_time: "11:00", location: "Asakusa", category: "sightseeing", cost: 0, is_booked: true, created_at: "2025-10-01T08:00:00Z" },
  { id: "mock-ta2", trip_id: "mock-t1", title: "Tsukiji Outer Market Tour", description: "Fresh sushi and street food tasting.", activity_date: "2025-11-11", start_time: "12:00", end_time: "14:00", location: "Tsukiji", category: "food", cost: 45, is_booked: true, created_at: "2025-10-01T08:00:00Z" },
  { id: "mock-ta3", trip_id: "mock-t1", title: "Shibuya Crossing & Harajuku", description: "Shopping and people-watching.", activity_date: "2025-11-12", start_time: "10:00", end_time: "16:00", location: "Shibuya", category: "sightseeing", cost: 0, is_booked: false, created_at: "2025-10-01T08:00:00Z" },
  { id: "mock-ta4", trip_id: "mock-t1", title: "Shinkansen to Kyoto", description: "Bullet train day trip.", activity_date: "2025-11-14", start_time: "07:00", end_time: "09:30", location: "Tokyo Station", category: "transport", cost: 130, is_booked: true, created_at: "2025-10-01T08:00:00Z" },
  // Paris activities
  { id: "mock-ta5", trip_id: "mock-t2", title: "Eiffel Tower Summit", description: "Sunset visit to the top.", activity_date: "2026-04-16", start_time: "17:00", end_time: "20:00", location: "Champ de Mars", category: "sightseeing", cost: 26, is_booked: true, created_at: "2026-01-15T10:00:00Z" },
  { id: "mock-ta6", trip_id: "mock-t2", title: "Louvre Museum", description: "Half-day guided tour.", activity_date: "2026-04-17", start_time: "09:00", end_time: "13:00", location: "Louvre", category: "sightseeing", cost: 22, is_booked: true, created_at: "2026-01-15T10:00:00Z" },
  { id: "mock-ta7", trip_id: "mock-t2", title: "Seine River Cruise", description: "Evening dinner cruise.", activity_date: "2026-04-18", start_time: "19:00", end_time: "22:00", location: "Pont Neuf", category: "activity", cost: 95, is_booked: false, created_at: "2026-01-15T10:00:00Z" },
  { id: "mock-ta8", trip_id: "mock-t2", title: "Montmartre Walking Tour", description: "Street art and Sacre-Coeur.", activity_date: "2026-04-19", start_time: "10:00", end_time: "13:00", location: "Montmartre", category: "sightseeing", cost: 15, is_booked: false, created_at: "2026-01-15T10:00:00Z" },
  // NYC activities
  { id: "mock-ta9", trip_id: "mock-t4", title: "Broadway: Hamilton", description: "Orchestra seats.", activity_date: "2025-12-21", start_time: "19:00", end_time: "22:00", location: "Richard Rodgers Theatre", category: "activity", cost: 280, is_booked: true, created_at: "2025-11-05T09:00:00Z" },
  { id: "mock-ta10", trip_id: "mock-t4", title: "Central Park Walk", description: "Bethesda Fountain and The Met.", activity_date: "2025-12-22", start_time: "10:00", end_time: "15:00", location: "Central Park", category: "sightseeing", cost: 0, is_booked: false, created_at: "2025-11-05T09:00:00Z" },
  { id: "mock-ta11", trip_id: "mock-t4", title: "Hotel Check-in", description: "The Standard, High Line.", activity_date: "2025-12-20", start_time: "15:00", end_time: "16:00", location: "Meatpacking District", category: "accommodation", cost: 0, is_booked: true, created_at: "2025-11-05T09:00:00Z" },
  // Barcelona activities
  { id: "mock-ta12", trip_id: "mock-t6", title: "Sagrada Familia Tour", description: "Skip-the-line guided tour.", activity_date: "2026-05-21", start_time: "09:00", end_time: "11:30", location: "Eixample", category: "sightseeing", cost: 35, is_booked: true, created_at: "2026-02-05T11:00:00Z" },
  { id: "mock-ta13", trip_id: "mock-t6", title: "La Boqueria Market", description: "Tapas and fresh juice.", activity_date: "2026-05-21", start_time: "12:30", end_time: "14:00", location: "La Rambla", category: "food", cost: 25, is_booked: false, created_at: "2026-02-05T11:00:00Z" },
  { id: "mock-ta14", trip_id: "mock-t6", title: "Barceloneta Beach", description: "Beach day and seafood paella.", activity_date: "2026-05-23", start_time: "10:00", end_time: "17:00", location: "Barceloneta", category: "activity", cost: 0, is_booked: false, created_at: "2026-02-05T11:00:00Z" },
]

// Mock trip expenses
export const mockTripExpenses = [
  // Tokyo expenses
  { id: "mock-te1", trip_id: "mock-t1", title: "Round-trip flights", amount: 1100, category: "transport", expense_date: "2025-11-10", notes: "ANA direct from LAX", created_at: "2025-10-01T08:00:00Z" },
  { id: "mock-te2", trip_id: "mock-t1", title: "Hotel Shinjuku (10 nights)", amount: 1200, category: "accommodation", expense_date: "2025-11-10", notes: "Shinjuku Granbell", created_at: "2025-10-01T08:00:00Z" },
  { id: "mock-te3", trip_id: "mock-t1", title: "JR Rail Pass (7 day)", amount: 230, category: "transport", expense_date: "2025-11-10", notes: null, created_at: "2025-10-05T08:00:00Z" },
  { id: "mock-te4", trip_id: "mock-t1", title: "Tsukiji food tour", amount: 45, category: "food", expense_date: "2025-11-11", notes: null, created_at: "2025-10-01T08:00:00Z" },
  { id: "mock-te5", trip_id: "mock-t1", title: "Souvenirs & shopping", amount: 320, category: "shopping", expense_date: "2025-11-15", notes: "Akihabara electronics + gifts", created_at: "2025-11-15T08:00:00Z" },
  { id: "mock-te6", trip_id: "mock-t1", title: "Restaurants & street food", amount: 380, category: "food", expense_date: "2025-11-18", notes: "Ramen, sushi, yakitori over 10 days", created_at: "2025-11-18T08:00:00Z" },
  // Paris expenses
  { id: "mock-te7", trip_id: "mock-t2", title: "Round-trip flights", amount: 850, category: "transport", expense_date: "2026-04-15", notes: "Air France via CDG", created_at: "2026-01-20T10:00:00Z" },
  { id: "mock-te8", trip_id: "mock-t2", title: "Boutique hotel (7 nights)", amount: 1400, category: "accommodation", expense_date: "2026-04-15", notes: "Le Marais area", created_at: "2026-01-20T10:00:00Z" },
  { id: "mock-te9", trip_id: "mock-t2", title: "Eiffel Tower tickets", amount: 52, category: "activities", expense_date: "2026-04-16", notes: "2x summit tickets", created_at: "2026-01-20T10:00:00Z" },
  { id: "mock-te10", trip_id: "mock-t2", title: "Louvre tickets", amount: 44, category: "activities", expense_date: "2026-04-17", notes: "2x guided tour", created_at: "2026-01-20T10:00:00Z" },
  // NYC expenses
  { id: "mock-te11", trip_id: "mock-t4", title: "Round-trip flights", amount: 450, category: "transport", expense_date: "2025-12-20", notes: "Delta from SFO", created_at: "2025-11-05T09:00:00Z" },
  { id: "mock-te12", trip_id: "mock-t4", title: "Hotel (7 nights)", amount: 1750, category: "accommodation", expense_date: "2025-12-20", notes: "The Standard, High Line", created_at: "2025-11-05T09:00:00Z" },
  { id: "mock-te13", trip_id: "mock-t4", title: "Hamilton tickets", amount: 560, category: "activities", expense_date: "2025-12-21", notes: "2x orchestra", created_at: "2025-11-05T09:00:00Z" },
  { id: "mock-te14", trip_id: "mock-t4", title: "Dining & drinks", amount: 420, category: "food", expense_date: "2025-12-25", notes: "Various restaurants over the week", created_at: "2025-12-25T09:00:00Z" },
  // Barcelona expenses
  { id: "mock-te15", trip_id: "mock-t6", title: "Round-trip flights", amount: 680, category: "transport", expense_date: "2026-05-20", notes: "Vueling direct", created_at: "2026-02-10T11:00:00Z" },
  { id: "mock-te16", trip_id: "mock-t6", title: "Airbnb (8 nights)", amount: 720, category: "accommodation", expense_date: "2026-05-20", notes: "Gothic Quarter apartment", created_at: "2026-02-10T11:00:00Z" },
  { id: "mock-te17", trip_id: "mock-t6", title: "Sagrada Familia tickets", amount: 70, category: "activities", expense_date: "2026-05-21", notes: "2x skip-the-line", created_at: "2026-02-10T11:00:00Z" },
]
