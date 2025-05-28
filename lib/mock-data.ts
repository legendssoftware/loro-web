export interface MockUser {
  id: string
  name: string
  email: string
  avatar?: string
  subscription: 'free' | 'pro' | 'business'
  joinDate: string
}

export interface MockCard {
  id: string
  name: string
  template: string
  personalInfo: {
    firstName: string
    lastName: string
    position: string
    company: string
    email: string
    phone: string
    bio: string
    website: string
    address: string
  }
  design: {
    template: string
    primaryColor: string
    secondaryColor: string
    font: string
  }
  images: {
    companyLogo?: string
    profilePhoto?: string
  }
  analytics: {
    views: number
    contacts: number
    shares: number
    viewsThisWeek: number[]
    topCountries: { country: string; views: number }[]
    deviceTypes: { type: string; percentage: number }[]
    recentViews: { date: string; views: number }[]
  }
  isPublished: boolean
  createdAt: string
  updatedAt: string
}

export interface MockTeamMember {
  id: string
  name: string
  email: string
  position: string
  avatar?: string
  role: 'admin' | 'editor' | 'viewer'
  joinDate: string
  status: 'active' | 'pending' | 'inactive'
}

export interface MockAnalytics {
  totalViews: number
  totalContacts: number
  totalShares: number
  viewsThisMonth: number
  contactsThisMonth: number
  sharesThisMonth: number
  growthPercentage: number
  topPerformingCards: { cardId: string; cardName: string; views: number }[]
  recentActivity: { type: string; cardName: string; timestamp: string; details: string }[]
  geographicData: { country: string; views: number; contacts: number }[]
  deviceAnalytics: { device: string; percentage: number; trend: number }[]
  timeSeriesData: { date: string; views: number; contacts: number; shares: number }[]
  earnings: { totalEarnings: number; currency: string; monthlyEarnings: number }
  subscriptionPricing: { 
    free: { price: number; currency: string; features: string[] }
    pro: { price: number; currency: string; features: string[] }
    business: { price: number; currency: string; features: string[] }
  }
  roiMetrics: {
    traditionalCardCosts: {
      printingCostPer1000: number
      averageReprintsPerYear: number
      designCostPerRedesign: number
      wastePercentage: number
      annualWasteForMediumTeam: number
    }
    kaadSavings: {
      setupCost: number
      monthlyCost: number
      updatesUnlimited: boolean
      conversionRateImprovement: number
      totalAnnualSavings: number
    }
    networkingROI: {
      totalNetworkingEvents: number
      averageContactsPerEvent: number
      conversionRate: number
      revenueInfluenced: number
      costPerQualityLead: number
    }
    teamMetrics: {
      teamSize: number
      brandConsistencyScore: number
      cardsNeverExpire: boolean
      centralizedManagement: boolean
    }
  }
}

class MockDataStore {
  private static instance: MockDataStore
  private user!: MockUser
  private cards!: MockCard[]
  private teamMembers!: MockTeamMember[]
  private analytics!: MockAnalytics

  constructor() {
    this.initializeData()
  }

  static getInstance(): MockDataStore {
    if (!MockDataStore.instance) {
      MockDataStore.instance = new MockDataStore()
    }
    return MockDataStore.instance
  }

  private initializeData() {
    this.user = this.loadFromStorage('kaad_user', this.getDefaultUser())
    this.cards = this.loadFromStorage('kaad_cards', this.getDefaultCards())
    this.teamMembers = this.loadFromStorage('kaad_team', this.getDefaultTeamMembers())
    this.analytics = this.loadFromStorage('kaad_analytics', this.getDefaultAnalytics())
  }

