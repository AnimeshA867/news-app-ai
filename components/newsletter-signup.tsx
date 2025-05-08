"use client";

import type React from "react";

import { useState } from "react";
import { motion } from "framer-motion";
import { Mail, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useSettings } from "./providers/settings-provider";

export function NewsletterSignup() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();
  const { settings } = useSettings();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubscribed(true);
      setEmail("");
      toast({
        title: "Successfully subscribed!",
        description: "You'll now receive our newsletter with the latest news.",
      });
    }, 1500);
  };

  return (
    <section className="my-12 rounded-xl bg-muted/50 p-8">
      <div className="mx-auto max-w-3xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <Mail className="h-6 w-6 text-primary-foreground" />
          </div>
          <h2 className="mb-2 text-2xl font-bold md:text-3xl">
            Stay Updated with {settings?.siteName || "Manasukh News"}
          </h2>
          <p className="mb-6 text-muted-foreground">
            Subscribe to our newsletter for breaking news, exclusive stories,
            and in-depth analysis delivered straight to your inbox.
          </p>
          {!isSubscribed ? (
            <form
              onSubmit={handleSubmit}
              className="mx-auto flex max-w-md flex-col gap-2 sm:flex-row"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-10"
              />
              <Button type="submit" disabled={isSubmitting} className="h-10">
                {isSubmitting ? (
                  "Subscribing..."
                ) : (
                  <>
                    Subscribe <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="flex items-center justify-center gap-2 text-primary">
              <Check className="h-5 w-5" />
              <span className="font-medium">Thank you for subscribing!</span>
            </div>
          )}
          <p className="mt-4 text-xs text-muted-foreground">
            By subscribing, you agree to our Privacy Policy and consent to
            receive updates from our company.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
