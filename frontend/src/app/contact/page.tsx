'use client';

import React, { useState } from 'react';
import {
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaClock,
  FaFacebook,
  FaInstagram,
} from 'react-icons/fa';
import styles from './page.module.scss';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Ici vous pouvez ajouter l'envoi du formulaire à votre backend
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
        <h1>Contactez Assiqa</h1>
        <p>Nous serions ravis d'entendre parler de vous et de répondre à toutes vos questions</p>
      </div>

      <div className={styles.contactContent}>
        <div className={styles.contactInfoSection}>
          <h2>Informations de Contact</h2>

          <div className={styles.contactInfoGrid}>
            <div className={styles.contactInfoItem}>
              <div className={styles.contactIcon}>
                <FaMapMarkerAlt />
              </div>
              <div className={styles.contactDetails}>
                <h3>Adresse</h3>
                <p>
                  45 Avenue des Gourmets<br />
                  75008 Paris, France
                </p>
                <p className={styles.contactNote}>
                  Métro : Miromesnil (lignes 9 et 13)<br />
                  Parking disponible à proximité
                </p>
              </div>
            </div>

            <div className={styles.contactInfoItem}>
              <div className={styles.contactIcon}>
                <FaPhone />
              </div>
              <div className={styles.contactDetails}>
                <h3>Téléphone</h3>
                <p>+33 1 42 68 95 47</p>
                <p className={styles.contactNote}>
                  Appelez-nous pour vos commandes<br />
                  ou pour toute question
                </p>
              </div>
            </div>

            <div className={styles.contactInfoItem}>
              <div className={styles.contactIcon}>
                <FaEnvelope />
              </div>
              <div className={styles.contactDetails}>
                <h3>Email</h3>
                <p>contact@assiqa-patisserie.fr</p>
                <p className={styles.contactNote}>
                  Réponse sous 24h<br />
                  Pour les commandes spéciales : commandes@assiqa-patisserie.fr
                </p>
              </div>
            </div>

            <div className={styles.contactInfoItem}>
              <div className={styles.contactIcon}>
                <FaClock />
              </div>
              <div className={styles.contactDetails}>
                <h3>Horaires d'ouverture</h3>
                <p>
                  <strong>Lundi - Vendredi:</strong> 7h30 - 19h30<br />
                  <strong>Samedi:</strong> 8h - 20h<br />
                  <strong>Dimanche:</strong> 9h - 18h
                </p>
                <p className={styles.contactNote}>
                  Fermé les jours fériés<br />
                  Ouvert pendant les fêtes de fin d'année
                </p>
              </div>
            </div>
          </div>

          <div className={styles.socialMedia}>
            <h3>Suivez Assiqa</h3>
            <p className={styles.socialDescription}>
              Retrouvez nos dernières créations et nos actualités sur nos réseaux sociaux
            </p>
            <div className={styles.socialIcons}>
              <a
                href="https://facebook.com/assiqapatisserie"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className={styles.socialLink}
              >
                <FaFacebook />
              </a>
              <a
                href="https://instagram.com/assiqapatisserie"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className={styles.socialLink}
              >
                <FaInstagram />
              </a>
            </div>
          </div>
        </div>

        <div className={styles.contactFormSection}>
          <h2>Envoyez-nous un Message</h2>
          <p className={styles.formIntro}>
            Vous avez une question ? Une demande de devis pour un gâteau sur mesure ? N'hésitez pas
            à nous contacter, nous vous répondrons dans les plus brefs délais.
          </p>
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

