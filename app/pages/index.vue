<template>
  <div>
    <!-- Hero Section -->
    <UPageHero
      title="Plan, Share, Explore with Trip Buddy"
      description="From itinerary planning to budget tracking, find travel partners and discover amazing places. Everything you need for unforgettable journeys, all in one app."
      :links="[
        {
          label: 'Start Planning',
          to: '/register',
          trailingIcon: 'i-lucide-arrow-right',
          size: 'xl',
        },
        {
          label: 'Explore Places',
          to: '/discover',
          icon: 'i-lucide-compass',
          size: 'xl',
          color: 'neutral',
          variant: 'subtle',
        },
      ]"
      :ui="{
        title: 'text-4xl sm:text-5xl lg:text-5xl font-bold tracking-tight',
        description: 'text-md sm:text-xl text-slate-600 dark:text-slate-400',
        headline: 'flex items-center justify-center',
        container: 'lg:py-20 py-8 sm:py-12',
      }"
    >
      <template #headline>
        <NuxtImg
          src="/images/logo_hero.png"
          alt="Trip Buddy"
          width="376"
          height="auto"
        />
      </template>
    </UPageHero>

    <!-- Features Section -->
    <UPageSection
      id="features"
      title="Everything for Your Travel Journey"
      description="From planning to exploring, we've got you covered with powerful features designed for modern travelers."
      :features="[
        {
          icon: 'i-lucide-calendar-days',
          title: 'Smart Itinerary Planning',
          description:
            'Create detailed day-by-day itineraries with activities, accommodations, and transportation. Share and collaborate with your travel group in real-time.',
        },
        {
          icon: 'i-lucide-wallet',
          title: 'Budget Tracking',
          description:
            'Set budgets, track expenses in multiple currencies, and get alerts when approaching limits. Never overspend on your travels again.',
        },
        {
          icon: 'i-lucide-users',
          title: 'Travel Groups',
          description:
            'Create groups, invite friends, and plan trips together. Vote on activities, share announcements, and keep everyone in sync.',
        },
        {
          icon: 'i-lucide-split',
          title: 'Expense Splitting',
          description:
            'Split costs fairly among travel companions. Track who owes whom and settle up easily with integrated payment options.',
        },
        {
          icon: 'i-lucide-heart-handshake',
          title: 'Find Travel Partners',
          description:
            'Connect with compatible travelers based on destinations, interests, and travel styles. Never travel alone unless you want to.',
        },
        {
          icon: 'i-lucide-map-pin',
          title: 'Discover Places',
          description:
            'Find tourist attractions, restaurants, and hidden gems. Read authentic reviews and add places directly to your itinerary.',
        },
      ]"
    />

    <!-- Stats Section -->
    <UPageSection class="bg-slate-50 dark:bg-slate-900/50">
      <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
        <div>
          <p class="text-4xl font-bold text-sky-500">10K+</p>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Active Travelers
          </p>
        </div>
        <div>
          <p class="text-4xl font-bold text-cyan-500">50K+</p>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Trips Planned
          </p>
        </div>
        <div>
          <p class="text-4xl font-bold text-emerald-500">100+</p>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Countries
          </p>
        </div>
        <div>
          <p class="text-4xl font-bold text-amber-500">25K+</p>
          <p class="text-sm text-slate-600 dark:text-slate-400 mt-1">Reviews</p>
        </div>
      </div>
    </UPageSection>

    <!-- How It Works -->
    <UPageSection
      title="How It Works"
      description="Get started in three simple steps"
    >
      <div class="grid md:grid-cols-3 gap-8">
        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full bg-sky-100 dark:bg-sky-900 text-sky-600 dark:text-sky-400 font-bold"
              >
                1
              </div>
              <h3 class="font-semibold text-lg">Create Your Trip</h3>
            </div>
          </template>
          <p class="text-slate-600 dark:text-slate-400">
            Set your destination, dates, and budget. Invite friends or go solo -
            it's your adventure.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900 text-cyan-600 dark:text-cyan-400 font-bold"
              >
                2
              </div>
              <h3 class="font-semibold text-lg">Plan Together</h3>
            </div>
          </template>
          <p class="text-slate-600 dark:text-slate-400">
            Add activities, discover places, and collaborate with your group.
            Everything syncs in real-time.
          </p>
        </UCard>

        <UCard>
          <template #header>
            <div class="flex items-center gap-3">
              <div
                class="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400 font-bold"
              >
                3
              </div>
              <h3 class="font-semibold text-lg">Travel & Share</h3>
            </div>
          </template>
          <p class="text-slate-600 dark:text-slate-400">
            Track expenses on the go, share reviews, and create memories. Your
            trip data is always with you.
          </p>
        </UCard>
      </div>
    </UPageSection>

    <!-- CTA Section -->
    <UPageSection>
      <UPageCTA
        title="Ready for Your Next Adventure?"
        description="Join thousands of travelers planning amazing trips with Trip Buddy. Start for free today."
        variant="subtle"
        :links="[
          {
            label: 'Create Free Account',
            to: '/register',
            trailingIcon: 'i-lucide-arrow-right',
          },
          {
            label: 'Learn More',
            to: '/about',
            color: 'neutral',
            variant: 'outline',
          },
        ]"
      />
    </UPageSection>
  </div>
</template>
