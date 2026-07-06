import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Icons } from "@/lib/icons"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 anda-pattern">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="max-w-4xl mx-auto text-center">
            <Badge variant="secondary" className="mb-6 text-sm font-medium">
              Pan-African Initiative
            </Badge>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-balance mb-6">
              Empowering <span className="text-primary">Neurodivergent</span> Individuals Across{" "}
              <span className="text-secondary">Africa</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-3xl mx-auto leading-relaxed">
              The African Neurodiversity Alliance (ANDA) provides comprehensive support, education, and advocacy for
              neurodivergent individuals, families, and communities across the continent.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" asChild className="text-lg px-8 py-6">
                <Link href="/self-test">
                  Take Self-Test <Icons.ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-lg px-8 py-6 bg-transparent">
                <Link href="/directory">Find Support</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-primary">15-25%</div>
                <div className="text-sm text-muted-foreground">of Africans are neurodivergent</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-secondary">54</div>
                <div className="text-sm text-muted-foreground">African countries served</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-accent">1000+</div>
                <div className="text-sm text-muted-foreground">Community members</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">Comprehensive Support Ecosystem</h2>
            <p className="text-xl text-muted-foreground text-pretty max-w-3xl mx-auto">
              From self-assessment tools to community support, we provide everything needed to thrive in a neurodiverse
              world.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Self-Test Tool */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icons.Brain className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Self-Test Application</CardTitle>
                <CardDescription>
                  Free assessment tools to help identify neurodivergent traits and provide personalized recommendations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" asChild className="w-full justify-between">
                  <Link href="/self-test">
                    Start Assessment <Icons.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Find Support Directory */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-secondary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Icons.Search className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Find Support Directory</CardTitle>
                <CardDescription>
                  Comprehensive database of schools, therapists, support groups, and resources across Africa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" asChild className="w-full justify-between">
                  <Link href="/directory">
                    Browse Directory <Icons.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Learning Platform */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/20">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Icons.BookOpen className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Online Learning</CardTitle>
                <CardDescription>
                  Courses and certifications for caregivers, educators, and healthcare professionals.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" asChild className="w-full justify-between">
                  <Link href="/learning">
                    Explore Courses <Icons.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Community Forum */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <Icons.MessageCircle className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Community Forum</CardTitle>
                <CardDescription>
                  Connect with others, share experiences, and find peer support in moderated spaces.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" asChild className="w-full justify-between">
                  <Link href="/community">
                    Join Community <Icons.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Apps & Tools */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-secondary/20">
              <CardHeader>
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-secondary/20 transition-colors">
                  <Icons.Lightbulb className="h-6 w-6 text-secondary" />
                </div>
                <CardTitle>Apps & Tools Repository</CardTitle>
                <CardDescription>
                  Curated collection of neurodivergent-focused apps and assistive technologies.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" asChild className="w-full justify-between">
                  <Link href="/apps-tools">
                    Browse Tools <Icons.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>

            {/* Advocacy Center */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/20">
              <CardHeader>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                  <Icons.Megaphone className="h-6 w-6 text-accent" />
                </div>
                <CardTitle>Advocacy Center</CardTitle>
                <CardDescription>
                  Policy advocacy campaigns and tools to promote inclusive legislation across Africa.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" asChild className="w-full justify-between">
                  <Link href="/advocacy">
                    Get Involved <Icons.ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Impact Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">
                Creating Lasting Impact Across Africa
              </h2>
              <p className="text-xl text-muted-foreground text-pretty">
                Our comprehensive approach addresses the unique challenges faced by neurodivergent individuals in
                African communities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-6">Why ANDA Matters</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Icons.CheckCircle className="h-6 w-6 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Addressing the Gap</h4>
                      <p className="text-muted-foreground">
                        Limited awareness and resources for neurodivergent individuals across African communities.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icons.CheckCircle className="h-6 w-6 text-secondary mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Cultural Sensitivity</h4>
                      <p className="text-muted-foreground">
                        Culturally appropriate support that respects traditional beliefs while promoting acceptance.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Icons.CheckCircle className="h-6 w-6 text-accent mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold mb-1">Scalable Solutions</h4>
                      <p className="text-muted-foreground">
                        Digital-first approach that can reach communities across all 54 African countries.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="text-center p-6 bg-background rounded-lg border">
                  <Icons.Globe className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-primary">Pan-African</div>
                  <div className="text-sm text-muted-foreground">Reach</div>
                </div>
                <div className="text-center p-6 bg-background rounded-lg border">
                  <Icons.Shield className="h-8 w-8 text-secondary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-secondary">Safe Spaces</div>
                  <div className="text-sm text-muted-foreground">Community</div>
                </div>
                <div className="text-center p-6 bg-background rounded-lg border">
                  <Icons.Users className="h-8 w-8 text-accent mx-auto mb-3" />
                  <div className="text-2xl font-bold text-accent">Inclusive</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
                <div className="text-center p-6 bg-background rounded-lg border">
                  <Icons.BarChart3 className="h-8 w-8 text-primary mx-auto mb-3" />
                  <div className="text-2xl font-bold text-primary">Evidence</div>
                  <div className="text-sm text-muted-foreground">Based</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold text-balance mb-4">
            Join the Movement for Neurodiversity in Africa
          </h2>
          <p className="text-xl opacity-90 text-pretty mb-8 max-w-2xl mx-auto">
            Whether you&apos;re neurodivergent, a caregiver, educator, or advocate, there&apos;s a place for you in our
            community.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" asChild className="text-lg px-8 py-6">
              <Link href="/self-test">Start Your Journey</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="text-lg px-8 py-6 border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary bg-transparent"
            >
              <Link href="/donate">Support Our Mission</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="mb-4">
                <Link href="/" className="inline-block">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                      <Icons.Brain className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <div className="font-bold text-lg">ANDA</div>
                      <div className="text-xs text-muted-foreground">African Neurodiversity Alliance</div>
                    </div>
                  </div>
                </Link>
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Empowering neurodivergent individuals across Africa through awareness, education, and inclusive support
                systems.
              </p>
              <div className="flex space-x-4">
                <Button variant="ghost" size="sm">
                  Twitter
                </Button>
                <Button variant="ghost" size="sm">
                  LinkedIn
                </Button>
                <Button variant="ghost" size="sm">
                  Facebook
                </Button>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <div className="space-y-2">
                <Link href="/self-test" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Self-Test
                </Link>
                <Link href="/iep" className="block text-muted-foreground hover:text-foreground transition-colors">
                  IEP Generator
                </Link>
                <Link href="/directory" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Find Support
                </Link>
                <Link
                  href="/apps-tools"
                  className="block text-muted-foreground hover:text-foreground transition-colors"
                >
                  Apps & Tools
                </Link>
                <Link href="/learning" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Learning
                </Link>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Community</h3>
              <div className="space-y-2">
                <Link href="/community" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Forum
                </Link>
                <Link href="/advocacy" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Advocacy
                </Link>
                <Link href="/research" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Research
                </Link>
                <Link href="/about" className="block text-muted-foreground hover:text-foreground transition-colors">
                  About Us
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 text-center text-muted-foreground">
            <p>&copy; 2025 African Neurodiversity Alliance. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
