/**
 * Seed script for interview experiences with reviews and tags
 * Usage: npx tsx scripts/seed-interviews.ts
 */

const GRAPHQL_ENDPOINT = 'http://localhost:8080/graphql';

interface CreateInterviewInput {
  company: string;
  role: string;
  level?: string;
  stage?: string;
  location?: string;
  rating: number;
  comment: string;
  reviewerName?: string;
  roundType?: string;
  tagKeys?: string[];
  interviewerInitials?: string;
  outcome?: string;
}

const seedData: CreateInterviewInput[] = [
  // Google - Software Engineer (Mix of positive and negative)
  {
    company: 'Google',
    role: 'Software Engineer',
    level: 'L4',
    stage: 'Onsite',
    location: 'Mountain View, CA',
    rating: 2,
    comment: 'The recruiter ghosted me after the phone screen. No feedback provided despite multiple follow-ups. Very disappointing experience from such a large company.',
    reviewerName: 'Anonymous',
    roundType: 'RECRUITER',
    tagKeys: ['GHOST_JOB', 'NO_FEEDBACK'],
    outcome: 'WITHDREW'
  },
  {
    company: 'Google',
    role: 'Software Engineer',
    level: 'L4',
    stage: 'Onsite',
    location: 'Mountain View, CA',
    rating: 5,
    comment: 'Excellent process! Well organized from start to finish. The interviewers were professional and provided clear feedback at each stage. Questions were challenging but fair.',
    reviewerName: 'Sarah K.',
    roundType: 'ONSITE',
    tagKeys: ['WELL_ORGANIZED', 'PROMPT_FEEDBACK'],
    interviewerInitials: 'JM',
    outcome: 'OFFER'
  },
  {
    company: 'Google',
    role: 'Software Engineer',
    level: 'L4',
    stage: 'Onsite',
    location: 'Mountain View, CA',
    rating: 3,
    comment: 'The coding questions were relevant to the role. However, the process took over 3 months from application to offer. Communication could have been better.',
    reviewerName: 'Michael T.',
    roundType: 'CODING',
    tagKeys: ['LONG_PROCESS'],
    interviewerInitials: 'AS'
  },
  {
    company: 'Google',
    role: 'Software Engineer',
    level: 'L4',
    stage: 'Onsite',
    location: 'Mountain View, CA',
    rating: 1,
    comment: 'The system design interviewer was extremely disrespectful and dismissive. They interrupted constantly and made condescending remarks. Unprofessional behavior.',
    reviewerName: 'Anonymous',
    roundType: 'SYSTEM_DESIGN',
    tagKeys: ['DISRESPECTFUL'],
    interviewerInitials: 'PK',
    outcome: 'REJECTED'
  },
  {
    company: 'Google',
    role: 'Software Engineer',
    level: 'L4',
    stage: 'Onsite',
    location: 'Mountain View, CA',
    rating: 4,
    comment: 'Great experience overall. The behavioral round was well structured and the questions were thoughtful. Got prompt feedback within a week.',
    reviewerName: 'Alex P.',
    roundType: 'BEHAVIORAL',
    tagKeys: ['WELL_ORGANIZED', 'PROMPT_FEEDBACK'],
    interviewerInitials: 'RD',
    outcome: 'OFFER'
  },
  {
    company: 'Google',
    role: 'Software Engineer',
    level: 'L4',
    stage: 'Onsite',
    location: 'Mountain View, CA',
    rating: 2,
    comment: 'Never received any feedback after my onsite. The process took 2 months and then they just sent a generic rejection email. Very frustrating.',
    reviewerName: 'Anonymous',
    roundType: 'ONSITE',
    tagKeys: ['NO_FEEDBACK', 'LONG_PROCESS']
  },

  // Meta - Product Manager (Mostly negative)
  {
    company: 'Meta',
    role: 'Product Manager',
    level: 'IC4',
    stage: 'Phone Screen',
    location: 'Menlo Park, CA',
    rating: 2,
    comment: 'The role description was completely different from what they asked in the interview. Seemed like a misalignment between recruiting and the hiring team.',
    reviewerName: 'Jordan L.',
    roundType: 'PHONE_SCREEN',
    tagKeys: ['MISALIGNED_ROLE'],
    outcome: 'REJECTED'
  },
  {
    company: 'Meta',
    role: 'Product Manager',
    level: 'IC4',
    stage: 'Phone Screen',
    location: 'Menlo Park, CA',
    rating: 1,
    comment: 'Applied to this role but never heard back. Appears to be a ghost job posting. Wasted my time preparing.',
    reviewerName: 'Anonymous',
    roundType: 'RECRUITER',
    tagKeys: ['GHOST_JOB', 'NO_FEEDBACK']
  },
  {
    company: 'Meta',
    role: 'Product Manager',
    level: 'IC4',
    stage: 'Phone Screen',
    location: 'Menlo Park, CA',
    rating: 2,
    comment: 'The case study questions were unreasonably difficult and not representative of the actual role. Felt more like a consulting interview.',
    reviewerName: 'Taylor M.',
    roundType: 'CASE_STUDY',
    tagKeys: ['UNREASONABLE_DIFFICULTY', 'MISALIGNED_ROLE'],
    outcome: 'REJECTED'
  },
  {
    company: 'Meta',
    role: 'Product Manager',
    level: 'IC4',
    stage: 'Phone Screen',
    location: 'Menlo Park, CA',
    rating: 3,
    comment: 'Decent interview process but took forever. From application to final decision was nearly 4 months. Communication was sparse.',
    reviewerName: 'Casey W.',
    roundType: 'ONSITE',
    tagKeys: ['LONG_PROCESS', 'NO_FEEDBACK'],
    outcome: 'OFFER'
  },

  // Amazon - Senior SDE (Mixed reviews)
  {
    company: 'Amazon',
    role: 'Senior Software Development Engineer',
    level: 'SDE II',
    stage: 'Virtual Onsite',
    location: 'Seattle, WA',
    rating: 4,
    comment: 'Well organized interview loop. Each interviewer focused on different leadership principles. Received feedback within 3 days. Professional throughout.',
    reviewerName: 'Chris R.',
    roundType: 'BEHAVIORAL',
    tagKeys: ['WELL_ORGANIZED', 'PROMPT_FEEDBACK'],
    interviewerInitials: 'DL',
    outcome: 'OFFER'
  },
  {
    company: 'Amazon',
    role: 'Senior Software Development Engineer',
    level: 'SDE II',
    stage: 'Virtual Onsite',
    location: 'Seattle, WA',
    rating: 5,
    comment: 'Outstanding experience. The system design round was challenging but the interviewer was supportive and provided hints when needed. Very positive interaction.',
    reviewerName: 'Sam B.',
    roundType: 'SYSTEM_DESIGN',
    tagKeys: ['WELL_ORGANIZED'],
    interviewerInitials: 'MJ',
    outcome: 'OFFER'
  },
  {
    company: 'Amazon',
    role: 'Senior Software Development Engineer',
    level: 'SDE II',
    stage: 'Virtual Onsite',
    location: 'Seattle, WA',
    rating: 2,
    comment: 'The coding round had questions that were far beyond the scope of the role. Felt like they were testing for a different level entirely.',
    reviewerName: 'Anonymous',
    roundType: 'CODING',
    tagKeys: ['UNREASONABLE_DIFFICULTY'],
    outcome: 'REJECTED'
  },

  // Startup - Full Stack Engineer (Positive)
  {
    company: 'Stripe',
    role: 'Software Engineer',
    level: 'IC3',
    stage: 'Onsite',
    location: 'San Francisco, CA',
    rating: 5,
    comment: 'Fantastic interview experience. Everyone was friendly and professional. The process was efficient and I got feedback after each round.',
    reviewerName: 'Morgan K.',
    roundType: 'ONSITE',
    tagKeys: ['WELL_ORGANIZED', 'PROMPT_FEEDBACK'],
    interviewerInitials: 'AB',
    outcome: 'OFFER'
  },
  {
    company: 'Stripe',
    role: 'Software Engineer',
    level: 'IC3',
    stage: 'Onsite',
    location: 'San Francisco, CA',
    rating: 5,
    comment: 'Really enjoyed the coding interview. Questions were practical and related to real work scenarios. The interviewer was collaborative.',
    reviewerName: 'Riley H.',
    roundType: 'CODING',
    tagKeys: ['WELL_ORGANIZED'],
    interviewerInitials: 'KL',
    outcome: 'OFFER'
  }
];

