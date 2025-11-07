'use client';

import React, { useEffect, useState } from 'react';
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFacebook,
  FaInstagram,
} from 'react-icons/fa';
import { getPageContent } from '@/lib/api';
import styles from './page.module.scss';

interface ContactInfoItem {
  id?: string;
  title: string;
  icon?: string;
  lines: string[];
  note?: string;
}

interface SocialLink {
  id?: string;
  platform: string;
  url: string;
}

interface ContactContent {
  heroTitle: string;
  heroSubtitle: string;
  introText: string;
  contactInfo: ContactInfoItem[];
  socialLinks: SocialLink[];
}

const fallbackContent: ContactContent = {
  heroTitle: 'Contactez Assia',
  heroSubtitle: "Nous serions ravis d'entendre parler de vous et de répondre à toutes vos questions",
  introText:
    "Vous avez une question ? Une demande de devis pour un gâteau sur mesure ? N'hésitez pas à nous contacter, nous vous répondrons dans les plus brefs délais.",
  contactInfo: [
    {
      id: 'address',
      title: 'Adresse',
      icon: 'map-marker',
      lines: ['45 Avenue des Gourmets', '75008 Paris, France'],
      note: 'Métro : Miromesnil (lignes 9 et 13) — Parking disponible à proximité',
    },
    {
      id: 'phone',
      title: 'Téléphone',
      icon: 'phone',
      lines: ['+33 1 42 68 95 47'],
      note: 'Appelez-nous pour vos commandes ou pour toute question',
    },
    {
      id: 'email',
      title: 'Email',
      icon: 'envelope',
      lines: ['contact@assia-patisserie.fr'],
      note: 'Réponse sous 24h — commandes@assia-patisserie.fr pour les demandes spéciales',
    },
    {
      id: 'hours',
      title: "Horaires d'ouverture",
      icon: 'clock',
      lines: ['Lundi - Vendredi : 7h30 - 19h30', 'Samedi : 8h - 20h', 'Dimanche : 9h - 18h'],
      note: 'Fermé les jours fériés — Ouvert pendant les fêtes de fin d’année',
    },
  ],
  socialLinks: [
    { id: 'facebook', platform: 'facebook', url: 'https://facebook.com/assiapatisserie' },
    { id: 'instagram', platform: 'instagram', url: 'https://instagram.com/assiapatisserie' },
  ],
};

const contactIconMap: Record<string, JSX.Element> = {
  'map-marker': <FaMapMarkerAlt />,
  map: <FaMapMarkerAlt />,
  adresse: <FaMapMarkerAlt />,
  phone: <FaPhone />,
  téléphone: <FaPhone />,
  envelope: <FaEnvelope />,
  email: <FaEnvelope />,
  clock: <FaClock />,
  horaires: <FaClock />,
};

const socialIconMap: Record<string, JSX.Element> = {
  facebook: <FaFacebook />,
  instagram: <FaInstagram />,
};

function getContactIcon(iconKey?: string) {
  if (!iconKey) {
    return <FaMapMarkerAlt />;
  }
  return contactIconMap[iconKey.toLowerCase()] || <FaMapMarkerAlt />;
}

function getSocialIcon(platform: string) {
  return socialIconMap[platform.toLowerCase()] || <FaFacebook />;
}

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [content, setContent] = useState<ContactContent>(fallbackContent);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const page = await getPageContent<Partial<ContactContent>>('contact');
        if (page.content) {
          const incoming = page.content;
          setContent({
            heroTitle: incoming.heroTitle?.trim() || fallbackContent.heroTitle,
            heroSubtitle: incoming.heroSubtitle?.trim() || fallbackContent.heroSubtitle,
            introText: incoming.introText?.trim() || fallbackContent.introText,
            contactInfo:
              Array.isArray(incoming.contactInfo) && incoming.contactInfo.length > 0
                ? incoming.contactInfo
                    .map((item) => ({
                      id: item.id,
                      title: item.title?.trim() || '',
                      icon: item.icon,
                      lines: Array.isArray(item.lines)
                        ? item.lines
                            .map((line) => (typeof line === 'string' ? line.trim() : ''))
                            .filter((line) => line.length > 0)
                        : [],
                      note: item.note?.trim() || undefined,
                    }))
                    .filter((item) => item.title || item.lines.length > 0)
                : fallbackContent.contactInfo,
            socialLinks:
              Array.isArray(incoming.socialLinks) && incoming.socialLinks.length > 0
                ? incoming.socialLinks
                    .map((link) => ({
                      id: link.id,
                      platform: link.platform?.trim() || '',
                      url: link.url?.trim() || '#',
                    }))
                    .filter((link) => link.platform && link.url)
                : fallbackContent.socialLinks,
          });
        }
      } catch (error) {
        console.error('Error loading contact page content:', error);
      }
    };

    fetchContent();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', phone: '', message: '' });
    }, 3000);
  };

  return (
    <main className={styles.contactPage}>
      <div className={styles.contactHero}>
        <h1>{content.heroTitle}</h1>
        <p>{content.heroSubtitle}</p>
      </div>

      <div className={styles.contactContent}>
        <div className={styles.contactInfoSection}>
          <h2>Informations de Contact</h2>

          <div className={styles.contactInfoGrid}>
            {content.contactInfo.map((item) => (
              <div key={item.id || item.title} className={styles.contactInfoItem}>
                <div className={styles.contactIcon}>{getContactIcon(item.icon)}</div>
                <div className={styles.contactDetails}>
                  <h3>{item.title}</h3>
                  {item.lines.map((line, index) => (
                    <p key={`${item.id || item.title}-line-${index}`}>{line}</p>
                  ))}
                  {item.note && <p className={styles.contactNote}>{item.note}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className={styles.socialMedia}>
            <h3>Suivez-nous</h3>
            <p className={styles.socialDescription}>
              Retrouvez nos dernières créations et nos actualités sur nos réseaux sociaux
            </p>
            <div className={styles.socialIcons}>
              {content.socialLinks.map((link) => (
                <a
                  key={link.id || link.platform}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.platform}
                  className={styles.socialLink}
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.contactFormSection}>
          <h2>Envoyez-nous un Message</h2>
          <p className={styles.formIntro}>{content.introText}</p>
          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Nom complet *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Votre nom"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder="votre.email@example.com"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="phone">Téléphone</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+33 6 12 34 56 78"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Message *</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Parlez-nous de votre projet, de vos besoins, de la date de votre événement..."
              />
            </div>

            {submitted && (
              <div className={styles.successMessage}>
                Merci ! Votre message a été envoyé avec succès.
              </div>
            )}

            <button type="submit" className={styles.submitButton}>
              Envoyer le Message
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

