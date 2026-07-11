import { Paragraph, DYNAMIC_PARAGRAPH_DATABASE, PROFESSIONAL_CATEGORIES } from './seedData';
import officeLetters from './office-letters.json';
import officeOrders from './office-orders.json';
import officialNotices from './official-notices.json';
import technicalEssays from './technical-essays.json';

export type { Paragraph };

// Export the newly redesigned professional paragraph database as a fallback/seeding source
export const PARAGRAPH_DATABASE: Paragraph[] = [
  ...DYNAMIC_PARAGRAPH_DATABASE,
  ...(officeLetters as Paragraph[]),
  ...(officeOrders as Paragraph[]),
  ...(officialNotices as Paragraph[]),
  ...(technicalEssays as Paragraph[])
];

// Updated list of 24 professional categories
export const PARAGRAPH_CATEGORIES = PROFESSIONAL_CATEGORIES;

/**
 * Loads and returns all paragraphs of a specific category, or all of them.
 */
export function getParagraphsByCategory(category: string): Paragraph[] {
  if (category === 'All') return PARAGRAPH_DATABASE;
  return PARAGRAPH_DATABASE.filter(p => p.category === category);
}
