'use client';

import React from 'react';
import { FaHeart, FaAward, FaLeaf, FaUsers } from 'react-icons/fa';
import styles from './page.module.scss';

export default function AboutPage() {
  return (
    <main className={styles.aboutPage}>
      <div className={styles.aboutHero}>
        <h1>À Propos d'Assiqa</h1>
        <p className={styles.heroSubtitle}>L'art de la pâtisserie artisanale depuis 2015</p>
      </div>

      <div className={styles.aboutContent}>
        <section className={styles.aboutSection}>
          <div className={styles.sectionContent}>
            <h2>Notre Histoire</h2>
            <p>
              Fondée en 2015 par Assiqa, une passionnée de pâtisserie formée dans les meilleures
              écoles de France, notre pâtisserie est née d'un rêve : créer des desserts qui allient
              tradition et innovation. Chaque gâteau que nous créons raconte une histoire unique et
              chaque bouchée est une invitation au voyage gustatif.
            </p>
            <p>
              Notre atelier artisanal situé au cœur de Paris utilise exclusivement les meilleurs
              ingrédients, soigneusement sélectionnés auprès de producteurs locaux et de
              fournisseurs de confiance. Nous privilégions les produits frais, bio lorsque
              possible, et les matières premières de première qualité pour garantir une expérience
              gustative exceptionnelle.
            </p>
            <p>
              Chaque création est préparée à la main avec passion et dévotion, en respectant les
              recettes traditionnelles de la pâtisserie française tout en y apportant notre touche
              créative et contemporaine. Nous croyons fermement que la pâtisserie est un art qui se
              partage et qui doit être accessible à tous.
            </p>
          </div>
        </section>

        <section className={styles.valuesSection}>
          <h2>Nos Valeurs</h2>
          <div className={styles.valuesGrid}>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <FaHeart />
              </div>
              <h3>Passion</h3>
              <p>
                Chaque gâteau est créé avec amour et dévotion par Assiqa. La pâtisserie n'est pas
                seulement un métier, c'est une véritable passion qui se ressent dans chaque bouchée.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <FaAward />
              </div>
              <h3>Excellence</h3>
              <p>
                Nous visons la perfection dans chaque détail, du choix des ingrédients à la
                présentation finale. Assiqa a remporté plusieurs distinctions lors de concours de
                pâtisserie régionaux.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <FaLeaf />
              </div>
              <h3>Qualité</h3>
              <p>
                Ingrédients frais et locaux, sans compromis. Nous travaillons avec des producteurs
                de la région parisienne pour garantir la fraîcheur et l'authenticité de nos
                créations.
              </p>
            </div>
            <div className={styles.valueCard}>
              <div className={styles.valueIcon}>
                <FaUsers />
              </div>
              <h3>Service</h3>
              <p>
                Une équipe accueillante et professionnelle dédiée à rendre votre expérience
                exceptionnelle. Nous vous conseillons et vous accompagnons dans le choix de vos
                desserts.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.aboutSection}>
          <div className={styles.sectionContent}>
            <h2>Notre Équipe</h2>
            <p>
              L'équipe d'Assiqa est composée de pâtissiers passionnés et talentueux, tous formés
              dans les meilleures écoles de pâtisserie française. Notre chef pâtissier, Assiqa,
              apporte son expertise et sa créativité à chaque création, guidant une équipe unie par
              l'amour du métier et le souci du détail.
            </p>
            <p>
              Chaque membre de notre équipe partage notre vision : créer des desserts qui émerveillent
              et ravissent, en alliant savoir-faire traditionnel et innovation. Nous sommes fiers
              de notre capacité à créer des gâteaux personnalisés pour chaque occasion spéciale de
              votre vie, qu'il s'agisse d'un anniversaire, d'un mariage, d'un événement d'entreprise
              ou simplement d'un moment de gourmandise.
            </p>
            <p>
              Notre engagement envers la qualité et l'excellence nous pousse à nous perfectionner
              constamment, en suivant les tendances culinaires tout en préservant l'authenticité des
              recettes classiques. Nous organisons régulièrement des formations et des échanges avec
              d'autres artisans pour toujours améliorer notre savoir-faire.
            </p>
          </div>
        </section>

        <section className={styles.aboutSection}>
          <div className={styles.sectionContent}>
            <h2>Notre Engagement</h2>
            <p>
              Chez Assiqa, nous sommes engagés dans une démarche responsable et durable. Nous
              travaillons avec des producteurs locaux pour réduire notre empreinte carbone et
              soutenir l'économie locale. Nos emballages sont recyclables et nous limitons au maximum
              le gaspillage alimentaire.
            </p>
            <p>
              Nous croyons également en l'importance de transmettre notre savoir. C'est pourquoi nous
              organisons régulièrement des ateliers de pâtisserie pour les amateurs, où petits et
              grands peuvent apprendre les techniques de base et découvrir les secrets de nos
              recettes.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

