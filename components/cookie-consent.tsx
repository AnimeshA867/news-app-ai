"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // Check if user has already accepted cookies
    const hasAccepted = localStorage.getItem("cookieConsent") === "accepted"
    if (!hasAccepted) {
      // Show the cookie consent after a short delay
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted")
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 left-4 right-4 z-50 rounded-lg border bg-background p-4 shadow-lg md:left-auto md:right-4 md:max-w-md"
        >
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="font-medium">Cookie Consent</h3>
              <p className="text-sm text-muted-foreground">
                We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our
                traffic. By clicking "Accept All", you consent to our use of cookies.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button size="sm" onClick={handleAccept}>
                  Accept All
                </Button>
                <Button size="sm" variant="outline" onClick={handleDecline}>
                  Decline
                </Button>
                <Button size="sm" variant="link" asChild>
                  <a href="/privacy">Cookie Policy</a>
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={handleDecline} className="h-8 w-8">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
