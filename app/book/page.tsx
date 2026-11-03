import type { Metadata } from 'next';
import BookForm from './BookForm';
import '../pages.css';

export const metadata: Metadata = { title: 'book a look', description: 'pick a look, pick a day, done. you pay in the chair. cancel up to 24h before.' };

export default function Book() {
  return <BookForm />;
}