async function graphqlRequest(query: string, variables?: any) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
  });

  const result = await response.json();

  if (result.errors) {
    console.error('GraphQL Error:', JSON.stringify(result.errors, null, 2));
    throw new Error(result.errors[0].message);
  }

  return result.data;
}

async function createInterviewWithReview(input: CreateInterviewInput) {
  const mutation = `
    mutation CreateInterviewWithReview($input: CreateInterviewWithReviewInput!) {
      createInterviewWithReview(input: $input) {
        interviewId
        reviewId
        status
        isNewInterview
      }
    }
  `;

  try {
    const data = await graphqlRequest(mutation, { input });
    return data.createInterviewWithReview;
  } catch (error) {
    console.error(`Failed to create interview for ${input.company} - ${input.role}:`, error);
    throw error;
  }
}

async function seed() {
  console.log('🌱 Seeding interview experiences...\n');

  let successCount = 0;
  let errorCount = 0;

  for (const input of seedData) {
    try {
      const result = await createInterviewWithReview(input);
      console.log(`✅ Created ${input.company} - ${input.role} (Interview ID: ${result.interviewId}, Review ID: ${result.reviewId})`);
      successCount++;

      // Small delay to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`❌ Failed to create ${input.company} - ${input.role}`);
      errorCount++;
    }
  }

  console.log(`\n🎉 Seeding complete!`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
}

seed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Seed script failed:', error);
    process.exit(1);
  });
