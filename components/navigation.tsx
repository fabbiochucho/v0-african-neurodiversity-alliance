"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AndaLogo } from "@/components/anda-logo"
import { Icons } from "@/lib/icons"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            <AndaLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              About
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-foreground hover:text-primary transition-colors">
                Resources <Icons.ChevronDown className="ml-1 h-4 w-4" />
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
                  <Link href="/neurafiki">Neurafiki: Parent Education</Link>
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
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Icons.User className="h-4 w-4" />
                  Account
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/profile">My Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/progress">Progress Tracking</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-courses">My Courses</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-resources">My Resources</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/my-community">My Community</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/iep/dashboard">My IEPs</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">Settings</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard">Admin Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/moderator/dashboard">Moderator Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/logout">Logout</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-accent hover:bg-accent/90">
              <Link href="/donate">Donate</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(!isOpen)} aria-label="Toggle menu">
              {isOpen ? <Icons.X className="h-6 w-6" /> : <Icons.Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden">
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
              <div className="border-t mt-2 pt-2">
                <p className="px-3 py-2 text-sm font-semibold">My Account</p>
                <Link
                  href="/dashboard"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  href="/profile"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  My Profile
                </Link>
                <Link
                  href="/progress"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Progress Tracking
                </Link>
                <Link
                  href="/my-courses"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  My Courses
                </Link>
                <Link
                  href="/my-resources"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  My Resources
                </Link>
                <Link
                  href="/my-community"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  My Community
                </Link>
                <Link
                  href="/iep/dashboard"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  My IEPs
                </Link>
                <Link
                  href="/settings"
                  className="block px-3 py-2 text-foreground hover:text-primary transition-colors text-sm"
                  onClick={() => setIsOpen(false)}
                >
                  Settings
                </Link>
              </div>
              <div className="flex flex-col space-y-2 px-3 py-2">
                <Button variant="outline" asChild>
                  <Link href="/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-accent hover:bg-accent/90">
                  <Link href="/donate">Donate</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
