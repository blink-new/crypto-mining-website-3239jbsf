import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@blinkdotnew/sdk'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card'
import { Button } from './components/ui/button'
import { Badge } from './components/ui/badge'
import { Progress } from './components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs'
import { Input } from './components/ui/input'
import { Label } from './components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './components/ui/dialog'
import { toast } from 'sonner'
import { 
  Bitcoin, 
  Zap, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Shield,
  Star,
  CheckCircle,
  ArrowRight,
  Cpu,
  Activity,
  User,
  CreditCard,
  Wallet
} from 'lucide-react'

// Initialize Blink client
const blink = createClient({
  projectId: 'crypto-mining-website-3239jbsf',
  authRequired: false // We'll handle auth manually
})

interface MiningPlan {
  id: string
  name: string
  price: number
  dailyEarnings: number
  hashRate: string
  duration: number
  popular?: boolean
  features: string[]
}

interface UserMining {
  id: string
  planId: string
  startDate: string
  endDate: string
  totalEarned: number
  isActive: boolean
  userId: string
}

interface User {
  id: string
  username: string
  email: string
  displayName?: string
  createdAt: string
}

// Updated mining plans with new prices and earnings
const miningPlans: MiningPlan[] = [
  {
    id: 'free',
    name: 'Free Starter',
    price: 0,
    dailyEarnings: 0.10,
    hashRate: '1 TH/s',
    duration: 30,
    features: ['Basic mining power', '30-day contract', 'Email support', 'Real-time stats']
  },
  {
    id: 'basic',
    name: 'Basic Miner',
    price: 45, // Lowered from 99
    dailyEarnings: 17.2, // Increased from 2.50
    hashRate: '25 TH/s',
    duration: 90,
    features: ['Enhanced mining power', '90-day contract', 'Priority support', 'Advanced analytics', 'Mobile app access']
  },
  {
    id: 'pro',
    name: 'Pro Miner',
    price: 100, // Lowered from 299
    dailyEarnings: 37, // Increased from 8.75
    hashRate: '87.5 TH/s',
    duration: 180,
    popular: true,
    features: ['High-performance mining', '180-day contract', '24/7 support', 'Premium analytics', 'API access', 'Compound earnings']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 250, // Lowered from 999
    dailyEarnings: 115.4, // Increased from 35.00
    hashRate: '350 TH/s',
    duration: 365,
    features: ['Maximum mining power', '365-day contract', 'Dedicated support', 'Custom analytics', 'White-label access', 'Auto-reinvestment']
  }
]

