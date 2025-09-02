import { Website, Review } from '../../types/website';

export interface WebsiteFormData {
  title: string;
  description: string;
  url: string;
  icon: string;
  featured: boolean;
  tags: string[];
  fullDescription: string;
  screenshots: string[];
  language: string;
  authoredBy: string;
  isPaid: boolean;
  features: string[];
  rating: number;
  reviews: Review[];
}

export interface WebsiteFormProps {
  website?: Website;
  onSave: (website: Omit<Website, 'id'>) => void;
  onCancel: () => void;
}

export const createDefaultFormData = (): WebsiteFormData => ({
  title: '',
  description: '',
  url: '',
  icon: '🌐',
  featured: false,
  tags: [],
  fullDescription: '',
  screenshots: [],
  language: '多语言',
  authoredBy: '',
  isPaid: false,
  features: [],
  rating: 0,
  reviews: []
});

export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};
