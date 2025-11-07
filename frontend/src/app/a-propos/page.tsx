'use client';

import React, { useEffect, useState } from 'react';
import { FaHeart, FaAward, FaLeaf, FaUsers } from 'react-icons/fa';
import { getPageContent } from '@/lib/api';
import styles from './page.module.scss';

interface AboutSection {
  id?: string;
  title: string;
  paragraphs: string[];
}

interface AboutValue {
  id?: string;
  title: string;
  description: string;
  icon?: string;
}

interface AboutContent {
  heroTitle: string;
  heroSubtitle: string;
  sections: AboutSection[];
  values: AboutValue[];
}

const fallbackContent: AboutContent = {
  heroTitle: "À Propos d'Assia",
  heroSubtitle: "L'art de la pâtisserie artisanale depuis 2015",
  sections: [
    {
      id: 'history',
      title: 'Notre Histoire',
      paragraphs: [
        "Fondée en 2015 par Assia, une passionnée de pâtisserie formée dans les meilleures écoles de France, notre pâtisserie est née d'un rêve : créer des desserts qui allient tradition et innovation.",
        "Notre atelier artisanal situé au cœur de Paris utilise exclusivement les meilleurs ingrédients, soigneusement sélectionnés auprès de producteurs locaux et de fournisseurs de confiance.",
        "Chaque création est préparée à la main avec passion et dévotion, en respectant les recettes traditionnelles de la pâtisserie française tout en y apportant notre touche créative et contemporaine.",
      ],
    },
    {
      id: 'team',
      title: 'Notre Équipe',
      paragraphs: [
        "L'équipe d'Assia est composée de pâtissiers passionnés et talentueux, tous formés dans les meilleures écoles de pâtisserie française.",
        "Chaque membre partage notre vision : créer des desserts qui émerveillent et ravissent, en alliant savoir-faire traditionnel et innovation.",
        "Notre engagement envers la qualité et l'excellence nous pousse à nous perfectionner constamment, pour offrir des créations toujours plus raffinées.",
      ],
    },
    {
      id: 'commitment',
      title: 'Notre Engagement',
      paragraphs: [
        "Chez Assia, nous sommes engagés dans une démarche responsable et durable. Nous travaillons avec des producteurs locaux pour réduire notre empreinte carbone et soutenir l'économie locale.",
        "Nous croyons également en l'importance de transmettre notre savoir en organisant des ateliers de pâtisserie pour les passionnés de tous âges.",
      ],
    },
  ],
  values: [
    {
      id: 'passion',
      title: 'Passion',
      description:
        "Chaque gâteau est créé avec amour et dévotion par Assia. La pâtisserie est une véritable passion qui se ressent dans chaque bouchée.",
      icon: 'heart',
    },
    {
      id: 'excellence',
      title: 'Excellence',
      description:
        "Nous visons la perfection dans chaque détail, du choix des ingrédients à la présentation finale. Assia a remporté plusieurs distinctions régionales.",
      icon: 'award',
    },
    {
      id: 'quality',
      title: 'Qualité',
      description:
        "Ingrédients frais et locaux, sans compromis. Nous travaillons avec des producteurs de la région parisienne pour garantir authenticité et fraîcheur.",
      icon: 'leaf',
    },
    {
      id: 'service',
      title: 'Service',
      description:
        "Une équipe accueillante et professionnelle dédiée à rendre votre expérience exceptionnelle, de la commande à la dégustation.",
      icon: 'users',
    },
  ],
};

const iconMap: Record<string, JSX.Element> = {
  heart: <FaHeart />,
  award: <FaAward />,
  leaf: <FaLeaf />,
  users: <FaUsers />,
};

function getIcon(iconKey?: string) {
  if (!iconKey) {
    return <FaHeart />;
  }
  return iconMap[iconKey.toLowerCase()] || <FaHeart />;
}

export default function AboutPage() {
  const [content, setContent] = useState<AboutContent>(fallbackContent);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const page = await getPageContent<Partial<AboutContent>>('a-propos');
        if (page.content) {
          const incoming = page.content;
          setContent({
            heroTitle: incoming.heroTitle?.trim() || fallbackContent.heroTitle,
            heroSubtitle: incoming.heroSubtitle?.trim() || fallbackContent.heroSubtitle,
            sections:
              Array.isArray(incoming.sections) && incoming.sections.length > 0
                ? incoming.sections
                    .map((section) => ({
                      id: section.id,
                      title: section.title?.trim() || '',
                      paragraphs: Array.isArray(section.paragraphs)
                        ? section.paragraphs
                            .map((p) => (typeof p === 'string' ? p.trim() : ''))
                            .filter((p) => p.length > 0)
                        : [],
                    }))
                    .filter((section) => section.title || section.paragraphs.length > 0)
                : fallbackContent.sections,
            values:
              Array.isArray(incoming.values) && incoming.values.length > 0
                ? incoming.values
                    .map((value) => ({
                      id: value.id,
                      title: value.title?.trim() || '',
                      description: value.description?.trim() || '',
                      icon: value.icon,
                    }))
                    .filter((value) => value.title || value.description)
                : fallbackContent.values,
          });
        }
      } catch (error) {
        console.error('Error loading about page content:', error);
      }
    };

    fetchContent();
  }, []);

  return (
    <main className={styles.aboutPage}>
      <div className={styles.aboutHero}>
        <h1>{content.heroTitle}</h1>
        <p className={styles.heroSubtitle}>{content.heroSubtitle}</p>
      </div>

      <div className={styles.aboutContent}>
        {content.sections.map((section) => (
          <section key={section.id || section.title} className={styles.aboutSection}>
            <div className={styles.sectionContent}>
              {section.title && <h2>{section.title}</h2>}
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${section.id || section.title}-paragraph-${index}`}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}

        <section className={styles.valuesSection}>
          <h2>Nos Valeurs</h2>
          <div className={styles.valuesGrid}>
            {content.values.map((value) => (
              <div key={value.id || value.title} className={styles.valueCard}>
                <div className={styles.valueIcon}>{getIcon(value.icon)}</div>
                <h3>{value.title}</h3>
                <p>{value.description}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