function App() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [userMining, setUserMining] = useState<UserMining[]>([])
  const [btcPrice, setBtcPrice] = useState(67500)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutPlan, setCheckoutPlan] = useState<MiningPlan | null>(null)
  const [showFreeContractPopup, setShowFreeContractPopup] = useState(false)

  // Auth form states
  const [authForm, setAuthForm] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  // Checkout form states
  const [checkoutForm, setCheckoutForm] = useState({
    cryptoType: 'BTC',
    walletAddress: '',
    amount: 0
  })

  useEffect(() => {
    // Check for existing user session
    const checkSession = () => {
      const storedUser = localStorage.getItem('currentUser')
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      setLoading(false)
    }
    checkSession()
  }, [])

  const loadUserMining = useCallback(async () => {
    if (!user?.id) return
    try {
      const stored = localStorage.getItem(`mining_${user.id}`)
      if (stored) {
        setUserMining(JSON.parse(stored))
      }
    } catch (error) {
      console.error('Error loading user mining:', error)
    }
  }, [user?.id])

  useEffect(() => {
    loadUserMining()
  }, [loadUserMining])

  useEffect(() => {
    // Simulate BTC price updates
    const interval = setInterval(() => {
      setBtcPrice(prev => prev + (Math.random() - 0.5) * 100)
    }, 5000)
    return () => clearInterval(interval)
  }, [])

  // Simulate real-time mining progress
  useEffect(() => {
    if (!user?.id || userMining.length === 0) return

    const interval = setInterval(() => {
      const stored = localStorage.getItem(`mining_${user.id}`)
      if (stored) {
        const currentMining = JSON.parse(stored)
        const updated = currentMining.map((mining: UserMining) => {
          if (mining.isActive) {
            const plan = miningPlans.find(p => p.id === mining.planId)
            if (plan) {
              const incrementalEarning = (plan.dailyEarnings / 24 / 60 / 20)
              mining.totalEarned = (mining.totalEarned || 0) + incrementalEarning
            }
          }
          return mining
        })
        localStorage.setItem(`mining_${user.id}`, JSON.stringify(updated))
        setUserMining(updated)
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [user?.id, userMining.length])

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (authMode === 'signup') {
      if (authForm.password !== authForm.confirmPassword) {
        toast.error('Passwords do not match')
        return
      }
      
      // Check if user already exists
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
      const userExists = existingUsers.find((u: User) => 
        u.email === authForm.email || u.username === authForm.username
      )
      
      if (userExists) {
        toast.error('User with this email or username already exists')
        return
      }
      
      // Create new user
      const newUser: User = {
        id: `user_${Date.now()}`,
        username: authForm.username,
        email: authForm.email,
        displayName: authForm.username,
        createdAt: new Date().toISOString()
      }
      
      existingUsers.push(newUser)
      localStorage.setItem('users', JSON.stringify(existingUsers))
      localStorage.setItem('currentUser', JSON.stringify(newUser))
      setUser(newUser)
      setShowAuth(false)
      toast.success('Account created successfully!')
      
    } else {
      // Sign in
      const existingUsers = JSON.parse(localStorage.getItem('users') || '[]')
      const foundUser = existingUsers.find((u: User) => 
        (u.email === authForm.email || u.username === authForm.email) // Allow login with email or username
      )
      
      if (!foundUser) {
        toast.error('User not found')
        return
      }
      
      localStorage.setItem('currentUser', JSON.stringify(foundUser))
      setUser(foundUser)
      setShowAuth(false)
      toast.success('Signed in successfully!')
    }
    
    // Reset form
    setAuthForm({
      username: '',
      email: '',
      password: '',
      confirmPassword: ''
    })
  }

  const handleSignOut = () => {
    localStorage.removeItem('currentUser')
    setUser(null)
    setUserMining([])
    toast.success('Signed out successfully!')
  }

  const startMining = async (planId: string) => {
    if (!user) return
    
    const plan = miningPlans.find(p => p.id === planId)
    if (!plan) return

    // Handle free plan
    if (plan.price === 0) {
      try {
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + plan.duration)

        const newMining: UserMining = {
          id: `mining_${Date.now()}`,
          planId: plan.id,
          userId: user.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalEarned: 0,
          isActive: true
        }

        const existing = localStorage.getItem(`mining_${user.id}`)
        const currentMining = existing ? JSON.parse(existing) : []
        currentMining.push(newMining)
        localStorage.setItem(`mining_${user.id}`, JSON.stringify(currentMining))

        await loadUserMining()
        setShowFreeContractPopup(true)
      } catch (error) {
        console.error('Error starting mining:', error)
        toast.error('Failed to start mining contract')
      }
      return
    }

    // Handle paid plans - redirect to checkout
    setCheckoutPlan(plan)
    setCheckoutForm({
      ...checkoutForm,
      amount: plan.price
    })
    setShowCheckout(true)
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!checkoutPlan || !user) return
    
    // Simulate crypto payment processing
    toast.success('Processing crypto payment...')
    
    setTimeout(async () => {
      try {
        const startDate = new Date()
        const endDate = new Date()
        endDate.setDate(endDate.getDate() + checkoutPlan.duration)

        const newMining: UserMining = {
          id: `mining_${Date.now()}`,
          planId: checkoutPlan.id,
          userId: user.id,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalEarned: 0,
          isActive: true
        }

        const existing = localStorage.getItem(`mining_${user.id}`)
        const currentMining = existing ? JSON.parse(existing) : []
        currentMining.push(newMining)
        localStorage.setItem(`mining_${user.id}`, JSON.stringify(currentMining))

        await loadUserMining()
        setShowCheckout(false)
        setCheckoutPlan(null)
        toast.success(`${checkoutPlan.name} contract activated successfully!`)
      } catch (error) {
        console.error('Error processing payment:', error)
        toast.error('Payment processing failed')
      }
    }, 2000)
  }

  const calculateEarnings = (mining: UserMining) => {
    const plan = miningPlans.find(p => p.id === mining.planId)
    if (!plan) return 0

    const startDate = new Date(mining.startDate)
    const now = new Date()
    const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    const baseEarnings = Math.min(daysElapsed * plan.dailyEarnings, plan.dailyEarnings * plan.duration)
    
    return baseEarnings + (mining.totalEarned || 0)
  }

  const calculateBTCEarnings = (mining: UserMining) => {
    const usdEarnings = calculateEarnings(mining)
    return usdEarnings / btcPrice
  }

  const getTotalBTCEarnings = () => {
    return userMining.reduce((total, mining) => total + calculateBTCEarnings(mining), 0)
  }

  const getTotalDailyEarnings = () => {
    return userMining
      .filter(m => m.isActive)
      .reduce((total, mining) => {
        const plan = miningPlans.find(p => p.id === mining.planId)
        return total + (plan?.dailyEarnings || 0)
      }, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Bitcoin className="h-12 w-12 text-primary mx-auto mb-4 animate-pulse" />
          <p className="text-muted-foreground">Loading CryptoMine Pro...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Bitcoin className="h-12 w-12 text-primary mx-auto mb-4" />
            <CardTitle className="text-2xl">Welcome to CryptoMine Pro</CardTitle>
            <CardDescription>
              Start mining Bitcoin with our cloud mining platform
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => {
                setAuthMode('signin')
                setShowAuth(true)
              }} 
              className="w-full"
              size="lg"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => {
                setAuthMode('signup')
                setShowAuth(true)
              }} 
              variant="outline"
              className="w-full"
              size="lg"
            >
              Create Account
            </Button>
          </CardContent>
        </Card>

        {/* Auth Dialog */}
        <Dialog open={showAuth} onOpenChange={setShowAuth}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {authMode === 'signin' ? 'Sign In' : 'Create Account'}
              </DialogTitle>
              <DialogDescription>
                {authMode === 'signin' 
                  ? 'Enter your credentials to access your mining dashboard'
                  : 'Create a new account to start mining Bitcoin'
                }
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAuth} className="space-y-4">
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={authForm.username}
                    onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                    required
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                  required
                />
              </div>
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm password"
                    value={authForm.confirmPassword}
                    onChange={(e) => setAuthForm({...authForm, confirmPassword: e.target.value})}
                    required
                  />
                </div>
              )}
              <div className="flex space-x-2">
                <Button type="submit" className="flex-1">
                  {authMode === 'signin' ? 'Sign In' : 'Create Account'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setAuthMode(authMode === 'signin' ? 'signup' : 'signin')}
                >
                  {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Bitcoin className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">CryptoMine Pro</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">BTC Price</p>
                <p className="font-semibold text-primary">${btcPrice.toLocaleString()}</p>
              </div>
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span className="text-sm">{user.displayName || user.username}</span>
              </div>
              <Button 
                variant="outline" 
                onClick={handleSignOut}
                size="sm"
              >
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="dashboard" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="plans">Mining Plans</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Daily Earnings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-primary">
                    ${getTotalDailyEarnings().toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    +{(getTotalDailyEarnings() * 30).toFixed(2)} monthly
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Contracts</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {userMining.filter(m => m.isActive).length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Mining contracts running
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earned (USD)</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-500">
                    ${userMining.reduce((total, mining) => total + calculateEarnings(mining), 0).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    All-time earnings
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Earned (BTC)</CardTitle>
                  <Bitcoin className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-500">
                    {getTotalBTCEarnings().toFixed(11)} BTC
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bitcoin earned
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Live Mining Ticker */}
            {userMining.filter(m => m.isActive).length > 0 && (
              <Card className="bg-gradient-to-r from-primary/10 to-accent/10 border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5 text-primary animate-pulse" />
                    <span>Live Mining Progress</span>
                  </CardTitle>
                  <CardDescription>
                    Real-time Bitcoin accumulation from your active contracts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-card/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Current Rate</p>
                      <p className="text-lg font-bold text-primary">
                        {(getTotalDailyEarnings() / btcPrice / 24 / 60 / 60).toFixed(12)} BTC/sec
                      </p>
                    </div>
                    <div className="text-center p-4 bg-card/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Today's Mining</p>
                      <p className="text-lg font-bold text-orange-500">
                        {(getTotalDailyEarnings() / btcPrice).toFixed(11)} BTC
                      </p>
                    </div>
                    <div className="text-center p-4 bg-card/50 rounded-lg">
                      <p className="text-sm text-muted-foreground mb-1">Hash Power</p>
                      <p className="text-lg font-bold text-accent">
                        {userMining
                          .filter(m => m.isActive)
                          .reduce((total, mining) => {
                            const plan = miningPlans.find(p => p.id === mining.planId)
                            const hashRate = plan?.hashRate.replace(' TH/s', '') || '0'
                            return total + parseFloat(hashRate)
                          }, 0)} TH/s
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Mining Contracts */}
            <Card>
              <CardHeader>
                <CardTitle>Your Mining Contracts</CardTitle>
                <CardDescription>
                  Track your active mining operations and earnings
                </CardDescription>
              </CardHeader>
              <CardContent>
                {userMining.length === 0 ? (
                  <div className="text-center py-8">
                    <Cpu className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Active Mining</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your first mining contract to begin earning Bitcoin
                    </p>
                    <Button onClick={() => startMining('free')}>
                      Start Free Mining
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {userMining.map((mining) => {
                      const plan = miningPlans.find(p => p.id === mining.planId)
                      if (!plan) return null

                      const earnings = calculateEarnings(mining)
                      const btcEarnings = calculateBTCEarnings(mining)
                      const startDate = new Date(mining.startDate)
                      const endDate = new Date(mining.endDate)
                      const now = new Date()
                      const daysElapsed = Math.floor((now.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
                      const progress = Math.min((daysElapsed / plan.duration) * 100, 100)

                      return (
                        <Card key={mining.id} className="border-primary/20">
                          <CardContent className="pt-6">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="font-semibold">{plan.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {plan.hashRate} • ${plan.dailyEarnings}/day
                                </p>
                              </div>
                              <Badge variant={mining.isActive ? "default" : "secondary"}>
                                {mining.isActive ? "Active" : "Completed"}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 mb-4">
                              <div className="flex justify-between text-sm">
                                <span>Progress</span>
                                <span>{daysElapsed}/{plan.duration} days</span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Earned (USD)</p>
                                <p className="font-semibold text-green-500">${earnings.toFixed(2)}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Earned (BTC)</p>
                                <p className="font-semibold text-orange-500">{btcEarnings.toFixed(11)} BTC</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                              <div>
                                <p className="text-muted-foreground">Started</p>
                                <p className="font-semibold">{startDate.toLocaleDateString()}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Ends</p>
                                <p className="font-semibold">{endDate.toLocaleDateString()}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="plans" className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Choose Your Mining Plan</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Start with our free plan or upgrade to maximize your Bitcoin mining potential. 
                All plans include secure cloud mining with guaranteed daily returns.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {miningPlans.map((plan) => (
                <Card 
                  key={plan.id} 
                  className={`relative ${plan.popular ? 'border-primary shadow-lg scale-105' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <div className="space-y-2">
                      <div className="text-3xl font-bold">
                        {plan.price === 0 ? 'Free' : `$${plan.price}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {plan.duration} days contract
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="text-center p-4 bg-primary/10 rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        ${plan.dailyEarnings}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Daily BTC earnings
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Hash Rate</span>
                        <span className="font-semibold">{plan.hashRate}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Total Return</span>
                        <span className="font-semibold text-green-500">
                          ${(plan.dailyEarnings * plan.duration).toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {plan.features.map((feature, index) => (
                        <div key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      className="w-full" 
                      onClick={() => startMining(plan.id)}
                      variant={plan.popular ? "default" : "outline"}
                    >
                      {plan.price === 0 ? 'Start Free Mining' : 'Start Mining'}
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Features Section */}
            <Card className="mt-12">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Why Choose CryptoMine Pro?</CardTitle>
                <CardDescription>
                  Industry-leading cloud mining platform with proven results
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center space-y-2">
                    <Shield className="h-12 w-12 text-primary mx-auto" />
                    <h3 className="font-semibold">Secure & Reliable</h3>
                    <p className="text-sm text-muted-foreground">
                      Enterprise-grade security with 99.9% uptime guarantee
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <Zap className="h-12 w-12 text-primary mx-auto" />
                    <h3 className="font-semibold">Instant Setup</h3>
                    <p className="text-sm text-muted-foreground">
                      Start mining immediately with no hardware required
                    </p>
                  </div>
                  <div className="text-center space-y-2">
                    <TrendingUp className="h-12 w-12 text-primary mx-auto" />
                    <h3 className="font-semibold">Guaranteed Returns</h3>
                    <p className="text-sm text-muted-foreground">
                      Daily payouts with transparent earnings tracking
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Checkout Dialog */}
      <Dialog open={showCheckout} onOpenChange={setShowCheckout}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CreditCard className="h-5 w-5" />
              <span>Crypto Checkout</span>
            </DialogTitle>
            <DialogDescription>
              Pay with cryptocurrency to activate your {checkoutPlan?.name} mining contract
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCheckout} className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">{checkoutPlan?.name}</span>
                <span className="text-lg font-bold">${checkoutPlan?.price}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Daily earnings: ${checkoutPlan?.dailyEarnings} • {checkoutPlan?.duration} days
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="cryptoType">Payment Method</Label>
              <select 
                id="cryptoType"
                className="w-full p-2 border rounded-md bg-background"
                value={checkoutForm.cryptoType}
                onChange={(e) => setCheckoutForm({...checkoutForm, cryptoType: e.target.value})}
              >
                <option value="BTC">Bitcoin (BTC)</option>
                <option value="ETH">Ethereum (ETH)</option>
                <option value="USDT">Tether (USDT)</option>
                <option value="LTC">Litecoin (LTC)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="walletAddress">Your Wallet Address</Label>
              <Input
                id="walletAddress"
                type="text"
                placeholder="Enter your crypto wallet address"
                value={checkoutForm.walletAddress}
                onChange={(e) => setCheckoutForm({...checkoutForm, walletAddress: e.target.value})}
                required
              />
            </div>
            
            <div className="bg-primary/10 p-4 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="font-semibold">Payment Instructions</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Send exactly <strong>${checkoutForm.amount} worth of {checkoutForm.cryptoType}</strong> to the address provided after confirmation. 
                Your mining contract will activate automatically upon payment verification.
              </p>
            </div>
            
            <div className="flex space-x-2">
              <Button type="submit" className="flex-1">
                Confirm Payment
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowCheckout(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Free Contract Popup */}
      <Dialog open={showFreeContractPopup} onOpenChange={setShowFreeContractPopup}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>Contract Started!</span>
            </DialogTitle>
            <DialogDescription>
              Your Free Starter mining contract has been successfully activated
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <Bitcoin className="h-16 w-16 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Welcome to CryptoMine Pro!</h3>
            <p className="text-muted-foreground mb-4">
              Your free mining contract is now active and earning Bitcoin. 
              Check your dashboard to track your progress.
            </p>
            <Button onClick={() => setShowFreeContractPopup(false)} className="w-full">
              View Dashboard
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default App