  private loadFromStorage<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  }

  private saveToStorage<T>(key: string, data: T): void {
    if (typeof window === 'undefined') return
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error('Failed to save to storage:', error)
    }
  }

  // Getters
  getUser(): MockUser { return this.user }
  getCards(): MockCard[] { return this.cards }
  getCard(id: string): MockCard | undefined { return this.cards.find(c => c.id === id) }
  getTeamMembers(): MockTeamMember[] { return this.teamMembers }
  getAnalytics(): MockAnalytics { return this.analytics }

  // Setters with persistence
  updateCard(id: string, updates: Partial<MockCard>): void {
    const index = this.cards.findIndex(c => c.id === id)
    if (index !== -1) {
      this.cards[index] = { ...this.cards[index], ...updates, updatedAt: new Date().toISOString() }
      this.saveToStorage('kaad_cards', this.cards)
      console.log('📝 Card Updated:', { id, updates })
    }
  }

  addCard(card: Omit<MockCard, 'id' | 'createdAt' | 'updatedAt'>): MockCard {
    const newCard: MockCard = {
      ...card,
      id: `card_${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    this.cards.push(newCard)
    this.saveToStorage('kaad_cards', this.cards)
    console.log('✨ New Card Created:', newCard)
    return newCard
  }

  deleteCard(id: string): boolean {
    const index = this.cards.findIndex(c => c.id === id)
    if (index !== -1) {
      this.cards.splice(index, 1)
      this.saveToStorage('kaad_cards', this.cards)
      console.log('🗑️ Card Deleted:', id)
      return true
    }
    return false
  }

  // Default data generators
  private getDefaultUser(): MockUser {
    return {
      id: 'user_1',
      name: 'Brandon Nhlanhla Nkawu',
      email: 'brandon@bnkawu.dev',
      avatar: 'https://avatars.githubusercontent.com/u/40022382?v=4',
      subscription: 'pro',
      joinDate: '2024-01-15'
    }
  }

  private getDefaultCards(): MockCard[] {
    return [
      {
        id: 'card_1',
        name: 'Personal Business Card',
        template: 'modern',
        personalInfo: {
          firstName: 'Brandon',
          lastName: 'Nkawu',
          position: 'Software Engineer & Digital Creator',
          company: 'BNN Digital Solutions',
          email: 'brandon@bnkawu.dev',
          phone: '+27 (0) 82 123-4567',
          bio: 'Full-stack developer passionate about creating innovative digital solutions.',
          website: 'www.bnkawu.dev',
          address: 'Cape Town, South Africa'
        },
        design: {
          template: 'modern',
          primaryColor: '#3b82f6',
          secondaryColor: '#10b981',
          font: 'inter'
        },
        images: {
          companyLogo: undefined,
          profilePhoto: undefined
        },
        analytics: {
          views: 1247,
          contacts: 89,
          shares: 23,
          viewsThisWeek: [45, 67, 23, 89, 34, 56, 78],
          topCountries: [
            { country: 'South Africa', views: 567 },
            { country: 'United Kingdom', views: 234 },
            { country: 'United States', views: 178 },
            { country: 'Nigeria', views: 145 },
            { country: 'Kenya', views: 123 }
          ],
          deviceTypes: [
            { type: 'Mobile', percentage: 68 },
            { type: 'Desktop', percentage: 28 },
            { type: 'Tablet', percentage: 4 }
          ],
          recentViews: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            views: Math.floor(Math.random() * 50) + 10
          }))
        },
        isPublished: true,
        createdAt: '2024-01-15T10:30:00Z',
        updatedAt: '2024-01-20T14:22:00Z'
      },
      {
        id: 'card_2',
        name: 'Sales Team Card',
        template: 'classic',
        personalInfo: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          position: 'Sales Director',
          company: 'Acme Inc.',
          email: 'sarah@acmeinc.com',
          phone: '+1 (555) 123-4568',
          bio: 'Driving revenue growth through strategic partnerships.',
          website: 'www.acmeinc.com',
          address: '123 Business Ave, Suite 100, San Francisco, CA 94107'
        },
        design: {
          template: 'classic',
          primaryColor: '#10b981',
          secondaryColor: '#047857',
          font: 'roboto'
        },
        images: {
          companyLogo: undefined,
          profilePhoto: undefined
        },
        analytics: {
          views: 892,
          contacts: 67,
          shares: 18,
          viewsThisWeek: [32, 45, 28, 67, 41, 52, 63],
          topCountries: [
            { country: 'United States', views: 423 },
            { country: 'Canada', views: 189 },
            { country: 'Mexico', views: 134 },
            { country: 'Brazil', views: 89 },
            { country: 'Argentina', views: 57 }
          ],
          deviceTypes: [
            { type: 'Mobile', percentage: 72 },
            { type: 'Desktop', percentage: 25 },
            { type: 'Tablet', percentage: 3 }
          ],
          recentViews: Array.from({ length: 30 }, (_, i) => ({
            date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            views: Math.floor(Math.random() * 40) + 5
          }))
        },
        isPublished: true,
        createdAt: '2024-01-18T09:15:00Z',
        updatedAt: '2024-01-21T11:45:00Z'
      }
    ]
  }

  // Diverse South African user profiles for hero section animation
  getDiverseUserProfiles() {
    return [
      {
        name: "Thandiwe Mthembu",
        position: "Tech Entrepreneur",
        company: "Ubuntu Innovations",
        location: "Johannesburg",
        avatar: "TM",
        industry: "Technology"
      },
      {
        name: "Ahmed Hassan",
        position: "Creative Director",
        company: "Cape Design Co",
        location: "Cape Town",
        avatar: "AH",
        industry: "Design"
      },
      {
        name: "Priya Naidoo",
        position: "Digital Marketing Specialist",
        company: "Durban Digital",
        location: "Durban",
        avatar: "PN",
        industry: "Marketing"
      },
      {
        name: "Connor O'Sullivan",
        position: "Wine Producer",
        company: "Stellenbosch Vineyards",
        location: "Stellenbosch",
        avatar: "CO",
        industry: "Agriculture"
      },
      {
        name: "Nomsa Khumalo",
        position: "Financial Advisor",
        company: "Sandton Finance",
        location: "Sandton",
        avatar: "NK",
        industry: "Finance"
      },
      {
        name: "David Patel",
        position: "Software Engineer",
        company: "Tech Hub PE",
        location: "Port Elizabeth",
        avatar: "DP",
        industry: "Technology"
      },
      {
        name: "Aisha Molefe",
        position: "Interior Designer",
        company: "Modern Spaces",
        location: "Pretoria",
        avatar: "AM",
        industry: "Design"
      },
      {
        name: "James van der Merwe",
        position: "Mining Engineer",
        company: "Golden Reef Mining",
        location: "Kimberley",
        avatar: "JV",
        industry: "Mining"
      },
      {
        name: "Lerato Mokoena",
        position: "Digital Content Creator",
        company: "Creative Collective",
        location: "Johannesburg",
        avatar: "LM",
        industry: "Media"
      },
      {
        name: "Rashid Khan",
        position: "Restaurant Owner",
        company: "Spice Route Bistro",
        location: "Cape Town",
        avatar: "RK",
        industry: "Hospitality"
      },
      {
        name: "Mbali Sithole",
        position: "HR Consultant",
        company: "People First",
        location: "Durban",
        avatar: "MS",
        industry: "Human Resources"
      },
      {
        name: "Stefan Botha",
        position: "Architect",
        company: "Modern Architecture",
        location: "Bloemfontein",
        avatar: "SB",
        industry: "Architecture"
      },
      {
        name: "Fatima Al-Rashid",
        position: "Legal Advisor",
        company: "Justice Partners",
        location: "Johannesburg",
        avatar: "FA",
        industry: "Legal"
      },
      {
        name: "Sipho Ndlovu",
        position: "Sports Agent",
        company: "Elite Sports Management",
        location: "Durban",
        avatar: "SN",
        industry: "Sports"
      },
      {
        name: "Elena Ivanov",
        position: "Data Scientist",
        company: "Analytics Pro",
        location: "Cape Town",
        avatar: "EI",
        industry: "Technology"
      },
      {
        name: "Mandla Zulu",
        position: "Art Gallery Owner",
        company: "Heritage Art Gallery",
        location: "Pietermaritzburg",
        avatar: "MZ",
        industry: "Arts"
      },
      {
        name: "Carmen Rodriguez",
        position: "Event Planner",
        company: "Spectacular Events",
        location: "Cape Town",
        avatar: "CR",
        industry: "Events"
      },
      {
        name: "Tshepo Mogale",
        position: "Renewable Energy Consultant",
        company: "Green Power Solutions",
        location: "Pretoria",
        avatar: "TM",
        industry: "Energy"
      }
    ]
  }

  // Enhanced live analytics data for hero section
  getLiveHeroStats() {
    const now = new Date()
    const hour = now.getHours()
    
    // Simulate business hours activity (higher numbers during 8-17)
    const businessHourMultiplier = (hour >= 8 && hour <= 17) ? 1.5 : 0.8
    
    return {
      totalUsers: Math.floor((45000 + Math.random() * 5000) * businessHourMultiplier),
      cardsCreatedToday: Math.floor((340 + Math.random() * 60) * businessHourMultiplier),
      activeSessions: Math.floor((1200 + Math.random() * 300) * businessHourMultiplier),
      revenueToday: Math.floor((28500 + Math.random() * 5000) * businessHourMultiplier), // ZAR
      growthPercentage: 23.5 + Math.random() * 10,
      newUsersThisWeek: Math.floor((2100 + Math.random() * 400) * businessHourMultiplier)
    }
  }

  private getDefaultAnalytics(): MockAnalytics {
    const now = new Date()
    const timeSeriesData = this.generateTimeSeriesData(30) // 30 days of data
    
    return {
      totalViews: 12547 + Math.floor(Math.random() * 1000),
      totalContacts: 2893 + Math.floor(Math.random() * 100),
      totalShares: 1456 + Math.floor(Math.random() * 50),
      viewsThisMonth: 8234,
      contactsThisMonth: 1876,
      sharesThisMonth: 892,
      growthPercentage: 23.5 + (Math.random() * 10 - 5), // Random fluctuation ±5%
      topPerformingCards: [
        { cardId: 'card_1', cardName: 'Personal Business Card', views: 4521 },
        { cardId: 'card_2', cardName: 'Company Card', views: 3234 },
        { cardId: 'card_3', cardName: 'Event Card', views: 2876 }
      ],
      recentActivity: [
        { type: 'view', cardName: 'Personal Business Card', timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), details: 'Card viewed from Cape Town' },
        { type: 'contact', cardName: 'Company Card', timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), details: 'Contact information saved' },
        { type: 'share', cardName: 'Personal Business Card', timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(), details: 'Card shared via WhatsApp' },
        { type: 'view', cardName: 'Event Card', timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(), details: 'Card viewed from Johannesburg' }
      ],
      geographicData: [
        { country: 'South Africa', views: 8234, contacts: 1876 },
        { country: 'Nigeria', views: 2156, contacts: 487 },
        { country: 'Kenya', views: 1234, contacts: 278 },
        { country: 'Ghana', views: 923, contacts: 198 },
        { country: 'Zimbabwe', views: 567, contacts: 123 },
        { country: 'Botswana', views: 433, contacts: 89 }
      ],
      deviceAnalytics: [
        { device: 'Mobile', percentage: 68.5, trend: 2.3 },
        { device: 'Desktop', percentage: 24.8, trend: -1.2 },
        { device: 'Tablet', percentage: 6.7, trend: -1.1 }
      ],
      timeSeriesData,
      earnings: { 
        totalEarnings: 45760, 
        currency: 'ZAR', 
        monthlyEarnings: 15420 + Math.floor(Math.random() * 2000) 
      },
      subscriptionPricing: {
        free: { price: 0, currency: 'ZAR', features: ['1 business card', 'Basic templates', 'QR code generation', 'Basic analytics (total scans)'] },
        pro: { price: 99, currency: 'ZAR', features: ['5 business cards', 'Premium templates', 'NFC integration', 'Advanced analytics', 'Custom branding'] },
        business: { price: 199, currency: 'ZAR', features: ['Unlimited cards', 'Team management', 'API access', 'White-label solution', 'Priority support'] }
      },
      roiMetrics: {
        traditionalCardCosts: {
          printingCostPer1000: 2500,
          averageReprintsPerYear: 3,
          designCostPerRedesign: 3000,
          wastePercentage: 73,
          annualWasteForMediumTeam: 45000
        },
        kaadSavings: {
          setupCost: 299,
          monthlyCost: 99,
          updatesUnlimited: true,
          conversionRateImprovement: 4.2,
          totalAnnualSavings: 35000
        },
        networkingROI: {
          totalNetworkingEvents: 12,
          averageContactsPerEvent: 23,
          conversionRate: 23.1,
          revenueInfluenced: 145000,
          costPerQualityLead: 1.21
        },
        teamMetrics: {
          teamSize: 8,
          brandConsistencyScore: 95,
          cardsNeverExpire: true,
          centralizedManagement: true
        }
      }
    }
  }

  // Generate realistic time series data for analytics
  private generateTimeSeriesData(days: number) {
    const data = []
    const now = new Date()
    
    for (let i = days; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const isWeekend = date.getDay() === 0 || date.getDay() === 6
      const isBusinessHours = date.getHours() >= 9 && date.getHours() <= 17
      
      // Generate realistic patterns - lower activity on weekends
      const baseViews = isWeekend ? 150 : 300
      const baseContacts = isWeekend ? 30 : 65
      const baseShares = isWeekend ? 15 : 25
      
      const views = baseViews + Math.floor(Math.random() * 100)
      const contacts = baseContacts + Math.floor(Math.random() * 30)
      const shares = baseShares + Math.floor(Math.random() * 15)
      
      data.push({
        date: date.toISOString().split('T')[0],
        views,
        contacts,
        shares
      })
    }
    
    return data
  }

  private getDefaultTeamMembers(): MockTeamMember[] {
    return [
      {
        id: 'team_1',
        name: 'Sarah Johnson',
        email: 'sarah@acmeinc.com',
        position: 'Marketing Director',
        avatar: '/avatars/sarah-johnson.jpg',
        role: 'editor',
        joinDate: '2024-01-10',
        status: 'active'
      },
      {
        id: 'team_2',
        name: 'Mike Chen',
        email: 'mike@acmeinc.com',
        position: 'Sales Manager',
        avatar: '/avatars/mike-chen.jpg',
        role: 'viewer',
        joinDate: '2024-01-12',
        status: 'active'
      },
      {
        id: 'team_3',
        name: 'Emily Rodriguez',
        email: 'emily@acmeinc.com',
        position: 'Product Designer',
        avatar: '/avatars/emily-rodriguez.jpg',
        role: 'editor',
        joinDate: '2024-01-14',
        status: 'pending'
      }
    ]
  }
}

// Export singleton instance
export const mockDataStore = MockDataStore.getInstance()

// React hooks for easy component integration
import { useState, useEffect } from 'react'

export const useMockData = () => {
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const refresh = () => setRefreshTrigger(prev => prev + 1)
  
  useEffect(() => {
    console.log('🔄 Mock Data Store Accessed')
  }, [refreshTrigger])
  
  return {
    user: mockDataStore.getUser(),
    cards: mockDataStore.getCards(),
    teamMembers: mockDataStore.getTeamMembers(),
    analytics: mockDataStore.getAnalytics(),
    getCard: mockDataStore.getCard.bind(mockDataStore),
    updateCard: mockDataStore.updateCard.bind(mockDataStore),
    addCard: mockDataStore.addCard.bind(mockDataStore),
    deleteCard: mockDataStore.deleteCard.bind(mockDataStore),
    refresh
  }
} 