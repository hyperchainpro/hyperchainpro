'use client';

import { t, type Locale } from '@/lib/i18n';
import { useAuthStore } from '@/store/auth-store';
import React, { useCallback, useState } from 'react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Smartphone, CreditCard, List, Type, Layout, MessageSquare, Navigation } from 'lucide-react';
import { useCanvasStore } from '@/store/canvas-store';
import type { BoardElement } from '@/lib/types';

const NEU_CARD =
  'shadow-[3px_3px_6px_rgba(0,0,0,0.06),-3px_-3px_6px_rgba(255,255,255,0.7)] dark:shadow-[3px_3px_6px_rgba(0,0,0,0.3),-3px_-3px_6px_rgba(30,30,30,0.06)]';

const NEU_INSET =
  'shadow-[inset_1px_1px_3px_rgba(0,0,0,0.06),inset_-1px_-1px_3px_rgba(255,255,255,0.7)] dark:shadow-[inset_1px_1px_3px_rgba(0,0,0,0.3),inset_-1px_-1px_3px_rgba(30,30,30,0.05)]';

interface WireframeTemplate {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  color: string;
  buildElements: (cx: number, cy: number) => Partial<BoardElement>[];
}

const WIREFRAME_TEMPLATES: WireframeTemplate[] = [
  // 1. Login Screen
  {
    id: 'login-screen',
    name: 'Login Screen',
    description: 'Email input, password input, login button',
    icon: Smartphone,
    color: '#6366F1',
    buildElements: (cx, cy) => {
      const frameW = 375;
      const frameH = 600;
      const fx = cx - frameW / 2;
      const fy = cy - frameH / 2;
      return [
        // Frame background
        { type: 'FRAME' as const, x: fx, y: fy, width: frameW, height: frameH, name: 'Login Screen', styles: { fills: [{ id: 'f1', type: 'solid', color: '#FFFFFF', opacity: 1 }], cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 } } },
        // Title
        { type: 'TEXT' as const, x: fx + 100, y: fy + 60, width: 175, height: 32, content: 'Welcome Back', name: 'Title', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 24, fontWeight: 700, lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', color: '#1F2937', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
        // Subtitle
        { type: 'TEXT' as const, x: fx + 120, y: fy + 100, width: 135, height: 20, content: 'Sign in to continue', name: 'Subtitle', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#9CA3AF', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
        // Email label
        { type: 'TEXT' as const, x: fx + 40, y: fy + 170, width: 60, height: 18, content: 'Email', name: 'Email Label', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#6B7280', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Email input
        { type: 'RECTANGLE' as const, x: fx + 40, y: fy + 192, width: 295, height: 44, name: 'Email Input', styles: { fills: [{ id: 'f2', type: 'solid', color: '#F9FAFB', opacity: 1 }], strokes: [{ id: 's1', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'miter' as const }], cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } } },
        // Password label
        { type: 'TEXT' as const, x: fx + 40, y: fy + 254, width: 70, height: 18, content: 'Password', name: 'Password Label', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#6B7280', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Password input
        { type: 'RECTANGLE' as const, x: fx + 40, y: fy + 276, width: 295, height: 44, name: 'Password Input', styles: { fills: [{ id: 'f3', type: 'solid', color: '#F9FAFB', opacity: 1 }], strokes: [{ id: 's2', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'miter' as const }], cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } } },
        // Login button
        { type: 'RECTANGLE' as const, x: fx + 40, y: fy + 346, width: 295, height: 48, name: 'Login Button', styles: { fills: [{ id: 'f4', type: 'solid', color: '#6366F1', opacity: 1 }], cornerRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 } } },
        // Login button text
        { type: 'TEXT' as const, x: fx + 150, y: fy + 358, width: 75, height: 24, content: 'Sign In', name: 'Button Text', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, fontWeight: 600, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#FFFFFF', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
        // Forgot password
        { type: 'TEXT' as const, x: fx + 120, y: fy + 410, width: 135, height: 18, content: 'Forgot password?', name: 'Forgot Password', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#6366F1', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
      ];
    },
  },
  // 2. Signup Screen
  {
    id: 'signup-screen',
    name: 'Signup Screen',
    description: 'Name, email, password, signup button',
    icon: CreditCard,
    color: '#8B5CF6',
    buildElements: (cx, cy) => {
      const frameW = 375;
      const frameH = 660;
      const fx = cx - frameW / 2;
      const fy = cy - frameH / 2;
      return [
        { type: 'FRAME' as const, x: fx, y: fy, width: frameW, height: frameH, name: 'Signup Screen', styles: { fills: [{ id: 'f1', type: 'solid', color: '#FFFFFF', opacity: 1 }], cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 } } },
        { type: 'TEXT' as const, x: fx + 120, y: fy + 50, width: 135, height: 32, content: 'Create Account', name: 'Title', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 24, fontWeight: 700, lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', color: '#1F2937', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
        { type: 'TEXT' as const, x: fx + 100, y: fy + 88, width: 175, height: 20, content: 'Sign up to get started', name: 'Subtitle', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#9CA3AF', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
        // Name input
        { type: 'RECTANGLE' as const, x: fx + 40, y: fy + 140, width: 295, height: 44, name: 'Name Input', styles: { fills: [{ id: 'f2', type: 'solid', color: '#F9FAFB', opacity: 1 }], strokes: [{ id: 's1', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'miter' as const }], cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } } },
        { type: 'TEXT' as const, x: fx + 56, y: fy + 152, width: 120, height: 20, content: 'Full Name', name: 'Name Placeholder', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#D1D5DB', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Email input
        { type: 'RECTANGLE' as const, x: fx + 40, y: fy + 200, width: 295, height: 44, name: 'Email Input', styles: { fills: [{ id: 'f3', type: 'solid', color: '#F9FAFB', opacity: 1 }], strokes: [{ id: 's2', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'miter' as const }], cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } } },
        { type: 'TEXT' as const, x: fx + 56, y: fy + 212, width: 100, height: 20, content: 'Email address', name: 'Email Placeholder', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#D1D5DB', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Password input
        { type: 'RECTANGLE' as const, x: fx + 40, y: fy + 260, width: 295, height: 44, name: 'Password Input', styles: { fills: [{ id: 'f4', type: 'solid', color: '#F9FAFB', opacity: 1 }], strokes: [{ id: 's3', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'miter' as const }], cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } } },
        { type: 'TEXT' as const, x: fx + 56, y: fy + 272, width: 100, height: 20, content: 'Password', name: 'Password Placeholder', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#D1D5DB', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Signup button
        { type: 'RECTANGLE' as const, x: fx + 40, y: fy + 330, width: 295, height: 48, name: 'Signup Button', styles: { fills: [{ id: 'f5', type: 'solid', color: '#8B5CF6', opacity: 1 }], cornerRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 } } },
        { type: 'TEXT' as const, x: fx + 140, y: fy + 342, width: 95, height: 24, content: 'Create Account', name: 'Button Text', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, fontWeight: 600, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#FFFFFF', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
        // Divider
        { type: 'RECTANGLE' as const, x: fx + 40, y: fy + 400, width: 130, height: 1, name: 'Divider Left', styles: { fills: [{ id: 'f6', type: 'solid', color: '#E5E7EB', opacity: 1 }], cornerRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 } } },
        { type: 'TEXT' as const, x: fx + 182, y: fy + 392, width: 12, height: 18, content: 'or', name: 'Or Text', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#9CA3AF', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
        { type: 'RECTANGLE' as const, x: fx + 205, y: fy + 400, width: 130, height: 1, name: 'Divider Right', styles: { fills: [{ id: 'f7', type: 'solid', color: '#E5E7EB', opacity: 1 }], cornerRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 } } },
        // Sign in link
        { type: 'TEXT' as const, x: fx + 105, y: fy + 440, width: 165, height: 20, content: 'Already have an account?', name: 'Sign In Link', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#9CA3AF', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
      ];
    },
  },
  // 3. Navigation Bar
  {
    id: 'navigation-bar',
    name: 'Navigation Bar',
    description: 'Logo, nav links, profile avatar',
    icon: Navigation,
    color: '#3B82F6',
    buildElements: (cx, cy) => {
      const barW = 800;
      const barH = 64;
      const fx = cx - barW / 2;
      const fy = cy - barH / 2;
      return [
        { type: 'RECTANGLE' as const, x: fx, y: fy, width: barW, height: barH, name: 'Nav Bar', styles: { fills: [{ id: 'f1', type: 'solid', color: '#FFFFFF', opacity: 1 }], strokes: [{ id: 's1', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'miter' as const }], shadows: [{ id: 'sh1', type: 'drop-shadow', color: 'rgba(0,0,0,0.05)', offsetX: 0, offsetY: 2, blur: 8, spread: 0, visible: true }], cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 } } },
        // Logo
        { type: 'RECTANGLE' as const, x: fx + 24, y: fy + 16, width: 32, height: 32, name: 'Logo', styles: { fills: [{ id: 'f2', type: 'solid', color: '#3B82F6', opacity: 1 }], cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } } },
        { type: 'TEXT' as const, x: fx + 64, y: fy + 20, width: 60, height: 24, content: 'Logo', name: 'Logo Text', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, fontWeight: 700, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#1F2937', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Nav links
        { type: 'TEXT' as const, x: fx + 200, y: fy + 22, width: 50, height: 20, content: 'Home', name: 'Nav: Home', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#3B82F6', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        { type: 'TEXT' as const, x: fx + 270, y: fy + 22, width: 50, height: 20, content: 'About', name: 'Nav: About', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#6B7280', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        { type: 'TEXT' as const, x: fx + 340, y: fy + 22, width: 50, height: 20, content: 'Services', name: 'Nav: Services', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#6B7280', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        { type: 'TEXT' as const, x: fx + 420, y: fy + 22, width: 40, height: 20, content: 'Blog', name: 'Nav: Blog', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#6B7280', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Profile avatar
        { type: 'CIRCLE' as const, x: fx + barW - 56, y: fy + 16, width: 32, height: 32, name: 'Avatar', styles: { fills: [{ id: 'f3', type: 'solid', color: '#6366F1', opacity: 1 }], cornerRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 } } },
      ];
    },
  },
  // 4. Card Component
  {
    id: 'card-component',
    name: 'Card Component',
    description: 'Image, title, description, action button',
    icon: CreditCard,
    color: '#EC4899',
    buildElements: (cx, cy) => {
      const cardW = 320;
      const cardH = 380;
      const fx = cx - cardW / 2;
      const fy = cy - cardH / 2;
      return [
        { type: 'RECTANGLE' as const, x: fx, y: fy, width: cardW, height: cardH, name: 'Card', styles: { fills: [{ id: 'f1', type: 'solid', color: '#FFFFFF', opacity: 1 }], strokes: [{ id: 's1', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'miter' as const }], shadows: [{ id: 'sh1', type: 'drop-shadow', color: 'rgba(0,0,0,0.08)', offsetX: 0, offsetY: 4, blur: 12, spread: 0, visible: true }], cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 } } },
        // Image placeholder
        { type: 'RECTANGLE' as const, x: fx, y: fy, width: cardW, height: 180, name: 'Card Image', styles: { fills: [{ id: 'f2', type: 'solid', color: '#E0E7FF', opacity: 1 }], cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 0, bottomLeft: 0 } } },
        { type: 'TEXT' as const, x: fx + 100, y: fy + 75, width: 120, height: 30, content: '📷', name: 'Image Icon', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 28, fontWeight: 400, lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', color: '#6366F1', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
        // Title
        { type: 'TEXT' as const, x: fx + 24, y: fy + 200, width: 272, height: 24, content: 'Card Title Goes Here', name: 'Card Title', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 18, fontWeight: 600, lineHeight: 1.3, letterSpacing: 0, textDecoration: 'none', color: '#1F2937', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Description
        { type: 'TEXT' as const, x: fx + 24, y: fy + 232, width: 272, height: 60, content: 'This is a brief description of the card content. It can span multiple lines.', name: 'Card Description', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: 1.6, letterSpacing: 0, textDecoration: 'none', color: '#9CA3AF', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // CTA button
        { type: 'RECTANGLE' as const, x: fx + 24, y: fy + 316, width: 272, height: 40, name: 'Card CTA', styles: { fills: [{ id: 'f3', type: 'solid', color: '#EC4899', opacity: 1 }], cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } } },
        { type: 'TEXT' as const, x: fx + 115, y: fy + 324, width: 90, height: 24, content: 'Learn More', name: 'CTA Text', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 600, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#FFFFFF', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
      ];
    },
  },
  // 5. List Item
  {
    id: 'list-item',
    name: 'List Item',
    description: 'Avatar, title, subtitle, action icon',
    icon: List,
    color: '#10B981',
    buildElements: (cx, cy) => {
      const itemW = 360;
      const itemH = 72;
      const fx = cx - itemW / 2;
      const fy = cy - itemH / 2;
      return [
        { type: 'RECTANGLE' as const, x: fx, y: fy, width: itemW, height: itemH, name: 'List Item', styles: { fills: [{ id: 'f1', type: 'solid', color: '#FFFFFF', opacity: 1 }], strokes: [{ id: 's1', color: '#F3F4F6', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'miter' as const }], cornerRadius: { topLeft: 12, topRight: 12, bottomRight: 12, bottomLeft: 12 } } },
        // Avatar
        { type: 'CIRCLE' as const, x: fx + 16, y: fy + 16, width: 40, height: 40, name: 'Avatar', styles: { fills: [{ id: 'f2', type: 'solid', color: '#D1FAE5', opacity: 1 }], cornerRadius: { topLeft: 20, topRight: 20, bottomRight: 20, bottomLeft: 20 } } },
        { type: 'TEXT' as const, x: fx + 24, y: fy + 24, width: 24, height: 24, content: 'JD', name: 'Avatar Initials', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', color: '#059669', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
        // Title
        { type: 'TEXT' as const, x: fx + 72, y: fy + 18, width: 200, height: 20, content: 'John Doe', name: 'List Title', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 15, fontWeight: 600, lineHeight: 1.3, letterSpacing: 0, textDecoration: 'none', color: '#1F2937', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Subtitle
        { type: 'TEXT' as const, x: fx + 72, y: fy + 40, width: 200, height: 18, content: 'john.doe@example.com', name: 'List Subtitle', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, fontWeight: 400, lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', color: '#9CA3AF', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Action chevron
        { type: 'TEXT' as const, x: fx + itemW - 36, y: fy + 24, width: 20, height: 24, content: '›', name: 'Action', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 20, fontWeight: 400, lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', color: '#D1D5DB', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
      ];
    },
  },
  // 6. Hero Section
  {
    id: 'hero-section',
    name: 'Hero Section',
    description: 'Large heading, subtitle, CTA button',
    icon: Layout,
    color: '#F59E0B',
    buildElements: (cx, cy) => {
      const heroW = 600;
      const heroH = 240;
      const fx = cx - heroW / 2;
      const fy = cy - heroH / 2;
      return [
        { type: 'RECTANGLE' as const, x: fx, y: fy, width: heroW, height: heroH, name: 'Hero Background', styles: { fills: [{ id: 'f1', type: 'solid', color: '#FFFBEB', opacity: 1 }], cornerRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 } } },
        // Heading
        { type: 'TEXT' as const, x: fx + 40, y: fy + 40, width: 520, height: 48, content: 'Build Something Amazing', name: 'Hero Heading', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 36, fontWeight: 800, lineHeight: 1.2, letterSpacing: -0.5, textDecoration: 'none', color: '#1F2937', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Subtitle
        { type: 'TEXT' as const, x: fx + 40, y: fy + 100, width: 400, height: 40, content: 'A powerful platform for designers and developers to create beautiful interfaces together.', name: 'Hero Subtitle', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, fontWeight: 400, lineHeight: 1.6, letterSpacing: 0, textDecoration: 'none', color: '#6B7280', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // CTA button
        { type: 'RECTANGLE' as const, x: fx + 40, y: fy + 168, width: 160, height: 48, name: 'Hero CTA', styles: { fills: [{ id: 'f2', type: 'solid', color: '#F59E0B', opacity: 1 }], cornerRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 } } },
        { type: 'TEXT' as const, x: fx + 72, y: fy + 178, width: 96, height: 28, content: 'Get Started', name: 'CTA Text', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, fontWeight: 600, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#FFFFFF', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
        // Secondary button
        { type: 'RECTANGLE' as const, x: fx + 220, y: fy + 168, width: 160, height: 48, name: 'Secondary CTA', styles: { fills: [{ id: 'f3', type: 'solid', color: '#FFFFFF', opacity: 1 }], strokes: [{ id: 's1', color: '#F59E0B', width: 2, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'miter' as const }], cornerRadius: { topLeft: 10, topRight: 10, bottomRight: 10, bottomLeft: 10 } } },
        { type: 'TEXT' as const, x: fx + 254, y: fy + 178, width: 92, height: 28, content: 'Learn More', name: 'Secondary Text', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 16, fontWeight: 600, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#F59E0B', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
      ];
    },
  },
  // 7. Form Field
  {
    id: 'form-field',
    name: 'Form Field',
    description: 'Label, input, helper text',
    icon: Type,
    color: '#14B8A6',
    buildElements: (cx, cy) => {
      const fieldW = 320;
      const fieldH = 100;
      const fx = cx - fieldW / 2;
      const fy = cy - fieldH / 2;
      return [
        // Label
        { type: 'TEXT' as const, x: fx, y: fy, width: 80, height: 20, content: 'Username', name: 'Field Label', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#374151', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Required indicator
        { type: 'TEXT' as const, x: fx + 64, y: fy - 2, width: 8, height: 20, content: '*', name: 'Required', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 13, fontWeight: 500, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#EF4444', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Input
        { type: 'RECTANGLE' as const, x: fx, y: fy + 28, width: fieldW, height: 42, name: 'Input Field', styles: { fills: [{ id: 'f1', type: 'solid', color: '#FFFFFF', opacity: 1 }], strokes: [{ id: 's1', color: '#D1D5DB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'miter' as const }], cornerRadius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8 } } },
        { type: 'TEXT' as const, x: fx + 16, y: fy + 38, width: 140, height: 20, content: 'Enter username...', name: 'Placeholder', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#D1D5DB', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Helper text
        { type: 'TEXT' as const, x: fx, y: fy + 80, width: 200, height: 18, content: 'Must be at least 3 characters', name: 'Helper Text', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 12, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#9CA3AF', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
      ];
    },
  },
  // 8. Bottom Tab Bar
  {
    id: 'bottom-tab-bar',
    name: 'Bottom Tab Bar',
    description: '5 tab icons with labels',
    icon: Layout,
    color: '#6366F1',
    buildElements: (cx, cy) => {
      const barW = 375;
      const barH = 64;
      const fx = cx - barW / 2;
      const fy = cy - barH / 2;
      const tabW = barW / 5;
      const tabLabels = ['Home', 'Search', 'Add', 'Messages', 'Profile'];
      const tabIcons = ['🏠', '🔍', '➕', '💬', '👤'];
      const activeColors = ['#6366F1', '#9CA3AF', '#10B981', '#9CA3AF', '#9CA3AF'];
      const elements: Partial<BoardElement>[] = [
        // Bar background
        { type: 'RECTANGLE' as const, x: fx, y: fy, width: barW, height: barH, name: 'Tab Bar', styles: { fills: [{ id: 'f1', type: 'solid', color: '#FFFFFF', opacity: 1 }], strokes: [{ id: 's1', color: '#E5E7EB', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'miter' as const }], cornerRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 } } },
      ];
      for (let i = 0; i < 5; i++) {
        const tx = fx + tabW * i;
        elements.push({
          type: 'TEXT' as const,
          x: tx + tabW / 2 - 12,
          y: fy + 10,
          width: 24,
          height: 24,
          content: tabIcons[i],
          name: `Tab Icon ${tabLabels[i]}`,
          styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 18, fontWeight: 400, lineHeight: 1.2, letterSpacing: 0, textDecoration: 'none', color: activeColors[i], textAlign: 'center', fontStyle: 'normal', textCase: 'none' } },
        });
        elements.push({
          type: 'TEXT' as const,
          x: tx + tabW / 2 - 20,
          y: fy + 38,
          width: 40,
          height: 16,
          content: tabLabels[i],
          name: `Tab Label ${tabLabels[i]}`,
          styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 10, fontWeight: i === 0 ? 600 : 400, lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', color: activeColors[i], textAlign: 'center', fontStyle: 'normal', textCase: 'none' } },
        });
      }
      return elements;
    },
  },
  // 9. Status Bar
  {
    id: 'status-bar',
    name: 'Status Bar',
    description: 'Time, signal, battery indicators',
    icon: Smartphone,
    color: '#1F2937',
    buildElements: (cx, cy) => {
      const barW = 375;
      const barH = 36;
      const fx = cx - barW / 2;
      const fy = cy - barH / 2;
      return [
        { type: 'RECTANGLE' as const, x: fx, y: fy, width: barW, height: barH, name: 'Status Bar', styles: { fills: [{ id: 'f1', type: 'solid', color: '#F9FAFB', opacity: 1 }], cornerRadius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0 } } },
        // Time
        { type: 'TEXT' as const, x: fx + 24, y: fy + 8, width: 50, height: 20, content: '9:41', name: 'Time', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 15, fontWeight: 600, lineHeight: 1.3, letterSpacing: 0, textDecoration: 'none', color: '#1F2937', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
        // Signal bars
        { type: 'TEXT' as const, x: fx + barW - 120, y: fy + 8, width: 50, height: 20, content: '📶', name: 'Signal', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: 1.3, letterSpacing: 0, textDecoration: 'none', color: '#1F2937', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
        // WiFi
        { type: 'TEXT' as const, x: fx + barW - 80, y: fy + 8, width: 30, height: 20, content: '📡', name: 'WiFi', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: 1.3, letterSpacing: 0, textDecoration: 'none', color: '#1F2937', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
        // Battery
        { type: 'RECTANGLE' as const, x: fx + barW - 42, y: fy + 12, width: 24, height: 12, name: 'Battery Body', styles: { fills: [{ id: 'f2', type: 'solid', color: '#FFFFFF', opacity: 1 }], strokes: [{ id: 's1', color: '#374151', width: 1, style: 'solid', align: 'center' as const, cap: 'butt' as const, join: 'miter' as const }], cornerRadius: { topLeft: 3, topRight: 3, bottomRight: 3, bottomLeft: 3 } } },
        { type: 'RECTANGLE' as const, x: fx + barW - 40, y: fy + 14, width: 18, height: 8, name: 'Battery Level', styles: { fills: [{ id: 'f3', type: 'solid', color: '#10B981', opacity: 1 }], cornerRadius: { topLeft: 2, topRight: 2, bottomRight: 2, bottomLeft: 2 } } },
        { type: 'RECTANGLE' as const, x: fx + barW - 16, y: fy + 16, width: 2, height: 4, name: 'Battery Cap', styles: { fills: [{ id: 'f4', type: 'solid', color: '#374151', opacity: 1 }], cornerRadius: { topLeft: 1, topRight: 1, bottomRight: 1, bottomLeft: 1 } } },
      ];
    },
  },
  // 10. Chat Bubble
  {
    id: 'chat-bubble',
    name: 'Chat Bubble',
    description: 'Message bubble with avatar',
    icon: MessageSquare,
    color: '#3B82F6',
    buildElements: (cx, cy) => {
      const bubbleW = 260;
      const bubbleH = 64;
      const fx = cx - bubbleW / 2 - 20;
      const fy = cy - bubbleH / 2;
      return [
        // Avatar
        { type: 'CIRCLE' as const, x: fx, y: fy + 8, width: 40, height: 40, name: 'Chat Avatar', styles: { fills: [{ id: 'f1', type: 'solid', color: '#DBEAFE', opacity: 1 }], cornerRadius: { topLeft: 20, topRight: 20, bottomRight: 20, bottomLeft: 20 } } },
        { type: 'TEXT' as const, x: fx + 8, y: fy + 16, width: 24, height: 24, content: 'A', name: 'Avatar Letter', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 600, lineHeight: 1.4, letterSpacing: 0, textDecoration: 'none', color: '#3B82F6', textAlign: 'center', fontStyle: 'normal', textCase: 'none' } } },
        // Bubble
        { type: 'RECTANGLE' as const, x: fx + 52, y: fy, width: bubbleW, height: bubbleH, name: 'Chat Bubble', styles: { fills: [{ id: 'f2', type: 'solid', color: '#F3F4F6', opacity: 1 }], cornerRadius: { topLeft: 16, topRight: 16, bottomRight: 16, bottomLeft: 16 } } },
        // Message text
        { type: 'TEXT' as const, x: fx + 68, y: fy + 14, width: 220, height: 36, content: 'Hey! How is the project going? Need any help?', name: 'Message Text', styles: { typography: { fontFamily: 'Inter, system-ui, sans-serif', fontSize: 14, fontWeight: 400, lineHeight: 1.5, letterSpacing: 0, textDecoration: 'none', color: '#374151', textAlign: 'left', fontStyle: 'normal', textCase: 'none' } } },
      ];
    },
  },
];

function getViewportCenter() {
  const { panX, panY, zoom } = useCanvasStore.getState();
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const canvasW = vw / zoom;
  const canvasH = vh / zoom;
  return {
    x: canvasW / 2 - panX / zoom,
    y: canvasH / 2 - panY / zoom,
  };
}

export function WireframeKit() {
  const locale = (useAuthStore((s) => s.user)?.language as Locale) ?? 'en';
  const [search, setSearch] = React.useState('');

  const filtered = WIREFRAME_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase()),
  );

  const handleInsertTemplate = useCallback((template: WireframeTemplate) => {
    const { x, y } = getViewportCenter();
    const store = useCanvasStore.getState();
    const elementOverrides = template.buildElements(x, y);
    const newIds: string[] = [];

    for (const override of elementOverrides) {
      if (override.type && 'x' in override && 'y' in override) {
        const el = store.addElement(
          override.type,
          override.x as number,
          override.y as number,
          override,
        );
        newIds.push(el.id);
      }
    }

    // Select all inserted elements
    store.selectElement(newIds[0]);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="relative p-3 pb-2">
        <Search className="absolute left-6 top-[22px] h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t("wireframe.searchWireframes", locale)}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`pl-9 ${NEU_INSET} border-neutral-200/40 dark:border-neutral-700/30`}
        />
      </div>

      {/* Wireframe Grid */}
      <ScrollArea className="flex-1 px-3 pb-3">
        <div className="grid grid-cols-2 gap-2">
          {filtered.map((template) => {
            const IconComp = template.icon;
            return (
              <button
                key={template.id}
                onClick={() => handleInsertTemplate(template)}
                className={`flex flex-col items-center gap-2 rounded-lg border border-neutral-200/40 dark:border-neutral-700/30 p-3 transition-all hover:border-primary/40 hover:bg-primary/5 text-left ${NEU_CARD}`}
              >
                {/* Mini preview */}
                <div
                  className="w-full h-16 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${template.color}15` }}
                >
                  <IconComp
                    className="h-8 w-8"
                    style={{ color: template.color }}
                  />
                </div>
                {/* Name & description */}
                <div className="w-full min-w-0">
                  <p className="text-xs font-medium truncate">{template.name}</p>
                  <p className="text-[10px] text-muted-foreground truncate">
                    {template.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Search className="h-8 w-8 mb-2 opacity-40" />
            <p className="text-sm">{t("wireframe.noWireframes", locale)}</p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}


