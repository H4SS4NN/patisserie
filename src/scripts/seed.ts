import { AppDataSource } from '../config/database';
import { Product } from '../entities/Product.entity';
import { ProductFlavor } from '../entities/ProductFlavor.entity';
import { AdminUser, AdminRole } from '../entities/AdminUser.entity';
import { AuthService } from '../services/auth.service';
import { CATEGORIES } from '../config/categories';
import { PageContent } from '../entities/PageContent.entity';
import { config } from 'dotenv';

config();

async function seed() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const productRepo = AppDataSource.getRepository(Product);
    const flavorRepo = AppDataSource.getRepository(ProductFlavor);
    const contentRepo = AppDataSource.getRepository(PageContent);
    const adminRepo = AppDataSource.getRepository(AdminUser);

    // Seed products - Les catégories de gâteaux
    const basePrices: Record<string, number> = {
      'Tartes et tartelettes': 2500,
      Cookies: 1200,
      Entremets: 4500,
      Flanc: 2800,
      'Layer cake': 3500,
      Cheesecakes: 4200,
    };

    for (const [key, configCategory] of Object.entries(CATEGORIES)) {
      const existing = await productRepo.findOne({ where: { name: configCategory.name } });
      let product = existing;

      if (!product) {
        product = new Product();
        product.name = configCategory.name;
        product.description = `${configCategory.name} artisanaux. Choisissez votre goût parmi notre sélection.`;
        product.category = configCategory.name;
        product.price = basePrices[configCategory.name] ?? 3000;
        product.options = {};
        product.image_url = '';
        product.available = true;
        product = await productRepo.save(product);
        console.log(`Created product: ${product.name}`);
      } else if (!product.category) {
        product.category = configCategory.name;
        await productRepo.save(product);
      }

      // Synchronise default flavors with configuration
      const existingFlavors = await flavorRepo.find({ where: { product: { id: product.id } } });
      const existingFlavorNames = new Set(existingFlavors.map((flavor) => flavor.name.toLowerCase()));

      for (const flavorOption of configCategory.flavors) {
        if (!existingFlavorNames.has(flavorOption.name.toLowerCase())) {
          const flavor = new ProductFlavor();
          flavor.product = product;
          flavor.name = flavorOption.name;
          flavor.price_modifier = flavorOption.priceModifier ?? 0;
          await flavorRepo.save(flavor);
          console.log(`  Added flavor ${flavor.name} for ${product.name}`);
        }
      }
    }

    // Seed page contents
    const defaultPages: Array<Partial<PageContent>> = [
      {
        slug: 'site-info',
        title: 'Informations du site',
        description: 'Paramètres généraux du site et identité de marque',
        content: {
          brandName: 'Assia',
          adminBrandName: 'Assia Admin',
          footerText: '© 2024 Assia. Tous droits réservés.',
          socialLinks: [
            {
              id: 'facebook',
              platform: 'facebook',
              url: 'https://facebook.com/assiapatisserie',
            },
            {
              id: 'instagram',
              platform: 'instagram',
              url: 'https://instagram.com/assiapatisserie',
            },
          ],
        },
        metadata: { version: 1 },
      },
      {
        slug: 'home',
        title: 'Page d\'accueil',
        description: 'Contenu de la page d\'accueil',
        content: {
          heroTitle: 'Découvrez Nos Gâteaux',
          heroSubtitle:
            'Fabriqués à la main avec passion par Assia, des recettes classiques aux créations sur mesure.',
        },
        metadata: { version: 1 },
      },
      {
        slug: 'a-propos',
        title: 'À propos',
        description: 'Présentation de la pâtisserie, de l\'équipe et des valeurs',
        content: {
          heroTitle: "À Propos d'Assia",
          heroSubtitle: "L'art de la pâtisserie artisanale depuis 2015",
          sections: [
            {
              id: 'history',
              title: 'Notre Histoire',
              paragraphs: [
                "Fondée en 2015 par Assia, une passionnée de pâtisserie formée dans les meilleures écoles de France, notre pâtisserie est née d'un rêve : créer des desserts qui allient tradition et innovation.",
                "Notre atelier artisanal situé au cœur de Paris utilise exclusivement les meilleurs ingrédients, soigneusement sélectionnés auprès de producteurs locaux et de fournisseurs de confiance.",
                "Chaque création est préparée à la main avec passion et dévotion, respectant les recettes traditionnelles tout en y apportant une touche contemporaine.",
              ],
            },
            {
              id: 'team',
              title: 'Notre Équipe',
              paragraphs: [
                "L'équipe d'Assia est composée de pâtissiers passionnés et talentueux, tous formés dans les meilleures écoles de pâtisserie française.",
                "Chaque membre partage notre vision : créer des desserts qui émerveillent et ravissent, en alliant savoir-faire traditionnel et innovation.",
                "Notre engagement envers la qualité nous pousse à nous perfectionner constamment, pour offrir des créations toujours plus raffinées.",
              ],
            },
            {
              id: 'commitment',
              title: 'Notre Engagement',
              paragraphs: [
                "Chez Assia, nous sommes engagés dans une démarche responsable et durable, privilégiant les producteurs locaux et les emballages recyclables.",
                "Nous partageons notre savoir-faire en organisant des ateliers de pâtisserie pour les passionnés de tous âges.",
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
        },
        metadata: { version: 1 },
      },
      {
        slug: 'contact',
        title: 'Contact',
        description: 'Coordonnées et informations pour contacter la pâtisserie',
        content: {
          heroTitle: 'Contactez Assia',
          heroSubtitle:
            "Nous serions ravis d'entendre parler de vous et de répondre à toutes vos questions",
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
              lines: [
                'Lundi - Vendredi : 7h30 - 19h30',
                'Samedi : 8h - 20h',
                'Dimanche : 9h - 18h',
              ],
              note: 'Fermé les jours fériés — Ouvert pendant les fêtes de fin d’année',
            },
          ],
          socialLinks: [
            {
              id: 'facebook',
              platform: 'facebook',
              url: 'https://facebook.com/assiapatisserie',
            },
            {
              id: 'instagram',
              platform: 'instagram',
              url: 'https://instagram.com/assiapatisserie',
            },
          ],
        },
        metadata: { version: 1 },
      },
    ];

    for (const pageData of defaultPages) {
      const existingPage = await contentRepo.findOne({ where: { slug: pageData.slug! } });
      if (!existingPage) {
        const page = new PageContent();
        Object.assign(page, pageData);
        await contentRepo.save(page);
        console.log(`Created page content: ${page.slug}`);
      }
    }

    // Seed admin user
    const adminUsername = process.env.DEFAULT_ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.DEFAULT_ADMIN_PASSWORD || 'admin123';

    const existingAdmin = await adminRepo.findOne({ where: { username: adminUsername } });
    if (!existingAdmin) {
      const admin = new AdminUser();
      admin.username = adminUsername;
      admin.password_hash = await AuthService.hashPassword(adminPassword);
      admin.role = AdminRole.SUPER_ADMIN;
      admin.twofa_enabled = false;
      await adminRepo.save(admin);
      console.log(`Created admin user: ${adminUsername} / ${adminPassword}`);
    } else {
      console.log(`Admin user ${adminUsername} already exists`);
    }

    console.log('Seed completed successfully');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    await AppDataSource.destroy();
    process.exit(1);
  }
}

seed();

