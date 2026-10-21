"use client"

import { KenteStrip } from "@/components/afro/kente-strip"
import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { AndaLogo } from "@/components/anda-logo"
import { ThemeToggle } from "@/components/theme-toggle"
import { Icons } from "@/lib/icons"
import { DraftTranslationNotice, LanguagePicker, useT } from "@/components/language-provider"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const tr = useT()

  return (
    <nav className="sticky top-0 z-50 w-full bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center gap-4 min-h-16 py-2">
          {/* Logo */}
          <Link href="/" className="min-w-0 shrink">
            <AndaLogo />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex flex-wrap items-center justify-center gap-x-6 gap-y-1">
            <Link href="/about" className="text-foreground hover:text-primary transition-colors">
              {tr("nav.about")}
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center text-foreground hover:text-primary transition-colors">
                {tr("nav.resources")} <Icons.ChevronDown className="ml-1 h-4 w-4" aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem asChild>
                  <Link href="/self-test">{tr("nav.selfTest")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/iep">{tr("nav.iep")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/directory">{tr("nav.findSupport")}</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/apps-tools">{tr("nav.appsTools")}</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Link href="/learning" className="text-foreground hover:text-primary transition-colors">
              {tr("nav.learning")}
            </Link>

            <Link href="/community" className="text-foreground hover:text-primary transition-colors">
              {tr("nav.community")}
            </Link>

            <Link href="/advocacy" className="text-foreground hover:text-primary transition-colors">
              {tr("nav.advocacy")}
            </Link>

            <Link href="/research" className="text-foreground hover:text-primary transition-colors">
              {tr("nav.research")}
            </Link>

            <Link href="/news" className="text-foreground hover:text-primary transition-colors">
              {tr("nav.news")}
            </Link>
          </div>

          {/* Desktop CTA Buttons */}
          <div className="hidden lg:flex shrink-0 items-center gap-3">
            <LanguagePicker id="site-language" />
            <ThemeToggle />
            <Link
              href="/settings/accessibility"
              aria-label={tr("nav.displaySettings")}
              title={tr("nav.displaySettings")}
              className="rounded-md border px-2 py-1 text-sm font-semibold hover:bg-accent"
            >
              Aa
            </Link>
            <Button variant="outline" asChild>
              <Link href="/auth/login">{tr("nav.signIn")}</Link>
            </Button>
            <Button asChild className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90">
              <Link href="/donate">{tr("nav.donate")}</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              aria-label={isOpen ? tr("nav.closeMenu") : tr("nav.openMenu")}
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
                {tr("nav.about")}
              </Link>
              <Link
                href="/self-test"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {tr("nav.selfTest")}
              </Link>
              <Link
                href="/iep"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {tr("nav.iep")}
              </Link>
              <Link
                href="/directory"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {tr("nav.findSupport")}
              </Link>
              <Link
                href="/learning"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {tr("nav.learning")}
              </Link>
              <Link
                href="/community"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {tr("nav.community")}
              </Link>
              <Link
                href="/advocacy"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {tr("nav.advocacy")}
              </Link>
              <Link
                href="/research"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {tr("nav.research")}
              </Link>
              <Link
                href="/news"
                className="block px-3 py-2 text-foreground hover:text-primary transition-colors"
                onClick={() => setIsOpen(false)}
              >
                {tr("nav.news")}
              </Link>
              <div className="flex flex-col space-y-2 px-3 py-2">
                <LanguagePicker id="site-language-mobile" />
                <ThemeToggle />
                <Link href="/settings/accessibility" className="text-sm hover:underline" onClick={() => setIsOpen(false)}>
                  {tr("nav.displaySettingsShort")}
                </Link>
                <Button variant="outline" asChild>
                  <Link href="/auth/login">{tr("nav.signIn")}</Link>
                </Button>
                <Button asChild className="bg-terracotta text-terracotta-foreground hover:bg-terracotta/90">
                  <Link href="/donate">{tr("nav.donate")}</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      <KenteStrip height={6} />
      <DraftTranslationNotice />
    </nav>
  )
}
