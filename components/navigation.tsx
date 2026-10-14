"use client"

import { KenteStrip } from "@/components/afro/kente-strip"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AndaLogo } from "@/components/anda-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Icons } from "@/lib/icons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-4 min-h-16 py-2">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <AndaLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-foreground hover:text-primary transition-colors">
                Resources <Icons.ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/self-test">Self-Test Tool</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/iep">IEP Generator</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/directory">Find Support</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/apps-tools">Apps & Tools</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/learning" className="text-foreground hover:text-primary transition-colors">
              Learning
            </Link>

            <Link href="/community" className="text-foreground hover:text-primary transition-colors">
              Community
            </Link>

            <Link href="/advocacy" className="text-foreground hover:text-primary transition-colors">
              Advocacy
            </Link>

            <Link href="/research" className="text-foreground hover:text-primary transition-colors">
              Research
            </Link>

            <Link href="/news" className="text-foreground hover:text-primary transition-colors">
              News
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex shrink-0 items-center gap-3">
            <ThemeToggle />
            <Link
              href="/settings/accessibility"
              aria-label="Display and sensory settings"
              title="Display and sensory settings"
              className="rounded-md border px-2 py-1 text-sm font-semibold hover:bg-accent"
            >
              Aa
            </Link>
            <Button variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90">
              <Link href="/donate">Donate</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? "Close menu" : "Open menu"}
              aria-expanded={isOpen}
              aria-controls="mobile-nav-menu"
            >
              {isOpen ? (
                <Icons.X className="h-6 w-6" aria-hidden="true" />
              ) : (
                <Icons.Menu className="h-6 w-6" aria-hidden="true" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden" id="mobile-nav-menu">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t">
              <Link
                href="/about"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                About
              </Link>
              <Link
                href="/self-test"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Self-Test Tool
              </Link>
              <Link
                href="/iep"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                IEP Generator
              </Link>
              <Link
                href="/directory"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Find Support
              </Link>
              <Link
                href="/learning"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Learning
              </Link>
              <Link
                href="/community"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Community
              </Link>
              <Link
                href="/advocacy"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Advocacy
              </Link>
              <Link
                href="/research"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Research
              </Link>
              <Link
                href="/news"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                News
              </Link>
              <div className="flex flex-col space-y-2 px-3 py-2">
                <ThemeToggle />
                <Link href="/settings/accessibility" className="text-sm hover:underline" onClick={() => setIsOpen(false)}>
                  Display settings
                </Link>
                <Button variant="outline" asChild>
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90">
                  <Link href="/donate">Donate</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <KenteStrip height={6} />
    </nav>
  )
}
