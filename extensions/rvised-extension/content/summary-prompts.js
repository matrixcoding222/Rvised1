// Enhanced Summary Prompts for Rvised
// This module provides mode-specific prompts with depth variations

(function() {
  'use strict';

  // Variation helpers for distinct responses
  const getRandomElement = (array) => array[Math.floor(Math.random() * array.length)];
  
  const getTimeBasedVariation = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  // Analogies and examples pools for variation
  const STUDENT_ANALOGIES = [
    "Think of it like learning to ride a bike",
    "It's similar to learning a new language",
    "Imagine you're building with LEGO blocks",
    "Like following a recipe for the first time",
    "Picture it as learning to play a video game"
  ];

  const BUILD_METRICS = [
    "10x improvement",
    "90% efficiency gain",
    "5x faster implementation",
    "70% cost reduction",
    "3x performance boost"
  ];

  const DEEP_FRAMEWORKS = [
    "Porter's Five Forces",
    "Jobs-to-be-Done",
    "Disruption Theory",
    "Network Effects",
    "Platform Economics"
  ];

  // Main prompt generator
  window.generateSummaryPrompt = function(mode, depth, videoTitle, channelName) {
    const variation = {
      analogy: getRandomElement(STUDENT_ANALOGIES),
      metric: getRandomElement(BUILD_METRICS),
      framework: getRandomElement(DEEP_FRAMEWORKS),
      timeOfDay: getTimeBasedVariation()
    };

    const prompts = {
      student: {
        quick: `Generate a beginner-friendly YouTube video summary that a complete novice could understand.
Video: "${videoTitle}" by ${channelName}

Structure:
1. ONE SENTENCE: What is this video teaching? (super simple)
2. THE BIG IDEA: Explain the main concept like I'm 15
3. 3 KEY POINTS: Use simple language, avoid jargon
4. WHY IT MATTERS: How does this help beginners?
5. FIRST STEP: What's the easiest thing to try today?

Rules:
- Define any technical terms in parentheses
- Use this analogy if relevant: "${variation.analogy}"
- Max 200 words total
- Encouraging, supportive tone
- Focus on understanding, not implementing
- Add a ${variation.timeOfDay} greeting to make it personal`,

        standard: `Create a learning-optimized summary for students new to this topic.
Video: "${videoTitle}" by ${channelName}

Structure:
1. WHAT YOU'LL LEARN (1 sentence overview)
2. BACKGROUND CONTEXT (Why this topic exists)
3. MAIN CONCEPTS (5-7 points with simple explanations)
4. REAL EXAMPLES (2-3 concrete scenarios)
5. COMMON MISTAKES (What beginners get wrong)
6. PRACTICE SUGGESTIONS (Low-risk ways to try)
7. QUIZ QUESTIONS (3 actual questions with answers)

Rules:
- Explain like a patient teacher
- Build concepts step-by-step
- Include "${variation.analogy}" as a comparison
- 400-500 words maximum
- Glossary of new terms at end
- Consider the ${variation.timeOfDay} study session context`,

        detailed: `Create a comprehensive educational summary for dedicated learners.
Video: "${videoTitle}" by ${channelName}

Include:
1. PREREQUISITES (What you should know first)
2. COMPLETE OVERVIEW (Full topic introduction)
3. DETAILED BREAKDOWN (All major points explained)
4. VISUAL CONCEPTS (Describe diagrams/charts needed)
5. STEP-BY-STEP LEARNING PATH
6. CONNECTIONS (How this relates to other topics)
7. DEEPER RESOURCES (What to study next)
8. REFLECTION QUESTIONS (5 thought-provoking questions)
9. STUDY NOTES TEMPLATE

Rules:
- Textbook-quality explanations
- Include historical context
- Address "why" before "how"
- Use multiple teaching analogies including "${variation.analogy}"
- 800-1000 words
- Academic but accessible tone
- Optimize for ${variation.timeOfDay} learning`
      },

      build: {
        quick: `Generate an action-focused summary for someone who wants to implement immediately.
Video: "${videoTitle}" by ${channelName}

Structure:
1. THE GOAL: What you'll build/achieve (1 sentence)
2. REQUIREMENTS: Tools/resources needed (bullet list)
3. 3 QUICK WINS: Things you can do in next 30 minutes
4. CODE/TEMPLATE: One specific example to copy
5. COMMON GOTCHA: Main thing that trips people up

Rules:
- Skip theory, focus on doing
- Include exact commands/steps
- Target metric: ${variation.metric}
- "Copy this" mentality
- Max 200 words
- Add timestamps for a ${variation.timeOfDay} sprint session`,

        standard: `Create an implementation guide for builders and practitioners.
Video: "${videoTitle}" by ${channelName}

Structure:
1. END RESULT (What you'll have built)
2. TOOLS SETUP (Exact requirements with links)
3. IMPLEMENTATION STEPS (Numbered, specific actions)
4. CODE SNIPPETS / TEMPLATES (Copy-paste ready)
5. TESTING CHECKLIST (How to verify it works)
6. OPTIMIZATION TIPS (Make it ${variation.metric})
7. REAL METRICS (Expected results with numbers)

Rules:
- Zero fluff, all actionable
- Include exact commands, URLs, code
- Time estimates for each step
- "Build first, understand later" approach
- 400-500 words
- Professional, efficient tone
- Optimized for ${variation.timeOfDay} productivity`,

        detailed: `Create a complete implementation blueprint for serious builders.
Video: "${videoTitle}" by ${channelName}

Include:
1. PROJECT OVERVIEW (Architecture, timeline, costs)
2. COMPLETE SETUP GUIDE (Every tool, account, config)
3. PHASE-BY-PHASE BUILD (With checkpoints)
4. FULL CODE EXAMPLES (Production-ready)
5. DEBUGGING GUIDE (Common errors + fixes)
6. SCALING STRATEGIES (From MVP to ${variation.metric})
7. METRICS DASHBOARD (What to track)
8. AUTOMATION OPPORTUNITIES
9. COST ANALYSIS (Detailed breakdown)

Rules:
- Production-grade instructions
- Include edge cases and errors
- Performance considerations
- Security best practices
- 800-1000 words
- Expert practitioner tone
- Account for ${variation.timeOfDay} deployment windows`
      },

      deep: {
        quick: `Generate a strategic insight summary for analytical thinkers.
Video: "${videoTitle}" by ${channelName}

Structure:
1. KEY INSIGHT: The most important takeaway from this video
2. STRATEGIC CONTEXT: Why this matters now
3. 3 KEY INSIGHTS: Non-obvious implications
4. MENTAL MODEL: Apply ${variation.framework} thinking
5. CRITICAL QUESTION: What this makes you reconsider

Rules:
- Focus on "why" not "how"
- Connect to broader trends
- Challenge assumptions
- Thought-provoking over practical
- Max 200 words
- Consider ${variation.timeOfDay} reflection time`,

        standard: `Create a strategic analysis for deep thinkers and strategists.
Video: "${videoTitle}" by ${channelName}

Structure:
1. THESIS STATEMENT (Core argument)
2. MARKET CONTEXT (Industry implications)
3. STRATEGIC FRAMEWORK (Apply ${variation.framework})
4. COUNTERARGUMENTS (What critics would say)
5. SECOND-ORDER EFFECTS (Downstream impacts)
6. HISTORICAL PARALLELS (Similar disruptions)
7. FUTURE SCENARIOS (3 possible outcomes)
8. KEY DECISIONS (Strategic choices ahead)

Rules:
- MBA-level analysis
- Include market data and trends
- Question conventional wisdom
- Systems thinking approach
- 400-500 words
- Analytical, professional tone
- ${variation.timeOfDay} strategic review perspective`,

        detailed: `Create a comprehensive strategic deep dive for experts.
Video: "${videoTitle}" by ${channelName}

Include:
1. EXECUTIVE SUMMARY (C-suite level overview)
2. THEORETICAL FOUNDATIONS (${variation.framework} and other frameworks)
3. COMPETITIVE LANDSCAPE ANALYSIS
4. DISRUPTION POTENTIAL ASSESSMENT
5. STAKEHOLDER IMPACT MATRIX
6. RISK/OPPORTUNITY ANALYSIS
7. STRATEGIC RECOMMENDATIONS
8. IMPLEMENTATION ROADMAP
9. SUCCESS METRICS & KPIS
10. BIBLIOGRAPHY (Key sources to explore)

Rules:
- Consultant-quality analysis
- Include data visualizations descriptions
- Multi-perspective evaluation
- Long-term thinking (5-10 years)
- 800-1000 words
- Authoritative, evidence-based tone
- Formatted for ${variation.timeOfDay} board presentation`
      }
    };

    // Add dynamic elements based on video context
    const basePrompt = prompts[mode]?.[depth] || prompts.student.standard;
    
    // Add randomized instruction variations
    const additionalInstructions = [
      "\n\nIMPORTANT: Start with a hook that grabs attention.",
      "\n\nNOTE: Include surprising facts or statistics when relevant.",
      "\n\nFOCUS: Emphasize practical takeaways throughout.",
      "\n\nSTYLE: Use conversational language while maintaining professionalism.",
      "\n\nBONUS: Add a memorable quote or principle if applicable."
    ];
    
    return basePrompt + getRandomElement(additionalInstructions);
  };

  // Quiz prompt generator based on mode
  window.generateQuizPrompt = function(mode, summaryContent, videoTitle) {
    const quizPrompts = {
      student: `Based on this educational summary, create 5 beginner-friendly quiz questions:
"${summaryContent}"

Requirements:
- Multiple choice format (4 options each)
- Test understanding, not memorization
- Progressively increase difficulty
- Include hints for wrong answers
- Explain why the correct answer is right
- Use encouraging language`,

      build: `Based on this implementation summary, create 5 practical quiz questions:
"${summaryContent}"

Requirements:
- Focus on hands-on scenarios
- Test ability to troubleshoot
- Include code snippets or commands
- Real-world problem-solving
- Time/resource trade-offs
- "What would you do if..." format`,

      deep: `Based on this strategic analysis, create 5 thought-provoking quiz questions:
"${summaryContent}"

Requirements:
- Test strategic thinking
- Include case study scenarios
- Challenge assumptions
- Require critical analysis
- Open to interpretation (with best answer)
- MBA/consultant level complexity`
    };

    return quizPrompts[mode] || quizPrompts.student;
  };

  console.log('✅ Summary prompts module loaded');
})();